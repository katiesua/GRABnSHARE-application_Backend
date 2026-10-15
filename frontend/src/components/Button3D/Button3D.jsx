import './Button3D.css'

function Button3D({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  icon = null,
  className = '',
}) {
  const classes = [
    'btn3d',
    `btn3d--${variant}`,
    loading && 'btn3d--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
    >
      <span className="btn3d-content">
        {label}
        {icon && <span className="btn3d-icon">{icon}</span>}
      </span>
      {loading && <span className="btn3d-spinner" aria-hidden="true" />}
    </button>
  )
}

export default Button3D