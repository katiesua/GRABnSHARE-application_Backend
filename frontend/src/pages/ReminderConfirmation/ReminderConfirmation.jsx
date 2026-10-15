import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import Button3D from '../../components/Button3D/Button3D.jsx'
import { campusOrganisations } from '../PostFoodNow/data/postFoodData.js'
import { formatDate, formatTime12 } from '../../lib/formatUtils.js'
import { SuccessIcon, DirectionsIcon, LocationPinIcon, ClockIcon, CalendarIcon } from '../StudentDetail/StudentDetailIcons.jsx'
import './ReminderConfirmation.css'

function ReminderConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recentPosts, setReminder } = useAppContext()
  const post = recentPosts.find(p => String(p.id) === String(id))

  if (!post) {
    return (
      <div className="rc-page">
        <DashboardHeader role="student" homePath="/student" />
        <main className="rc-main">
          <section className="rc-not-found">
            <h1 className="rc-not-found-title">Event not found</h1>
            <p className="rc-not-found-desc">This upcoming event may no longer be available.</p>
            <Button3D label="← Back to Discover" variant="secondary" onClick={() => navigate('/student')} />
          </section>
        </main>
      </div>
    )
  }

  setReminder(post.id)

  const headline = post.eventName || post.foodAvailable
  const orgLabel = campusOrganisations.find(o => o.value === post.campusOrganisation)?.label || post.campusOrganisation

  function getDirectionsUrl() {
    const dest = post.pickupPoint
      ? `${post.pickupPoint}, ${post.collectionLocation}, La Trobe University`
      : `${post.collectionLocation}, La Trobe University`
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
  }

  return (
    <div className="rc-page">
      <DashboardHeader role="student" homePath="/student" />
      <main className="rc-main">
        <section className="rc-confirm" aria-label="Reminder confirmation">
          <div className="rc-confirm-icon"><SuccessIcon /></div>
          <h1 className="rc-confirm-title">Reminder Set!</h1>
          <p className="rc-confirm-message">You'll be reminded about this upcoming food opportunity.</p>

          <div className="rc-confirm-card">
            <h3 className="rc-confirm-card-title">Event Summary</h3>
            <div className="rc-confirm-details">
              <div className="rc-confirm-row"><span className="rc-confirm-label">Event</span><span className="rc-confirm-value">{headline}</span></div>
              <div className="rc-confirm-row"><span className="rc-confirm-label">From</span><span className="rc-confirm-value">{orgLabel}</span></div>
              <div className="rc-confirm-divider" aria-hidden="true"></div>
              {post.scheduledDate && <div className="rc-confirm-row"><span className="rc-confirm-icon-row"><CalendarIcon /></span><span className="rc-confirm-label">Date</span><span className="rc-confirm-value rc-confirm-value--highlight">{formatDate(post.scheduledDate)}</span></div>}
              {post.collectionStarts && <div className="rc-confirm-row"><span className="rc-confirm-icon-row"><ClockIcon /></span><span className="rc-confirm-label">Time</span><span className="rc-confirm-value">{formatTime12(post.collectionStarts)} – {formatTime12(post.collectionCloses)}</span></div>}
              <div className="rc-confirm-row"><span className="rc-confirm-icon-row"><LocationPinIcon /></span><span className="rc-confirm-label">Location</span><span className="rc-confirm-value">{post.collectionLocation}</span></div>
            </div>
          </div>

          <div className="rc-confirm-actions">
            <Button3D label="Get Directions" onClick={() => window.open(getDirectionsUrl(), '_blank', 'noopener,noreferrer')} icon={<DirectionsIcon />} />
            <Link to="/student" className="rc-confirm-back-link">← Back to Discover</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ReminderConfirmation
