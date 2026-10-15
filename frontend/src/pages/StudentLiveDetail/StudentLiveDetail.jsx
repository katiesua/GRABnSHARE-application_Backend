import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import Button3D from '../../components/Button3D/Button3D.jsx'
import { campusOrganisations, organiserRoles, dietaryOptions } from '../PostFoodNow/data/postFoodData.js'
import { formatTime12 } from '../../lib/formatUtils.js'
import { LocationPinIcon, ClockIcon, ServesIcon, DietIcon, PersonIcon, NotesIcon, DirectionsIcon, CheckCircleIcon, AlertIcon } from '../StudentDetail/StudentDetailIcons.jsx'
import './StudentLiveDetail.css'

function StudentLiveDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recentPosts, goingToPosts, markGoing } = useAppContext()
  const post = recentPosts.find(p => String(p.id) === String(id))

  if (!post) {
    return (
      <div className="sld-page">
        <DashboardHeader role="student" homePath="/student" />
        <main className="sld-main">
          <section className="sld-not-found">
            <h1 className="sld-not-found-title">Post not found</h1>
            <p className="sld-not-found-desc">This food opportunity may have been removed or is no longer available.</p>
            <Button3D label="← Back to Discover" variant="secondary" onClick={() => navigate('/student')} />
          </section>
        </main>
      </div>
    )
  }

  const isAllGone = post.status === 'All Gone'
  const isAlreadyGoing = goingToPosts.includes(post.id)
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

  function handleGoing() {
    if (!isAllGone && !isAlreadyGoing) {
      markGoing(post.id)
      navigate(`/student/going-confirmed/${post.id}`)
    }
  }

  /* END_OF_PART_1 */

  const pulseClass = post.status === 'Available' ? 'available' : post.status === 'Low Stock' ? 'low-stock' : 'all-gone'
  const pulseDotClass = post.status === 'Available' ? 'green' : post.status === 'Low Stock' ? 'amber' : 'grey'
  const pulseText = post.status === 'Available' ? 'FoodPulse: Available' : post.status === 'Low Stock' ? 'FoodPulse: Running Low' : 'FoodPulse: All Gone'

  return (
    <div className="sld-page">
      <DashboardHeader role="student" homePath="/student" />
      <main className="sld-main">
        <section className="sld-hero" aria-label="Food opportunity details">
          <div className="sld-hero-content">
            <Link to="/student" className="sld-back-link">← Back to Discover</Link>
            <h1 className="sld-hero-title">{post.foodAvailable}</h1>
            <p className="sld-hero-org">{orgLabel}</p>
            <div className="sld-pulse">
              <span className={`sld-pulse-badge sld-pulse-badge--${pulseClass}`}>
                <span className={`sld-pulse-dot sld-pulse-dot--${pulseDotClass}`} aria-hidden="true"></span>
                {pulseText}
              </span>
            </div>
          </div>
          <div className="sld-hero-image-wrapper" aria-hidden="true"><img className="sld-hero-image" src="/assets/campus.jpg" alt="" /></div>
          <div className="sld-hero-decor sld-hero-decor--1" aria-hidden="true"></div>
          <div className="sld-hero-decor sld-hero-decor--2" aria-hidden="true"></div>
        </section>

        {isAllGone && (
          <div className="sld-gone-banner" role="alert"><AlertIcon /><span>This food opportunity is no longer available for collection.</span></div>
        )}

        {/* END_OF_PART_2 */}

        <section className="sld-detail-card" aria-label="Opportunity details">
          {post.foodDescription && (
            <div className="sld-section">
              <h2 className="sld-section-title">About this food</h2>
              <p className="sld-section-text">{post.foodDescription}</p>
            </div>
          )}
          <div className="sld-section">
            <h2 className="sld-section-title">Collection details</h2>
            <div className="sld-info-grid">
              <div className="sld-info-item"><span className="sld-info-icon"><LocationPinIcon /></span><div className="sld-info-content"><span className="sld-info-label">Location</span><span className="sld-info-value">{post.collectionLocation}</span></div></div>
              {post.pickupPoint && <div className="sld-info-item"><span className="sld-info-icon"><LocationPinIcon /></span><div className="sld-info-content"><span className="sld-info-label">Pickup Point</span><span className="sld-info-value">{post.pickupPoint}</span></div></div>}
              <div className="sld-info-item"><span className="sld-info-icon"><ClockIcon /></span><div className="sld-info-content"><span className="sld-info-label">Collection Closes</span><span className="sld-info-value">{formatTime12(post.collectionCloses)}</span></div></div>
              <div className="sld-info-item"><span className="sld-info-icon"><ServesIcon /></span><div className="sld-info-content"><span className="sld-info-label">Estimated Serves</span><span className="sld-info-value">{post.estimatedServes}</span></div></div>
              {dietLabel && <div className="sld-info-item"><span className="sld-info-icon"><DietIcon /></span><div className="sld-info-content"><span className="sld-info-label">Dietary Info</span><span className="sld-info-value">{dietLabel}</span></div></div>}
            </div>
          </div>
          {post.collectionNotes && (
            <div className="sld-section"><h2 className="sld-section-title">Collection notes</h2><div className="sld-notes"><span className="sld-notes-icon"><NotesIcon /></span><p className="sld-notes-text">{post.collectionNotes}</p></div></div>
          )}
          <div className="sld-section">
            <h2 className="sld-section-title">Verified organiser</h2>
            <div className="sld-organiser"><span className="sld-organiser-icon"><PersonIcon /></span><div className="sld-organiser-content"><span className="sld-organiser-name">{post.organiserName}</span><span className="sld-organiser-detail">{roleLabel} • {orgLabel}</span></div></div>
          </div>
        </section>

        <section className="sld-actions" aria-label="Actions">
          {!isAllGone && !isAlreadyGoing && <Button3D label="I'm Going" onClick={handleGoing} icon={<DirectionsIcon />} />}
          {!isAllGone && isAlreadyGoing && <Button3D label="You're Going ✓" disabled icon={<CheckCircleIcon />} />}
          {isAllGone && <Button3D label="I'm Going" disabled />}
          <Button3D label="Get Directions" variant="secondary" onClick={() => window.open(getDirectionsUrl(), '_blank', 'noopener,noreferrer')} icon={<DirectionsIcon />} />
        </section>

        <div className="sld-disclaimer" aria-label="Disclaimer">
          <p>Indicating "I'm Going" is an intention signal only and does not reserve or guarantee food availability. Dietary information is provided by the organiser and does not constitute a food-safety guarantee.</p>
        </div>
      </main>
    </div>
  )
}

export default StudentLiveDetail

