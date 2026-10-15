import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import FormCard from '../../components/FormCard/FormCard.jsx'
import FormInput from '../../components/FormInput/FormInput.jsx'
import Button3D from '../../components/Button3D/Button3D.jsx'
import RoleToggle from '../../components/RoleToggle/RoleToggle.jsx'
import TextMarquee from '../../components/ui/TextMarquee.jsx'
import './LoginPage.css'

/* La Trobe University email formats (mirrors the backend rules) */
const STUDENT_EMAIL_PATTERN = /^\d+@students\.latrobe\.edu\.au$/i
const STAFF_EMAIL_PATTERN = /^[A-Za-z0-9._-]+@latrobe\.edu\.au$/i

function isLatrobeEmail(email) {
  return STUDENT_EMAIL_PATTERN.test(email) || STAFF_EMAIL_PATTERN.test(email)
}

function apiErrorMessage(err) {
  return String(err?.message || 'Something went wrong').replace(/^API \d+:\s*/, '')
}

function LoginPage() {
  const navigate = useNavigate()
  const { login, signup } = useAppContext()
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'verify'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleEmailChange(event) {
    setEmail(event.target.value)
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value)
  }

  function handleRoleChange(newRole) {
    setRole(newRole)
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      // Follow the role selected at registration (stored on the account)
      navigate(user.role === 'organiser' ? '/organiser' : '/student')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignup(event) {
    event.preventDefault()
    setError('')
    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!isLatrobeEmail(email)) {
      setError('Use your La Trobe email: students <student id>@students.latrobe.edu.au, staff <username>@latrobe.edu.au')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await signup({ fullName: fullName.trim(), email, password, role })
      setMode('verify')
      setNotice('Registration received. A verification link has been sent to your La Trobe email address. Please verify your email, then sign in.')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      {/* Decorative corner shapes */}
      <div className="login-decor-top" aria-hidden="true"></div>
      <div className="login-decor-bottom" aria-hidden="true"></div>

      {/* Hero panel — branding and tagline */}
      <section className="login-hero" aria-label="GRABnSHARE branding">
        <div className="login-hero-content">
          <img
            className="login-hero-logo"
            src="/assets/grabnshare-logo.png"
            alt="GRABnSHARE"
          />

          <div className="login-hero-tagline">
            <TextMarquee
              delay={500}
              baseVelocity={-2}
              clasname="login-hero-tagline-text"
            >
              Free Food
            </TextMarquee>
            <TextMarquee
              delay={800}
              baseVelocity={2}
              clasname="login-hero-tagline-text"
            >
              Found You
            </TextMarquee>
          </div>

          <p className="login-hero-description">
            Connecting La Trobe students with free food opportunities on campus.
          </p>

          <div className="login-hero-features">
            <div className="login-hero-feature">
              <svg className="login-hero-feature-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#E2231B"/>
              </svg>
              <div className="login-hero-feature-text">
                <strong>For Students</strong>
                <p>Discover free food on campus</p>
              </div>
            </div>
            <div className="login-hero-feature-divider" aria-hidden="true"></div>
            <div className="login-hero-feature">
              <svg className="login-hero-feature-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 11v2h4v-2h-4zM16 17.61c.96.71 2.21.63 3.08-.24 1.07-1.07 1.07-2.81 0-3.88l-1.44-1.44-2.83 2.83 1.19 2.73zM5.64 11l-2.83-2.83-1.44 1.44C.29 10.68.29 12.42 1.36 13.5c.87.87 2.12.95 3.08.24L5.64 11zM12 1L9 9H2l3.69 5.25L4 21h16l-1.69-6.75L22 9h-7L12 1z" fill="#E2231B"/>
              </svg>
              <div className="login-hero-feature-text">
                <strong>For Organisers</strong>
                <p>Share schedule &amp; surplus food</p>
              </div>
            </div>
          </div>

          <div className="login-hero-campus-fade">
            <img
              className="login-hero-campus-image"
              src="/assets/campus.jpg"
              alt="La Trobe University campus"
              onError={(e) => { e.target.parentElement.style.display = 'none' }}
            />
          </div>
        </div>
      </section>

      {/* Form panel — login / sign up form */}
      <main className="login-form-panel">
        <FormCard>
          <header className="login-form-header">
            <h2 className="login-form-title">Welcome to GRABnSHARE</h2>
            <p className="login-form-subtitle">
              {mode === 'signup'
                ? 'Create your account with your La Trobe details'
                : 'Sign in with your La Trobe details to continue'}
            </p>
          </header>

          {mode === 'verify' ? (
            <div className="login-auth-notice" role="status">
              {notice}
            </div>
          ) : (
            <form className="login-form" onSubmit={mode === 'signup' ? handleSignup : handleLogin}>
              {mode === 'signup' && (
                <FormInput
                  label="Full Name"
                  type="text"
                  id="fullName"
                  placeholder="e.g. Katie Sua"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              )}

              <FormInput
                label="University Email"
                type="email"
                id="email"
                placeholder="student@latrobe.edu.au"
                value={email}
                onChange={handleEmailChange}
                required
              />
              {mode === 'signup' && (
                <p className="login-auth-hint">
                  Students: <strong>12345678@students.latrobe.edu.au</strong> &middot; Staff: <strong>username@latrobe.edu.au</strong>
                </p>
              )}

              <FormInput
                label="Password"
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
              />

              {mode === 'signup' && (
                <FormInput
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              )}

              {mode === 'signup' ? (
                <RoleToggle
                  selectedRole={role}
                  onRoleChange={handleRoleChange}
                  legend="Account role"
                />
              ) : (
                <RoleToggle
                  selectedRole={role}
                  onRoleChange={handleRoleChange}
                />
              )}

              {error && (
                <p className="login-auth-error" role="alert">{error}</p>
              )}

              <Button3D
                label={submitting ? 'Please wait\u2026' : (mode === 'signup' ? 'Create Account' : 'Login')}
                type="submit"
                disabled={submitting}
                loading={submitting}
              />
            </form>
          )}

          <div className="login-auth-switch">
            {mode === 'verify' ? (
              <button type="button" className="login-auth-switch-btn" onClick={() => switchMode('login')}>
                Back to sign in
              </button>
            ) : mode === 'signup' ? (
              <span>
                Already have an account?{' '}
                <button type="button" className="login-auth-switch-btn" onClick={() => switchMode('login')}>
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                Need an account?{' '}
                <button type="button" className="login-auth-switch-btn" onClick={() => switchMode('signup')}>
                  Sign up
                </button>
              </span>
            )}
          </div>

          <div className="login-privacy-notice" aria-label="Privacy notice">
            <div className="login-privacy-divider"></div>
            <p className="login-privacy-content">
              <svg className="login-privacy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" fill="#9CA3AF"/>
              </svg>
              La Trobe students and authorised organisers only. This demonstration does not store your login details.
            </p>
          </div>
        </FormCard>
      </main>
    </div>
  )
}

export default LoginPage