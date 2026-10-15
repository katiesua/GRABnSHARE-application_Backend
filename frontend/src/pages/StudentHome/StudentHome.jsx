import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import NowFeedCard from './components/NowFeedCard.jsx'
import UpcomingFeedCard from './components/UpcomingFeedCard.jsx'
import { NowIcon, UpcomingIcon, EmptyFeedIcon } from './components/StudentHomeIcons.jsx'
import './StudentHome.css'

function StudentHome() {
  const { recentPosts } = useAppContext()
  const [activeTab, setActiveTab] = useState('now')

  /* ── Derived data ─────────────────────────── */
  const livePosts = recentPosts.filter(
    p => p.type !== 'scheduled' && p.status !== 'Scheduled' && p.status !== 'Upcoming' && p.status !== 'All Gone'
  )
  const upcomingPosts = recentPosts.filter(
    p => p.type === 'scheduled' || p.status === 'Scheduled' || p.status === 'Upcoming'
  )

  return (
    <div className="st-page">
      <DashboardHeader role="student" homePath="/student" />

      <main className="st-main">
        {/* Hero Banner */}
        <section className="st-hero" aria-label="Discover Free Food">
          <div className="st-hero-content">
            <Link to="/" className="st-back-link">← Back to Login</Link>
            <h1 className="st-hero-title">Discover Free Food</h1>
            <p className="st-hero-description">
              Free food opportunities available on La Trobe campus right now and coming soon.
            </p>
          </div>
          <div className="st-hero-image-wrapper" aria-hidden="true">
            <img className="st-hero-image" src="/assets/campus.jpg" alt="" />
          </div>
          <div className="st-hero-decor st-hero-decor--1" aria-hidden="true"></div>
          <div className="st-hero-decor st-hero-decor--2" aria-hidden="true"></div>
        </section>

        {/* Tab Bar */}
        <div className="st-tabs" role="tablist" aria-label="Food opportunity tabs">
          <button
            className={`st-tab ${activeTab === 'now' ? 'st-tab--active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'now'}
            aria-controls="st-tabpanel-now"
            id="st-tab-now"
            onClick={() => setActiveTab('now')}
          >
            <NowIcon />
            <span className="st-tab-label">NOW</span>
            <span className="st-tab-count">{livePosts.length}</span>
          </button>
          <button
            className={`st-tab ${activeTab === 'upcoming' ? 'st-tab--active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'upcoming'}
            aria-controls="st-tabpanel-upcoming"
            id="st-tab-upcoming"
            onClick={() => setActiveTab('upcoming')}
          >
            <UpcomingIcon />
            <span className="st-tab-label">UPCOMING</span>
            <span className="st-tab-count">{upcomingPosts.length}</span>
          </button>
        </div>

        {/* NOW Tab Panel */}
        {activeTab === 'now' && (
          <section
            className="st-tabpanel"
            role="tabpanel"
            id="st-tabpanel-now"
            aria-labelledby="st-tab-now"
          >
            {livePosts.length > 0 ? (
              <div className="st-feed">
                {livePosts.map(post => (
                  <NowFeedCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="st-empty">
                <div className="st-empty-icon"><EmptyFeedIcon /></div>
                <strong className="st-empty-title">No food available right now</strong>
                <p className="st-empty-desc">Check back soon — organisers post free food throughout the day.</p>
              </div>
            )}
          </section>
        )}

        {/* UPCOMING Tab Panel */}
        {activeTab === 'upcoming' && (
          <section
            className="st-tabpanel"
            role="tabpanel"
            id="st-tabpanel-upcoming"
            aria-labelledby="st-tab-upcoming"
          >
            {upcomingPosts.length > 0 ? (
              <div className="st-feed">
                {upcomingPosts.map(post => (
                  <UpcomingFeedCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="st-empty">
                <div className="st-empty-icon"><EmptyFeedIcon /></div>
                <strong className="st-empty-title">No upcoming events scheduled</strong>
                <p className="st-empty-desc">Organisers are planning new opportunities — check back later.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default StudentHome
