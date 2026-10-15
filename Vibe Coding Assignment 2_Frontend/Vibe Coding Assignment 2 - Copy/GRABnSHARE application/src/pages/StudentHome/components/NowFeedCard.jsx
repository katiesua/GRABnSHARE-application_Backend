import { useNavigate } from 'react-router-dom'
import { campusOrganisations, dietaryOptions } from '../../PostFoodNow/data/postFoodData.js'
import { formatTime12, formatRelativeTime } from '../../../lib/formatUtils.js'
import { ClockIcon, LocationPinIcon, ServesIcon } from './StudentHomeIcons.jsx'

function StatusBadge({ status }) {
  let modifier = ''
  if (status === 'Available') modifier = 'st-status-badge--available'
  else if (status === 'Low Stock') modifier = 'st-status-badge--low-stock'

  return (
    <span className={`st-status-badge ${modifier}`}>
      {status === 'Available' && <span className="st-status-dot st-status-dot--green" aria-hidden="true"></span>}
      {status === 'Low Stock' && <span className="st-status-dot st-status-dot--amber" aria-hidden="true"></span>}
      {status}
    </span>
  )
}

function NowFeedCard({ post }) {
  const navigate = useNavigate()
  const orgLabel = campusOrganisations.find(o => o.value === post.campusOrganisation)?.label || post.campusOrganisation
  const dietLabel = post.dietaryInformation && post.dietaryInformation !== 'not-specified'
    ? dietaryOptions.find(d => d.value === post.dietaryInformation)?.label
    : null

  function handleClick() {
    navigate(`/student/live/${post.id}`)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <article
      className="st-now-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${post.foodAvailable} from ${orgLabel}`}
    >
      <div className="st-now-card-header">
        <div className="st-now-card-header-left">
          <h3 className="st-now-card-title">{post.foodAvailable}</h3>
          <span className="st-now-card-org">{orgLabel}</span>
        </div>
        <div className="st-now-card-header-right">
          <StatusBadge status={post.status} />
          <span className="st-now-card-time">{formatRelativeTime(post.createdAt)}</span>
        </div>
      </div>

      <div className="st-now-card-details">
        <div className="st-now-card-detail">
          <ClockIcon />
          <span>Closes at {formatTime12(post.collectionCloses)}</span>
        </div>
        <div className="st-now-card-detail">
          <LocationPinIcon />
          <span>{post.collectionLocation}{post.pickupPoint ? ` • Pickup at ${post.pickupPoint}` : ''}</span>
        </div>
        <div className="st-now-card-detail">
          <ServesIcon />
          <span>{post.estimatedServes} serves</span>
        </div>
        {dietLabel && (
          <div className="st-now-card-detail st-now-card-detail--diet">
            <span>{dietLabel}</span>
          </div>
        )}
      </div>

      <div className="st-now-card-footer">
        <span className="st-now-card-cta">View details →</span>
      </div>
    </article>
  )
}

export default NowFeedCard
