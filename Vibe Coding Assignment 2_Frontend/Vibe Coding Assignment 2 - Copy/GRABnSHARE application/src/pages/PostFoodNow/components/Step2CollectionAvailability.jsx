import FormInput from '../../../components/FormInput/FormInput.jsx'
import FormTextarea from '../../../components/FormTextarea/FormTextarea.jsx'
import FormSection from '../../../components/FormSection/FormSection.jsx'
import LocationAutocomplete from '../../../components/LocationAutocomplete/LocationAutocomplete.jsx'
import Button3D from '../../../components/Button3D/Button3D.jsx'
import HoverGlowButton from '../../../components/ui/HoverGlowButton.jsx'
import { CollectionIcon } from './PostFoodIcons.jsx'
import { campusLocations } from '../data/postFoodData.js'

function Step2CollectionAvailability({ formData, errors, onChange, onBlur, onBack, onSubmit }) {
  return (
    <form className="pn-form" onSubmit={onSubmit} noValidate>
      <FormSection
        title="Collection &amp; Availability"
        subtitle="Tell students where to collect the food and how long it will be available."
        icon={<CollectionIcon />}
        card
      >
        <div className="pn-fields-row pn-fields-row--two">
          <LocationAutocomplete
            label="Collection Location"
            id="collectionLocation"
            placeholder="e.g. Donald Whitehead Building"
            value={formData.collectionLocation}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.collectionLocation}
            suggestions={campusLocations}
          />
          <FormInput
            label="Pickup Point"
            type="text"
            id="pickupPoint"
            placeholder="e.g. Level 1, Foyer"
            value={formData.pickupPoint}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.pickupPoint}
          />
        </div>

        <div className="pn-fields-row pn-fields-row--two">
          <FormInput
            label="Collection Closes"
            type="time"
            id="collectionCloses"
            placeholder="Set closing time"
            value={formData.collectionCloses}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.collectionCloses}
          />
          <FormInput
            label="Estimated Serves"
            type="number"
            id="estimatedServes"
            placeholder="e.g. 15"
            value={formData.estimatedServes}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.estimatedServes}
          />
        </div>

        <div className="pn-availability-row">
          <span className="pn-availability-label">Current Availability</span>
          <span className="pn-availability-badge">Available</span>
        </div>

        <FormTextarea
          label="Collection Notes"
          id="collectionNotes"
          placeholder="e.g. Please collect from the table beside reception."
          value={formData.collectionNotes}
          onChange={onChange}
          onBlur={onBlur}
          rows={3}
        />

        <p className="pn-transparency-notice">
          Estimated serves are approximate and availability may change as students collect food.
        </p>
      </FormSection>

      <div className="pn-actions">
        <Button3D
          label="← Back"
          variant="secondary"
          onClick={onBack}
        />
        <div className="pn-continue-btn">
          <HoverGlowButton
            type="submit"
            glowColor="#FDEAEA"
            backgroundColor="#E2231B"
            textColor="#ffffff"
            hoverTextColor="#FDEAEA"
          >
            Publish Now
            <svg style={{ marginLeft: '0.5rem', display: 'inline', verticalAlign: 'middle' }} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 9.75L7.5 14.25L15 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </HoverGlowButton>
        </div>
      </div>
    </form>
  )
}

export default Step2CollectionAvailability
