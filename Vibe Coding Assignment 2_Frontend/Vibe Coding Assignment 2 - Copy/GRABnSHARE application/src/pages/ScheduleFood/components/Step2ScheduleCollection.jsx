import FormInput from '../../../components/FormInput/FormInput.jsx'
import FormTextarea from '../../../components/FormTextarea/FormTextarea.jsx'
import FormSection from '../../../components/FormSection/FormSection.jsx'
import LocationAutocomplete from '../../../components/LocationAutocomplete/LocationAutocomplete.jsx'
import Button3D from '../../../components/Button3D/Button3D.jsx'
import { ScheduleIcon } from './ScheduleFoodIcons.jsx'
import { campusLocations } from '../data/scheduleFoodData.js'

function Step2ScheduleCollection({ formData, errors, onChange, onBlur, onBack, onSubmit }) {
  return (
    <form className="sf-form" onSubmit={onSubmit} noValidate>
      <FormSection
        title="Schedule &amp; Collection"
        subtitle="Tell students when and where to collect the food."
        icon={<ScheduleIcon />}
        card
      >
        <div className="sf-fields-row sf-fields-row--two">
          <FormInput
            label="Scheduled Date"
            type="date"
            id="scheduledDate"
            value={formData.scheduledDate}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.scheduledDate}
          />
          <FormInput
            label="Collection Starts"
            type="time"
            id="collectionStarts"
            placeholder="Set start time"
            value={formData.collectionStarts}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.collectionStarts}
          />
        </div>

        <div className="sf-fields-row sf-fields-row--two">
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
            placeholder="e.g. 30"
            value={formData.estimatedServes}
            onChange={onChange}
            onBlur={onBlur}
            required
            error={errors.estimatedServes}
          />
        </div>

        <div className="sf-fields-row sf-fields-row--two">
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

        <div className="sf-availability-row">
          <span className="sf-availability-label">Status</span>
          <span className="sf-availability-badge sf-availability-badge--upcoming">Upcoming</span>
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

        <p className="sf-transparency-notice">
          Estimated serves are approximate and availability may change on the day of the event.
        </p>
      </FormSection>

      <div className="sf-actions">
        <Button3D
          label="← Back"
          variant="secondary"
          onClick={onBack}
        />
        <div className="sf-continue-btn">
          <Button3D
            label="Schedule Food Now"
            type="submit"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 9.75L7.5 14.25L15 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </div>
    </form>
  )
}

export default Step2ScheduleCollection