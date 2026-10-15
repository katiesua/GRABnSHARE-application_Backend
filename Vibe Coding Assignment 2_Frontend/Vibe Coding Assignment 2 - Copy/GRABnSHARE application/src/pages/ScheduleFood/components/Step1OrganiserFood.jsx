import { useNavigate } from 'react-router-dom'
import FormInput from '../../../components/FormInput/FormInput.jsx'
import FormTextarea from '../../../components/FormTextarea/FormTextarea.jsx'
import FormSection from '../../../components/FormSection/FormSection.jsx'
import Button3D from '../../../components/Button3D/Button3D.jsx'
import PhotoUploader from '../../../components/PhotoUploader/PhotoUploader.jsx'
import { OrganiserIcon, FoodIcon } from './ScheduleFoodIcons.jsx'
import { organiserRoles, campusOrganisations, dietaryOptions } from '../data/scheduleFoodData.js'

function Step1OrganiserFood({ formData, errors, onChange, onBlur, onPhotoChange, onPhotoRemove, onSubmit }) {
  const navigate = useNavigate()

  return (
    <form className="sf-form" onSubmit={onSubmit} noValidate>
      {/* Section A — Organiser Details */}
      <FormSection
        title="Organiser Details"
        subtitle="Tell students who is organising this upcoming food opportunity."
        icon={<OrganiserIcon />}
        card
      >
        <div className="sf-fields-row">
          <FormInput
            label="Organiser Name"
            type="text"
            id="organiserName"
            placeholder="e.g. Katie Sua"
            value={formData.organiserName}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.organiserName}
          />
          <FormInput
            label="Organiser Role"
            type="select"
            id="organiserRole"
            placeholder="Select your role"
            value={formData.organiserRole}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.organiserRole}
            options={organiserRoles}
          />
          <FormInput
            label="Department"
            type="select"
            id="campusOrganisation"
            placeholder="Select an organisation"
            value={formData.campusOrganisation}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.campusOrganisation}
            options={campusOrganisations}
          />
        </div>

        {formData.campusOrganisation && (
          <div className="sf-verified-badge">
            <span className="sf-verified-icon">✓</span>
            Verified Organiser
          </div>
        )}
      </FormSection>

      {/* Section B — Food Details */}
      <FormSection
        title="Food Details"
        subtitle="Tell students what food will be available at this upcoming event."
        icon={<FoodIcon />}
        card
      >
        <FormInput
          label="Event Name"
          type="text"
          id="eventName"
          placeholder="e.g. End-of-Semester BBQ"
          value={formData.eventName}
          onChange={onChange}
          onBlur={onBlur}
          required
          error={errors.eventName}
        />

        <FormTextarea
          label="Food Description"
          id="foodDescription"
          placeholder="Briefly describe the food that will be available."
          value={formData.foodDescription}
          onChange={onChange}
          onBlur={onBlur}
          required
          error={errors.foodDescription}
          rows={3}
        />

        <div className="sf-fields-row sf-fields-row--two">
          <FormInput
            label="Dietary Information"
            type="select"
            id="dietaryInformation"
            placeholder="Select dietary info"
            value={formData.dietaryInformation}
            onChange={onChange}
            onBlur={onBlur}
            options={dietaryOptions}
          />
          <div className="sf-dietary-note">
            <span className="sf-dietary-note-icon" aria-hidden="true">ℹ</span>
            <span className="sf-dietary-note-text">
              This is organiser-provided information only and is not a food-safety or dietary guarantee.
            </span>
          </div>
        </div>

        <PhotoUploader
          photo={formData.foodPhoto}
          onPhotoChange={onPhotoChange}
          onPhotoRemove={onPhotoRemove}
        />
      </FormSection>

      {/* Action Buttons */}
      <div className="sf-actions">
        <Button3D
          label="← Back to Dashboard"
          variant="secondary"
          onClick={() => navigate('/organiser')}
        />
        <div className="sf-continue-btn">
          <Button3D
            label="Continue"
            type="submit"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M6.75 3.75L11.25 9L6.75 14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </div>
    </form>
  )
}

export default Step1OrganiserFood