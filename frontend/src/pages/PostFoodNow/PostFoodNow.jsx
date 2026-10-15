import { Link, useNavigate } from 'react-router-dom'
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader.jsx'
import FormCard from '../../components/FormCard/FormCard.jsx'
import usePostFoodForm from '../../hooks/usePostFoodForm.js'
import Step1OrganiserFood from './components/Step1OrganiserFood.jsx'
import Step2CollectionAvailability from './components/Step2CollectionAvailability.jsx'
import Step3Confirmation from './components/Step3Confirmation.jsx'
import './PostFoodNow.css'

function PostFoodNow() {
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
    handlePublish,
    handleBackToStep1,
  } = usePostFoodForm()

  function handleViewPosts() {
    navigate('/organiser/posts')
  }

  return (
    <div className="pn-page">
      <DashboardHeader />

      <main className="pn-main">
        {/* Hero Banner */}
        <section className="pn-hero" aria-label="Post Food Now">
          <div className="pn-hero-content">
            <Link to="/organiser" className="pn-back-link">
              ← Back to Dashboard
            </Link>
            <h1 className="pn-hero-title">Post Food Now</h1>
            <p className="pn-hero-description">
              Share surplus food that is available for students to collect now.
            </p>

            <div className="pn-steps" role="navigation" aria-label="Form progress">
              <div className={`pn-step ${currentStep === 1 ? 'pn-step--active' : currentStep > 1 ? 'pn-step--completed' : 'pn-step--inactive'}`}>
                <span className="pn-step-number">1</span>
                <span className="pn-step-label">Organiser &amp; Food Details</span>
              </div>
              <div className="pn-step-divider" aria-hidden="true"></div>
              <div className={`pn-step ${currentStep === 2 ? 'pn-step--active' : currentStep > 2 ? 'pn-step--completed' : 'pn-step--inactive'}`}>
                <span className="pn-step-number">2</span>
                <span className="pn-step-label">Collection &amp; Availability</span>
              </div>
              <div className="pn-step-divider" aria-hidden="true"></div>
              <div className={`pn-step ${currentStep === 3 ? 'pn-step--active' : 'pn-step--inactive'}`}>
                <span className="pn-step-number">3</span>
                <span className="pn-step-label">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="pn-hero-image-wrapper" aria-hidden="true">
            <img className="pn-hero-image" src="/assets/campus.jpg" alt="" />
          </div>

          <div className="pn-hero-decor pn-hero-decor--1" aria-hidden="true"></div>
          <div className="pn-hero-decor pn-hero-decor--2" aria-hidden="true"></div>
        </section>

        {/* Form / Confirmation Area */}
        <section className="pn-form-section">
          {currentStep === 3 ? (
            <Step3Confirmation
              formData={formData}
              onViewPosts={handleViewPosts}
            />
          ) : (
            <FormCard className="pn-form-card">
              {currentStep === 1 && (
                <Step1OrganiserFood
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onPhotoChange={handlePhotoChange}
                  onPhotoRemove={handlePhotoRemove}
                  onCancel={() => navigate('/organiser')}
                  onSubmit={handleContinue}
                />
              )}
              {currentStep === 2 && (
                <Step2CollectionAvailability
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onBack={handleBackToStep1}
                  onSubmit={handlePublish}
                />
              )}
            </FormCard>
          )}
        </section>
      </main>
    </div>
  )
}

export default PostFoodNow
