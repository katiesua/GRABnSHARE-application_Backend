import './FormCard.css'

function FormCard({ children, className = '' }) {
  return (
    <div className={`form-card ${className}`}>
      {children}
    </div>
  )
}

export default FormCard