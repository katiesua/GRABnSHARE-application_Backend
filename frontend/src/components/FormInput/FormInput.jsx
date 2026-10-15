import './FormInput.css'

function FormInput({
  label,
  type = 'text',
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  options = [],
}) {
  const fieldClasses = [
    'form-input-field',
    error ? 'form-input-field--error' : '',
    type === 'select' ? 'form-input-field--select' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`form-input-group ${error ? 'form-input-group--error' : ''}`}>
      <label className="form-input-label" htmlFor={id}>
        {label}
        {required && <span className="form-input-required"> *</span>}
      </label>

      {type === 'select' ? (
        <select
          className={fieldClasses}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={fieldClasses}
          type={type}
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={
            type === 'password'
              ? 'current-password'
              : type === 'email'
                ? 'email'
                : 'off'
          }
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
        />
      )}

      {error && (
        <span className="form-input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default FormInput