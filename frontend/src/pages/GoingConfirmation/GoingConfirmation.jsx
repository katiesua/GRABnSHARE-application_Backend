import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import Button3D from '../../components/Button3D/Button3D.jsx'
import { campusOrganisations } from '../PostFoodNow/data/postFoodData.js'
import { formatTime12 } from '../../lib/formatUtils.js'
import { SuccessIcon, DirectionsIcon, LocationPinIcon, ClockIcon, ServesIcon } from '../StudentDetail/StudentDetailIcons.jsx'
import './GoingConfirmation.css'

function GoingConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recentPosts, markGoing } = useAppContext()
  const post = recentPosts.find(p => String(p.id) === String(id))

  if (!post) {
    return (
      <div className="gc-page">
        <DashboardHeader role="student" homePath="/student" />
        <main className="gc-main">
          <section className="gc-not-found">
            <h1 className="gc-not-found-title">Post not found</h1>
            <p className="gc-not-found-desc">This food opportunity may no longer be available.</p>
            <Button3D label="← Back to Discover" variant="secondary" onClick={() => navigate('/student')} />
          </section>
        </main>
      </div>
    )
  }

  markGoing(post.id)

  const orgLabel = campusOrganisations.find(o => o.value === post.campusOrganisation)?.label || post.campusOrganisation

  function getDirectionsUrl() {
    const dest = post.pickupPoint
      ? `${post.pickupPoint}, ${post.collectionLocation}, La Trobe University`
      : `${post.collectionLocation}, La Trobe University`
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
  }

  return (
    <div className="gc-page">
      <DashboardHeader role="student" homePath="/student" />
      <main className="gc-main">
        <section className="gc-confirm" aria-label="Going confirmation">
          <div className="gc-confirm-icon"><SuccessIcon /></div>
          <h1 className="gc-confirm-title">You're Going!</h1>
          <p className="gc-confirm-message">Great choice! Head to the collection point to pick up your free food.</p>

          <div className="gc-confirm-card">
            <h3 className="gc-confirm-card-title">Collection Summary</h3>
            <div className="gc-confirm-details">
              <div className="gc-confirm-row"><span className="gc-confirm-label">What's Available</span><span className="gc-confirm-value">{post.foodAvailable}</span></div>
              <div className="gc-confirm-row"><span className="gc-confirm-label">From</span><span className="gc-confirm-value">{orgLabel}</span></div>
              <div className="gc-confirm-divider" aria-hidden="true"></div>
              <div className="gc-confirm-row"><span className="gc-confirm-icon-row"><LocationPinIcon /></span><span className="gc-confirm-label">Location</span><span className="gc-confirm-value">{post.collectionLocation}</span></div>
              {post.pickupPoint && <div className="gc-confirm-row"><span className="gc-confirm-icon-row"><LocationPinIcon /></span><span className="gc-confirm-label">Pickup Point</span><span className="gc-confirm-value">{post.pickupPoint}</span></div>}
              <div className="gc-confirm-row"><span className="gc-confirm-icon-row"><ClockIcon /></span><span className="gc-confirm-label">Collection Closes</span><span className="gc-confirm-value">{formatTime12(post.collectionCloses)}</span></div>
              <div className="gc-confirm-row"><span className="gc-confirm-icon-row"><ServesIcon /></span><span className="gc-confirm-label">Estimated Serves</span><span className="gc-confirm-value">{post.estimatedServes}</span></div>
            </div>
          </div>

          <div className="gc-confirm-notice" role="note">
            <p>Remember — "I'm Going" is an intention signal. Food is available on a first-come, first-served basis and availability may change.</p>
          </div>

          <div className="gc-confirm-actions">
            <Button3D label="Get Directions" onClick={() => window.open(getDirectionsUrl(), '_blank', 'noopener,noreferrer')} icon={<DirectionsIcon />} />
            <Link to="/student" className="gc-confirm-back-link">← Back to Discover</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default GoingConfirmation
