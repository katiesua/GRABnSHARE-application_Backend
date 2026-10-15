import { Link } from 'react-router-dom'
import Button3D from '../../../components/Button3D/Button3D.jsx'
import { organiserRoles, campusOrganisations } from '../data/postFoodData.js'
import { SuccessIcon } from './PostFoodIcons.jsx'

function Step3Confirmation({ formData, onViewPosts }) {
  const roleLabel = organiserRoles.find(r => r.value === formData.organiserRole)?.label || formData.organiserRole
  const orgLabel = campusOrganisations.find(o => o.value === formData.campusOrganisation)?.label || formData.campusOrganisation

  return (
    <div className="pn-confirm">
      <div className="pn-confirm-icon">
        <SuccessIcon />
      </div>

      <h2 className="pn-confirm-title">Food Posted Successfully!</h2>
      <p className="pn-confirm-message">
        Your food opportunity is now ready to be shared with students.
      </p>

      <div className="pn-confirm-card">
        <h3 className="pn-confirm-card-title">Post Summary</h3>
        <div className="pn-confirm-details">
          <div className="pn-confirm-row">
            <span className="pn-confirm-label">What's Available</span>
            <span className="pn-confirm-value">{formData.foodAvailable}</span>
          </div>
          <div className="pn-confirm-row">
            <span className="pn-confirm-label">Campus Organisation</span>
            <span className="pn-confirm-value">{orgLabel}</span>
          </div>
          <div className="pn-confirm-divider" aria-hidden="true"></div>
          <div className="pn-confirm-row">
            <span className="pn-confirm-label">Collection Location</span>
            <span className="pn-confirm-value">{formData.collectionLocation}</span>
          </div>
          <div className="pn-confirm-row">
            <span className="pn-confirm-label">Pickup Point</span>
            <span className="pn-confirm-value">{formData.pickupPoint}</span>
          </div>
          <div className="pn-confirm-row">
            <span className="pn-confirm-label">Collection Closes</span>
            <span className="pn-confirm-value">{formData.collectionCloses}</span>
          </div>
          <div className="pn-confirm-row">
            <span className="pn-confirm-label">Estimated Serves</span>
            <span className="pn-confirm-value">{formData.estimatedServes}</span>
          </div>
          <div className="pn-confirm-row">
            <span className="pn-confirm-label">Current Availability</span>
            <span className="pn-confirm-value">
              <span className="pn-availability-badge pn-availability-badge--small">Available</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pn-confirm-actions">
        <Button3D
          label="View My Posts"
          onClick={onViewPosts}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M6.75 3.75L11.25 9L6.75 14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <Link to="/organiser" className="pn-confirm-back-link">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Step3Confirmation
