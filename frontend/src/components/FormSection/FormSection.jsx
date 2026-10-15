import './FormSection.css'

function FormSection({ title, subtitle, icon = null, children, className = '', showDivider = false, card = false }) {
  return (
    <section className={`form-section${card ? ' form-section--card' : ''} ${className}`}>
      <div className="form-section-header">
        {icon && (
          <span className="form-section-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="form-section-header-text">
          <h2 className="form-section-title">{title}</h2>
          <p className="form-section-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="form-section-content">
        {children}
      </div>
      {showDivider && (
        <div className="form-section-divider" aria-hidden="true"></div>
      )}
    </section>
  )
}

export default FormSection