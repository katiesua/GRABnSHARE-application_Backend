import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import OrganiserDashboard from './pages/OrganiserDashboard/OrganiserDashboard.jsx'
import PostFoodNow from './pages/PostFoodNow/PostFoodNow.jsx'
import ScheduleFood from './pages/ScheduleFood/ScheduleFood.jsx'
import MyPosts from './pages/MyPosts/MyPosts.jsx'
import StudentHome from './pages/StudentHome/StudentHome.jsx'
import StudentLiveDetail from './pages/StudentLiveDetail/StudentLiveDetail.jsx'
import StudentUpcomingDetail from './pages/StudentUpcomingDetail/StudentUpcomingDetail.jsx'
import GoingConfirmation from './pages/GoingConfirmation/GoingConfirmation.jsx'
import ReminderConfirmation from './pages/ReminderConfirmation/ReminderConfirmation.jsx'

/* ── Route guards (Supabase Authentication) ───── */

function RequireAuth({ children, role }) {
  const { user, authLoading } = useAppContext()
  const location = useLocation()

  if (authLoading) return null
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }
  if (role && user.role !== role) {
    // Send each account to the dashboard it is authorised to use
    return <Navigate to={user.role === 'organiser' ? '/organiser' : '/student'} replace />
  }
  return children
}

function RedirectIfAuthenticated({ children }) {
  const { user, authLoading } = useAppContext()
  if (authLoading) return null
  if (user) {
    return <Navigate to={user.role === 'organiser' ? '/organiser' : '/student'} replace />
  }
  return children
}

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
        <Route path="/organiser" element={<RequireAuth role="organiser"><OrganiserDashboard /></RequireAuth>} />
        <Route path="/organiser/post-now" element={<RequireAuth role="organiser"><PostFoodNow /></RequireAuth>} />
        <Route path="/organiser/schedule" element={<RequireAuth role="organiser"><ScheduleFood /></RequireAuth>} />
        <Route path="/organiser/posts" element={<RequireAuth role="organiser"><MyPosts /></RequireAuth>} />
        <Route path="/student" element={<RequireAuth><StudentHome /></RequireAuth>} />
        <Route path="/student/live/:id" element={<RequireAuth><StudentLiveDetail /></RequireAuth>} />
        <Route path="/student/upcoming/:id" element={<RequireAuth><StudentUpcomingDetail /></RequireAuth>} />
        <Route path="/student/going-confirmed/:id" element={<RequireAuth><GoingConfirmation /></RequireAuth>} />
        <Route path="/student/reminder-set/:id" element={<RequireAuth><ReminderConfirmation /></RequireAuth>} />
      </Routes>
    </AppProvider>
  )
}

export default App