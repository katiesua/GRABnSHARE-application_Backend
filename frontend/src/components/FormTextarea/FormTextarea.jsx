import './FormTextarea.css'

function FormTextarea({
  label,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  rows = 3,
}) {
  const fieldClasses = [
    'form-textarea-field',
    error ? 'form-textarea-field--error' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`form-textarea-group ${error ? 'form-textarea-group--error' : ''}`}>
      <label className="form-input-label" htmlFor={id}>
        {label}
        {required && <span className="form-input-required"> *</span>}
      </label>

      <textarea
        className={fieldClasses}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
      />

      {error && (
        <span className="form-textarea-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default FormTextarea
