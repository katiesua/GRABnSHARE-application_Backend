import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import Button3D from '../../components/Button3D/Button3D.jsx'
import { campusOrganisations, organiserRoles, dietaryOptions } from '../PostFoodNow/data/postFoodData.js'
import { formatDate, formatTime12 } from '../../lib/formatUtils.js'
import { LocationPinIcon, ClockIcon, ServesIcon, CalendarIcon, DietIcon, PersonIcon, NotesIcon, DirectionsIcon, BellIcon, CheckCircleIcon } from '../StudentDetail/StudentDetailIcons.jsx'
import './StudentUpcomingDetail.css'

function StudentUpcomingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recentPosts, remindedPosts, setReminder } = useAppContext()
  const post = recentPosts.find(p => String(p.id) === String(id))

  if (!post) {
    return (
      <div className="sud-page">
        <DashboardHeader role="student" homePath="/student" />
        <main className="sud-main">
          <section className="sud-not-found">
            <h1 className="sud-not-found-title">Event not found</h1>
            <p className="sud-not-found-desc">This upcoming event may have been removed.</p>
            <Button3D label="← Back to Discover" variant="secondary" onClick={() => navigate('/student')} />
          </section>
        </main>
      </div>
    )
  }

  const isAlreadyReminded = remindedPosts.includes(post.id)
  const headline = post.eventName || post.foodAvailable
  const orgLabel = campusOrganisations.find(o => o.value === post.campusOrganisation)?.label || post.campusOrganisation
  const roleLabel = organiserRoles.find(r => r.value === post.organiserRole)?.label || post.organiserRole
  const dietLabel = post.dietaryInformation && post.dietaryInformation !== 'not-specified'
    ? dietaryOptions.find(d => d.value === post.dietaryInformation)?.label : null

  function getDirectionsUrl() {
    const dest = post.pickupPoint
      ? `${post.pickupPoint}, ${post.collectionLocation}, La Trobe University`
      : `${post.collectionLocation}, La Trobe University`
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
  }

  function handleReminder() {
    if (!isAlreadyReminded) {
      setReminder(post.id)
      navigate(`/student/reminder-set/${post.id}`)
    }
  }

  return (
    <div className="sud-page">
      <DashboardHeader role="student" homePath="/student" />
      <main className="sud-main">
        <section className="sud-hero" aria-label="Upcoming event details">
          <div className="sud-hero-content">
            <Link to="/student" className="sud-back-link">← Back to Discover</Link>
            <h1 className="sud-hero-title">{headline}</h1>
            <p className="sud-hero-org">{orgLabel}</p>
            <div className="sud-badge"><span className="sud-badge-pill"><span className="sud-badge-dot" aria-hidden="true"></span>Upcoming</span></div>
          </div>
          <div className="sud-hero-image-wrapper" aria-hidden="true"><img className="sud-hero-image" src="/assets/campus.jpg" alt="" /></div>
          <div className="sud-hero-decor sud-hero-decor--1" aria-hidden="true"></div>
          <div className="sud-hero-decor sud-hero-decor--2" aria-hidden="true"></div>
        </section>

        <section className="sud-detail-card" aria-label="Event details">
          {post.foodDescription && (
            <div className="sud-section"><h2 className="sud-section-title">About this event</h2><p className="sud-section-text">{post.foodDescription}</p></div>
          )}
          <div className="sud-section">
            <h2 className="sud-section-title">Schedule &amp; collection</h2>
            <div className="sud-info-grid">
              {post.scheduledDate && <div className="sud-info-item"><span className="sud-info-icon"><CalendarIcon /></span><div className="sud-info-content"><span className="sud-info-label">Scheduled Date</span><span className="sud-info-value sud-info-value--highlight">{formatDate(post.scheduledDate)}</span></div></div>}
              {post.collectionStarts && <div className="sud-info-item"><span className="sud-info-icon"><ClockIcon /></span><div className="sud-info-content"><span className="sud-info-label">Collection Time</span><span className="sud-info-value">{formatTime12(post.collectionStarts)} – {formatTime12(post.collectionCloses)}</span></div></div>}
              <div className="sud-info-item"><span className="sud-info-icon"><LocationPinIcon /></span><div className="sud-info-content"><span className="sud-info-label">Location</span><span className="sud-info-value">{post.collectionLocation}</span></div></div>
              {post.pickupPoint && <div className="sud-info-item"><span className="sud-info-icon"><LocationPinIcon /></span><div className="sud-info-content"><span className="sud-info-label">Pickup Point</span><span className="sud-info-value">{post.pickupPoint}</span></div></div>}
              <div className="sud-info-item"><span className="sud-info-icon"><ServesIcon /></span><div className="sud-info-content"><span className="sud-info-label">Estimated Serves</span><span className="sud-info-value">{post.estimatedServes}</span></div></div>
              {dietLabel && <div className="sud-info-item"><span className="sud-info-icon"><DietIcon /></span><div className="sud-info-content"><span className="sud-info-label">Dietary Info</span><span className="sud-info-value">{dietLabel}</span></div></div>}
            </div>
          </div>
          {post.collectionNotes && <div className="sud-section"><h2 className="sud-section-title">Collection notes</h2><div className="sud-notes"><span className="sud-notes-icon"><NotesIcon /></span><p className="sud-notes-text">{post.collectionNotes}</p></div></div>}
          <div className="sud-section"><h2 className="sud-section-title">Verified organiser</h2><div className="sud-organiser"><span className="sud-organiser-icon"><PersonIcon /></span><div className="sud-organiser-content"><span className="sud-organiser-name">{post.organiserName}</span><span className="sud-organiser-detail">{roleLabel} • {orgLabel}</span></div></div></div>
        </section>

        <section className="sud-actions" aria-label="Actions">
          {!isAlreadyReminded && <Button3D label="Remind Me" onClick={handleReminder} icon={<BellIcon />} />}
          {isAlreadyReminded && <Button3D label="Reminder Set ✓" disabled icon={<CheckCircleIcon />} />}
          <Button3D label="Get Directions" variant="secondary" onClick={() => window.open(getDirectionsUrl(), '_blank', 'noopener,noreferrer')} icon={<DirectionsIcon />} />
        </section>

        <div className="sud-disclaimer" aria-label="Disclaimer">
          <p>Dietary information is provided by the organiser and does not constitute a food-safety guarantee.</p>
        </div>
      </main>
    </div>
  )
}

export default StudentUpcomingDetail

