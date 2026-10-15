import Button3D from '../../../components/Button3D/Button3D.jsx'
import { campusOrganisations, dietaryOptions } from '../../PostFoodNow/data/postFoodData.js'
import { formatDate, formatTime12, formatRelativeTime } from '../../../lib/formatUtils.js'
import { LocationPinIcon, ClockIcon, ServesIcon, CalendarSmallIcon, DietIcon, LiveIcon, UpcomingIcon } from './MyPostsIcons.jsx'

function StatusBadge({ status }) {
  let modifier = ''
  if (status === 'Available') modifier = 'mp-status-badge--available'
  else if (status === 'Low Stock') modifier = 'mp-status-badge--low-stock'
  else if (status === 'All Gone') modifier = 'mp-status-badge--all-gone'
  else if (status === 'Scheduled' || status === 'Upcoming') modifier = 'mp-status-badge--upcoming'

  return (
    <span className={`mp-status-badge ${modifier}`}>
      {status === 'Available' && <span className="mp-status-dot mp-status-dot--green" aria-hidden="true"></span>}
      {status === 'Low Stock' && <span className="mp-status-dot mp-status-dot--amber" aria-hidden="true"></span>}
      {status === 'All Gone' && <span className="mp-status-dot mp-status-dot--grey" aria-hidden="true"></span>}
      {(status === 'Scheduled' || status === 'Upcoming') && <span className="mp-status-dot mp-status-dot--blue" aria-hidden="true"></span>}
      {status}
    </span>
  )
}

function PostCard({ post, onUpdate, onMarkAllGone }) {
  const isScheduled = post.type === 'scheduled' || post.status === 'Scheduled' || post.status === 'Upcoming'
  const isAllGone = post.status === 'All Gone'
  const headline = isScheduled ? post.eventName : post.foodAvailable
  const orgLabel = campusOrganisations.find(o => o.value === post.campusOrganisation)?.label || post.campusOrganisation

  return (
    <article className={`mp-post-card${isAllGone ? ' mp-post-card--inactive' : ''}`}>
      {/* Header row */}
      <div className="mp-post-header">
        <div className="mp-post-header-left">
          <span className="mp-post-type-icon" aria-hidden="true">
            {isScheduled ? <UpcomingIcon /> : <LiveIcon />}
          </span>
          <div className="mp-post-header-text">
            <h3 className="mp-post-title">{headline}</h3>
            <span className="mp-post-org">{orgLabel}</span>
          </div>
        </div>
        <div className="mp-post-header-right">
          <StatusBadge status={post.status} />
          <span className="mp-post-time">{formatRelativeTime(post.createdAt)}</span>
        </div>
      </div>

      {/* Details grid */}
      <div className="mp-post-details">
        {isScheduled && post.scheduledDate && (
          <div className="mp-post-detail">
            <CalendarSmallIcon />
            <span>{formatDate(post.scheduledDate)}</span>
          </div>
        )}
        {isScheduled && post.collectionStarts && (
          <div className="mp-post-detail">
            <ClockIcon />
            <span>{formatTime12(post.collectionStarts)} – {formatTime12(post.collectionCloses)}</span>
          </div>
        )}
        {!isScheduled && post.collectionCloses && (
          <div className="mp-post-detail">
            <ClockIcon />
            <span>Closes at {formatTime12(post.collectionCloses)}</span>
          </div>
        )}
        <div className="mp-post-detail">
          <LocationPinIcon />
          <span>{post.collectionLocation}{post.pickupPoint ? ` • Pickup at ${post.pickupPoint}` : ''}</span>
        </div>
        <div className="mp-post-detail">
          <ServesIcon />
          <span>{post.estimatedServes} estimated serves</span>
        </div>
        {post.dietaryInformation && post.dietaryInformation !== 'not-specified' && (
          <div className="mp-post-detail">
            <DietIcon />
            <span>{dietaryOptions.find(d => d.value === post.dietaryInformation)?.label || post.dietaryInformation}</span>
          </div>
        )}
      </div>

      {/* Actions — only for live posts that aren't All Gone */}
      {!isScheduled && !isAllGone && (
        <div className="mp-post-actions">
          <Button3D
            label="Update Availability"
            variant="secondary"
            onClick={() => onUpdate(post.id)}
          />
          <Button3D
            label="Mark All Gone"
            variant="secondary"
            onClick={() => onMarkAllGone(post.id)}
            className="mp-btn-danger"
          />
        </div>
      )}
    </article>
  )
}

export default PostCard
