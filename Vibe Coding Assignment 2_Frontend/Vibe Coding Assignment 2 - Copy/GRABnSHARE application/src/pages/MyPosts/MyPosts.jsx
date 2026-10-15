import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import Button3D from '../../components/Button3D/Button3D.jsx'
import PostCard from './components/PostCard.jsx'
import UpdateAvailabilityModal from './components/UpdateAvailabilityModal.jsx'
import ConfirmAllGoneModal from './components/ConfirmAllGoneModal.jsx'
import { LiveIcon, UpcomingIcon, EmptyIcon } from './components/MyPostsIcons.jsx'
import './MyPosts.css'

function MyPosts() {
  const navigate = useNavigate()
  const { recentPosts, updatePost, markAllGone, user } = useAppContext()

  const [updateModalPost, setUpdateModalPost] = useState(null)
  const [confirmModalPost, setConfirmModalPost] = useState(null)

  /* ── Derived data ─────────────────────────── */
  // Data ownership: only the authenticated organiser's own posts
  const myPosts = recentPosts.filter(p => user && p.organiserId === user.id)
  const livePosts = myPosts.filter(p => p.type !== 'scheduled' && p.status !== 'Scheduled' && p.status !== 'Upcoming')
  const upcomingPosts = myPosts.filter(p => p.type === 'scheduled' || p.status === 'Scheduled' || p.status === 'Upcoming')

  /* ── Handlers ─────────────────────────────── */
  function handleUpdate(postId) {
    const post = myPosts.find(p => p.id === postId)
    if (post) setUpdateModalPost(post)
  }

  function handleConfirmUpdate(updates) {
    if (updateModalPost) {
      updatePost(updateModalPost.id, updates)
      setUpdateModalPost(null)
    }
  }

  function handleMarkAllGone(postId) {
    const post = myPosts.find(p => p.id === postId)
    if (post) setConfirmModalPost(post)
  }

  function handleConfirmAllGone() {
    if (confirmModalPost) {
      markAllGone(confirmModalPost.id)
      setConfirmModalPost(null)
    }
  }

  const isEmpty = myPosts.length === 0

  return (
    <div className="mp-page">
      <DashboardHeader />
      <main className="mp-main">
        {/* Hero Banner */}
        <section className="mp-hero" aria-label="My Posts">
          <div className="mp-hero-content">
            <Link to="/organiser" className="mp-back-link">← Back to Dashboard</Link>
            <h1 className="mp-hero-title">My Posts</h1>
            <p className="mp-hero-description">View and manage your live and upcoming food opportunities.</p>
          </div>
          <div className="mp-hero-image-wrapper" aria-hidden="true">
            <img className="mp-hero-image" src="/assets/campus.jpg" alt="" />
          </div>
          <div className="mp-hero-decor mp-hero-decor--1" aria-hidden="true"></div>
          <div className="mp-hero-decor mp-hero-decor--2" aria-hidden="true"></div>
        </section>

        {isEmpty ? (
          <section className="mp-empty" aria-label="No posts">
            <div className="mp-empty-icon"><EmptyIcon /></div>
            <strong className="mp-empty-title">No posts yet</strong>
            <p className="mp-empty-desc">Start by posting food now or scheduling an upcoming event.</p>
            <div className="mp-empty-actions">
              <Button3D label="Post Food Now" onClick={() => navigate('/organiser/post-now')} />
              <Button3D label="Schedule Food" variant="secondary" onClick={() => navigate('/organiser/schedule')} />
            </div>
          </section>
        ) : (
          <>
            {/* Summary Bar */}
            <div className="mp-summary" aria-label="Post counts">
              <div className="mp-summary-item">
                <span className="mp-summary-icon mp-summary-icon--live"><LiveIcon /></span>
                <span className="mp-summary-count">{livePosts.length}</span>
                <span className="mp-summary-label">Live {livePosts.length === 1 ? 'Post' : 'Posts'}</span>
              </div>
              <div className="mp-summary-divider" aria-hidden="true"></div>
              <div className="mp-summary-item">
                <span className="mp-summary-icon mp-summary-icon--upcoming"><UpcomingIcon /></span>
                <span className="mp-summary-count">{upcomingPosts.length}</span>
                <span className="mp-summary-label">Upcoming {upcomingPosts.length === 1 ? 'Post' : 'Posts'}</span>
              </div>
            </div>

            {/* Live Posts Section */}
            <section className="mp-section" aria-label="Live posts">
              <div className="mp-section-header">
                <span className="mp-section-icon"><LiveIcon /></span>
                <h2 className="mp-section-title">Live Posts</h2>
                <span className="mp-section-count">{livePosts.length}</span>
              </div>
              {livePosts.length > 0 ? (
                <div className="mp-posts-list">
                  {livePosts.map(post => (
                    <PostCard key={post.id} post={post} onUpdate={handleUpdate} onMarkAllGone={handleMarkAllGone} />
                  ))}
                </div>
              ) : (
                <p className="mp-section-empty">No live posts at the moment.</p>
              )}
            </section>

            {/* Upcoming Posts Section */}
            <section className="mp-section" aria-label="Upcoming posts">
              <div className="mp-section-header">
                <span className="mp-section-icon"><UpcomingIcon /></span>
                <h2 className="mp-section-title">Upcoming Posts</h2>
                <span className="mp-section-count">{upcomingPosts.length}</span>
              </div>
              {upcomingPosts.length > 0 ? (
                <div className="mp-posts-list">
                  {upcomingPosts.map(post => (
                    <PostCard key={post.id} post={post} onUpdate={handleUpdate} onMarkAllGone={handleMarkAllGone} />
                  ))}
                </div>
              ) : (
                <p className="mp-section-empty">No upcoming posts at the moment.</p>
              )}
            </section>

            {/* Back to Dashboard */}
            <div className="mp-footer-actions">
              <Button3D label="← Back to Dashboard" variant="secondary" onClick={() => navigate('/organiser')} />
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {updateModalPost && (
        <UpdateAvailabilityModal post={updateModalPost} onConfirm={handleConfirmUpdate} onCancel={() => setUpdateModalPost(null)} />
      )}
      {confirmModalPost && (
        <ConfirmAllGoneModal post={confirmModalPost} onConfirm={handleConfirmAllGone} onCancel={() => setConfirmModalPost(null)} />
      )}
    </div>
  )
}

export default MyPosts
