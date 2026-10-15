import { useNavigate } from 'react-router-dom'
import { campusOrganisations } from '../../PostFoodNow/data/postFoodData.js'
import { formatDate, formatTime12, formatRelativeTime } from '../../../lib/formatUtils.js'
import { CalendarSmallIcon, ClockIcon, LocationPinIcon } from './StudentHomeIcons.jsx'

function UpcomingFeedCard({ post }) {
  const navigate = useNavigate()
  const orgLabel = campusOrganisations.find(o => o.value === post.campusOrganisation)?.label || post.campusOrganisation
  const headline = post.eventName || post.foodAvailable

  function handleClick() {
    navigate(`/student/upcoming/${post.id}`)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <article
      className="st-upcoming-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`${headline} from ${orgLabel}`}
    >
      <div className="st-upcoming-card-header">
        <div className="st-upcoming-card-header-left">
          <h3 className="st-upcoming-card-title">{headline}</h3>
          <span className="st-upcoming-card-org">{orgLabel}</span>
        </div>
        <div className="st-upcoming-card-header-right">
          <span className="st-status-badge st-status-badge--upcoming">
            <span className="st-status-dot st-status-dot--blue" aria-hidden="true"></span>
            Upcoming
          </span>
          <span className="st-upcoming-card-time">{formatRelativeTime(post.createdAt)}</span>
        </div>
      </div>

      <div className="st-upcoming-card-details">
        {post.scheduledDate && (
          <div className="st-upcoming-card-detail">
            <CalendarSmallIcon />
            <span>{formatDate(post.scheduledDate)}</span>
          </div>
        )}
        {post.collectionStarts && (
          <div className="st-upcoming-card-detail">
            <ClockIcon />
            <span>{formatTime12(post.collectionStarts)} – {formatTime12(post.collectionCloses)}</span>
          </div>
        )}
        <div className="st-upcoming-card-detail">
          <LocationPinIcon />
          <span>{post.collectionLocation}</span>
        </div>
      </div>

      <div className="st-upcoming-card-footer">
        <span className="st-upcoming-card-cta">View details →</span>
      </div>
    </article>
  )
}

export default UpcomingFeedCard
