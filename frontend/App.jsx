import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
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

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/organiser" element={<OrganiserDashboard />} />
        <Route path="/organiser/post-now" element={<PostFoodNow />} />
        <Route path="/organiser/schedule" element={<ScheduleFood />} />
        <Route path="/organiser/posts" element={<MyPosts />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/student/live/:id" element={<StudentLiveDetail />} />
        <Route path="/student/upcoming/:id" element={<StudentUpcomingDetail />} />
        <Route path="/student/going-confirmed/:id" element={<GoingConfirmation />} />
        <Route path="/student/reminder-set/:id" element={<ReminderConfirmation />} />
      </Routes>
    </AppProvider>
  )
}

export default App