import { Link, useNavigate } from 'react-router-dom'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import FormCard from '../../components/FormCard/FormCard.jsx'
import useScheduleFoodForm from '../../hooks/useScheduleFoodForm.js'
import Step1OrganiserFood from './components/Step1OrganiserFood.jsx'
import Step2ScheduleCollection from './components/Step2ScheduleCollection.jsx'
import Step3Confirmation from './components/Step3Confirmation.jsx'
import './ScheduleFood.css'

function ScheduleFood() {
  const navigate = useNavigate()

  const {
    currentStep,
    formData,
    errors,
    handleChange,
    handleBlur,
    handlePhotoChange,
    handlePhotoRemove,
    handleContinue,
    handleSchedule,
    handleBackToStep1,
  } = useScheduleFoodForm()

  function handleViewPosts() {
    navigate('/organiser/posts')
  }

  return (
    <div className="sf-page">
      <DashboardHeader />

      <main className="sf-main">
        {/* Hero Banner */}
        <section className="sf-hero" aria-label="Schedule Food">
          <div className="sf-hero-content">
            <Link to="/organiser" className="sf-back-link">
              ← Back to Dashboard
            </Link>
            <h1 className="sf-hero-title">Schedule Food</h1>
            <p className="sf-hero-description">
              Create an upcoming free-food opportunity for students.
            </p>

            <div className="sf-steps" role="navigation" aria-label="Form progress">
              <div className={`sf-step ${currentStep === 1 ? 'sf-step--active' : currentStep > 1 ? 'sf-step--completed' : 'sf-step--inactive'}`}>
                <span className="sf-step-number">1</span>
                <span className="sf-step-label">Food Details</span>
              </div>
              <div className="sf-step-divider" aria-hidden="true"></div>
              <div className={`sf-step ${currentStep === 2 ? 'sf-step--active' : currentStep > 2 ? 'sf-step--completed' : 'sf-step--inactive'}`}>
                <span className="sf-step-number">2</span>
                <span className="sf-step-label">Schedule</span>
              </div>
              <div className="sf-step-divider" aria-hidden="true"></div>
              <div className={`sf-step ${currentStep === 3 ? 'sf-step--active' : 'sf-step--inactive'}`}>
                <span className="sf-step-number">3</span>
                <span className="sf-step-label">Collection</span>
              </div>
            </div>
          </div>

          <div className="sf-hero-image-wrapper" aria-hidden="true">
            <img className="sf-hero-image" src="/assets/campus.jpg" alt="" />
          </div>

          <div className="sf-hero-decor sf-hero-decor--1" aria-hidden="true"></div>
          <div className="sf-hero-decor sf-hero-decor--2" aria-hidden="true"></div>
        </section>

        {/* Form / Confirmation Area */}
        <section className="sf-form-section">
          {currentStep === 3 ? (
            <Step3Confirmation
              formData={formData}
              onViewPosts={handleViewPosts}
            />
          ) : (
            <FormCard className="sf-form-card">
              {currentStep === 1 && (
                <Step1OrganiserFood
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onPhotoChange={handlePhotoChange}
                  onPhotoRemove={handlePhotoRemove}
                  onSubmit={handleContinue}
                />
              )}
              {currentStep === 2 && (
                <Step2ScheduleCollection
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onBack={handleBackToStep1}
                  onSubmit={handleSchedule}
                />
              )}
            </FormCard>
          )}
        </section>
      </main>
    </div>
  )
}

export default ScheduleFood