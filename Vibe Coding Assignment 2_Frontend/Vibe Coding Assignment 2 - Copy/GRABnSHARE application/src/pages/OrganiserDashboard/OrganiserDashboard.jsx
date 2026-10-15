import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import Button3D from '../../components/Button3D/Button3D.jsx'
import './OrganiserDashboard.css'

/* ── Inline SVG icon components ───────────── */
function FoodIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function SmallFoodIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  )
}

function SmallCalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function PostsSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M6.75 3.75L11.25 9L6.75 14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Main Dashboard Component ─────────────── */
function OrganiserDashboard() {
  const navigate = useNavigate()
  const { stats } = useAppContext()

  return (
    <div className="od-page">
      <DashboardHeader />
      <main className="od-main">
        {/* ── Hero Banner ──────────────────── */}
        <section className="od-hero" aria-label="Dashboard welcome">
          <div className="od-hero-content">
            <span className="od-hero-welcome">Welcome, Organiser</span>
            <h1 className="od-hero-title">Organiser Dashboard</h1>
            <p className="od-hero-description">
              Share and manage free-food opportunities across the La Trobe campus.
            </p>
          </div>
          <div className="od-hero-image-wrapper" aria-hidden="true">
            <img className="od-hero-image" src="/assets/campus.jpg" alt="" />
          </div>
          <div className="od-hero-decor od-hero-decor--1" aria-hidden="true"></div>
          <div className="od-hero-decor od-hero-decor--2" aria-hidden="true"></div>
        </section>

        {/* ── Action Cards ─────────────────── */}
        <section className="od-actions" aria-label="Quick actions">
          <div className="od-actions-grid">
            <article className="od-action-card od-action-card--red">
              <div className="od-action-card-icon"><FoodIcon /></div>
              <h2 className="od-action-card-title">Post Food Now</h2>
              <p className="od-action-card-desc">Share surplus food that is available for immediate collection.</p>
              <Button3D label="Post Food Now" onClick={() => navigate('/organiser/post-now')} icon={<ArrowRight />} />
            </article>
            <article className="od-action-card od-action-card--blue">
              <div className="od-action-card-icon"><CalendarIcon /></div>
              <h2 className="od-action-card-title">Schedule Food</h2>
              <p className="od-action-card-desc">Create a planned upcoming free-food opportunity for students.</p>
              <Button3D label="Schedule Food" onClick={() => navigate('/organiser/schedule')} icon={<ArrowRight />} />
            </article>
            <article className="od-action-card od-action-card--green">
              <div className="od-action-card-icon"><ClipboardIcon /></div>
              <h2 className="od-action-card-title">My Posts</h2>
              <p className="od-action-card-desc">View and manage your live and scheduled posts.</p>
              <Button3D label="View My Posts" onClick={() => navigate('/organiser/posts')} icon={<ArrowRight />} />
            </article>
          </div>
        </section>

        {/* ── Activity Summary ─────────────── */}
        <section className="od-activity" aria-label="Activity summary">
          <div className="od-activity-card">
            <div className="od-activity-grid">
              <div className="od-activity-metric">
                <div className="od-activity-metric-icon od-activity-metric-icon--calendar"><SmallCalendarIcon /></div>
                <span className="od-activity-metric-number">{stats.activeEvents}</span>
                <span className="od-activity-metric-label">Active Events</span>
                <span className="od-activity-metric-sub">Currently available for students</span>
              </div>
              <div className="od-activity-divider" aria-hidden="true"></div>
              <div className="od-activity-metric">
                <div className="od-activity-metric-icon od-activity-metric-icon--food"><SmallFoodIcon /></div>
                <span className="od-activity-metric-number">{stats.foodItemsShared}</span>
                <span className="od-activity-metric-label">Food Items Shared</span>
                <span className="od-activity-metric-sub">Total items provided</span>
              </div>
              <div className="od-activity-divider" aria-hidden="true"></div>
              <div className="od-activity-metric">
                <div className="od-activity-metric-icon od-activity-metric-icon--users"><UsersIcon /></div>
                <span className="od-activity-metric-number">{stats.studentsReached}</span>
                <span className="od-activity-metric-label">Students Reached</span>
                <span className="od-activity-metric-sub">Estimated number of students</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Recent Posts ─────────────────── */}
        <section className="od-recent" aria-label="Recent posts">
          <div className="od-recent-card">
            <div className="od-recent-header">
              <div className="od-recent-header-left"><PostsSmallIcon /><h2 className="od-recent-header-title">Recent Posts</h2></div>
              <button className="od-recent-view-all" type="button" onClick={() => navigate('/organiser/posts')}>
                View All <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="od-recent-empty">
              <div className="od-recent-empty-icon"><DocumentIcon /></div>
              <strong className="od-recent-empty-title">No posts yet</strong>
              <p className="od-recent-empty-desc">Start by posting food now or scheduling an event.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default OrganiserDashboard