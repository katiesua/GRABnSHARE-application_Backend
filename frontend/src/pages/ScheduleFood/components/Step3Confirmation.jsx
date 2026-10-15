import { Link } from 'react-router-dom'
import Button3D from '../../../components/Button3D/Button3D.jsx'
import { organiserRoles, campusOrganisations } from '../data/scheduleFoodData.js'
import { SuccessIcon } from './ScheduleFoodIcons.jsx'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const monthIndex = Number(parts[1]) - 1
  return `${Number(parts[2])} ${months[monthIndex]} ${parts[0]}`
}

function Step3Confirmation({ formData, onViewPosts }) {
  const roleLabel = organiserRoles.find(r => r.value === formData.organiserRole)?.label || formData.organiserRole
  const orgLabel = campusOrganisations.find(o => o.value === formData.campusOrganisation)?.label || formData.campusOrganisation

  return (
    <div className="sf-confirm">
      <div className="sf-confirm-icon">
        <SuccessIcon />
      </div>

      <h2 className="sf-confirm-title">Food Scheduled Successfully!</h2>
      <p className="sf-confirm-message">
        Your upcoming food opportunity has been scheduled and will be visible to students.
      </p>

      <div className="sf-confirm-card">
        <h3 className="sf-confirm-card-title">Schedule Summary</h3>
        <div className="sf-confirm-details">
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Event Name</span>
            <span className="sf-confirm-value">{formData.eventName}</span>
          </div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Campus Organisation</span>
            <span className="sf-confirm-value">{orgLabel}</span>
          </div>
          <div className="sf-confirm-divider" aria-hidden="true"></div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Scheduled Date</span>
            <span className="sf-confirm-value sf-confirm-value--highlight">{formatDate(formData.scheduledDate)}</span>
          </div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Collection Starts</span>
            <span className="sf-confirm-value">{formData.collectionStarts}</span>
          </div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Collection Closes</span>
            <span className="sf-confirm-value">{formData.collectionCloses}</span>
          </div>
          <div className="sf-confirm-divider" aria-hidden="true"></div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Collection Location</span>
            <span className="sf-confirm-value">{formData.collectionLocation}</span>
          </div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Pickup Point</span>
            <span className="sf-confirm-value">{formData.pickupPoint}</span>
          </div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Estimated Serves</span>
            <span className="sf-confirm-value">{formData.estimatedServes}</span>
          </div>
          <div className="sf-confirm-row">
            <span className="sf-confirm-label">Status</span>
            <span className="sf-confirm-value">
              <span className="sf-availability-badge sf-availability-badge--upcoming sf-availability-badge--small">Upcoming</span>
            </span>
          </div>
        </div>
      </div>

      <div className="sf-confirm-actions">
        <Button3D
          label="View My Posts"
          onClick={onViewPosts}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M6.75 3.75L11.25 9L6.75 14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <Link to="/organiser" className="sf-confirm-back-link">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Step3Confirmation