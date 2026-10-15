-- ============================================================
-- GrabnShare Database Setup Script
-- Run this script to create all tables, RLS policies, and triggers
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'organiser')),
    department TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Stores user profile information linked to Supabase Auth';

-- 2. FOOD_POSTS TABLE
CREATE TABLE IF NOT EXISTS public.food_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organiser_name TEXT NOT NULL,
    department TEXT,
    employment_status TEXT,
    post_type TEXT NOT NULL CHECK (post_type IN ('immediate', 'scheduled')),
    food_name TEXT NOT NULL,
    description TEXT,
    quantity TEXT,
    event_name TEXT,
    collection_location TEXT NOT NULL,
    pickup_point TEXT,
    collection_instructions TEXT,
    dietary_information TEXT,
    available_from TIMESTAMPTZ NOT NULL,
    available_until TIMESTAMPTZ NOT NULL,
    scheduled_for TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('scheduled', 'available', 'completed')),
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.food_posts IS 'Stores food posts for immediate collection and scheduled events';

-- 3. FOOD_CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.food_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_post_id UUID NOT NULL REFERENCES public.food_posts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'going',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (food_post_id, student_id)
);

COMMENT ON TABLE public.food_claims IS 'Stores student interactions (I''m Going) with food posts';

-- 4. FOOD_REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.food_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_post_id UUID NOT NULL REFERENCES public.food_posts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (food_post_id, student_id)
);

COMMENT ON TABLE public.food_reminders IS 'Stores student reminder requests for upcoming food availability';

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_reminders ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- FOOD_POSTS Policies
DROP POLICY IF EXISTS "Everyone can view food posts" ON public.food_posts;
CREATE POLICY "Everyone can view food posts" ON public.food_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organisers can insert own posts" ON public.food_posts;
CREATE POLICY "Organisers can insert own posts" ON public.food_posts
    FOR INSERT WITH CHECK (auth.uid() = organiser_id);

DROP POLICY IF EXISTS "Organisers can update own posts" ON public.food_posts;
CREATE POLICY "Organisers can update own posts" ON public.food_posts
    FOR UPDATE USING (auth.uid() = organiser_id);

DROP POLICY IF EXISTS "Organisers can delete own posts" ON public.food_posts;
CREATE POLICY "Organisers can delete own posts" ON public.food_posts
    FOR DELETE USING (auth.uid() = organiser_id);

-- FOOD_CLAIMS Policies
DROP POLICY IF EXISTS "Students can view own claims" ON public.food_claims;
CREATE POLICY "Students can view own claims" ON public.food_claims
    FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Organisers can view claims on own posts" ON public.food_claims;
CREATE POLICY "Organisers can view claims on own posts" ON public.food_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.food_posts
            WHERE food_posts.id = food_claims.food_post_id
            AND food_posts.organiser_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Students can insert own claims" ON public.food_claims;
CREATE POLICY "Students can insert own claims" ON public.food_claims
    FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own claims" ON public.food_claims;
CREATE POLICY "Students can update own claims" ON public.food_claims
    FOR UPDATE USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete own claims" ON public.food_claims;
CREATE POLICY "Students can delete own claims" ON public.food_claims
    FOR DELETE USING (auth.uid() = student_id);

-- FOOD_REMINDERS Policies
DROP POLICY IF EXISTS "Students can view own reminders" ON public.food_reminders;
CREATE POLICY "Students can view own reminders" ON public.food_reminders
    FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert own reminders" ON public.food_reminders;
CREATE POLICY "Students can insert own reminders" ON public.food_reminders
    FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete own reminders" ON public.food_reminders;
CREATE POLICY "Students can delete own reminders" ON public.food_reminders
    FOR DELETE USING (auth.uid() = student_id);

-- ============================================================
-- AUTH RULES & TRIGGERS (Supabase Authentication)
-- ============================================================

-- RULE: Accepted La Trobe University email formats
--   Students: <numeric student id>@students.latrobe.edu.au
--   Staff:    <username>@latrobe.edu.au (excludes the students subdomain)
CREATE OR REPLACE FUNCTION public.is_latrobe_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT email IS NOT NULL AND (
        email ~* '^[0-9]+@students\.latrobe\.edu\.au$'
        OR email ~* '^[A-Za-z0-9._-]+@latrobe\.edu\.au$'
    );
$$;

-- TRIGGER: Auto-create profile on Supabase Auth signup
--   * Enforces the La Trobe email formats at the database level
--   * Assigns the account role selected at sign-up ('student' or 'organiser',
--     read from raw_user_meta_data; anything else defaults to 'student')
--   * ON CONFLICT DO NOTHING prevents duplicate profiles (profiles.id is the PK)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    full_name TEXT;
    requested_role TEXT;
BEGIN
    IF NOT public.is_latrobe_email(NEW.email) THEN
        RAISE EXCEPTION 'Email % is not an accepted La Trobe University address (students: <id>@students.latrobe.edu.au, staff: <username>@latrobe.edu.au)', NEW.email;
    END IF;

    full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
        ''
    );

    requested_role := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'role', '')));
    IF requested_role NOT IN ('student', 'organiser') THEN
        requested_role := 'student';
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (NEW.id, full_name, NEW.email, requested_role)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MIGRATION: Add new columns for existing databases
-- ============================================================

ALTER TABLE public.food_posts ADD COLUMN IF NOT EXISTS pickup_point TEXT;
ALTER TABLE public.food_posts ADD COLUMN IF NOT EXISTS dietary_information TEXT;

-- ============================================================
-- TRIGGER: Keep profiles in sync when a Supabase Auth user is updated
--   (email / full name changes; the same email-format rule applies)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email AND NOT public.is_latrobe_email(NEW.email) THEN
        RAISE EXCEPTION 'Email % is not an accepted La Trobe University address', NEW.email;
    END IF;

    UPDATE public.profiles
    SET email = NEW.email,
        full_name = COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
            NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
            full_name
        )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- ============================================================
-- RULE: Users must not be able to change their account role
--   The role is chosen at registration ('student' or 'organiser') and is
--   written by the handle_new_user signup trigger, which runs with
--   auth.uid() IS NULL. Any role INSERT/UPDATE attempted through a client
--   connection (auth.uid() IS NOT NULL) is rejected, so a role can only be
--   changed administratively, from the Supabase SQL console / service role:
--     UPDATE public.profiles SET role = 'organiser' WHERE id = '<user uuid>';
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.role IS DISTINCT FROM 'student' AND auth.uid() IS NOT NULL THEN
            RAISE EXCEPTION 'Role changes must be authorised by an administrator';
        END IF;
    ELSIF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL THEN
        RAISE EXCEPTION 'Role changes must be authorised by an administrator';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_role_authorisation ON public.profiles;
CREATE TRIGGER enforce_role_authorisation
    BEFORE INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

-- ============================================================
-- TRIGGER: Auto-manage updated_at timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_food_posts_updated_at ON public.food_posts;
CREATE TRIGGER set_food_posts_updated_at
    BEFORE UPDATE ON public.food_posts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BACKFILL (additive only): create profiles for any auth users that
-- pre-date the signup trigger. Existing profiles and records (including
-- the demonstration profiles) are never modified or deleted.
-- ============================================================

INSERT INTO public.profiles (id, full_name, email, role)
SELECT
    u.id,
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
        ''
    ),
    u.email,
    CASE
        WHEN LOWER(TRIM(COALESCE(u.raw_user_meta_data ->> 'role', ''))) IN ('student', 'organiser')
        THEN LOWER(TRIM(COALESCE(u.raw_user_meta_data ->> 'role', '')))
        ELSE 'student'
    END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

