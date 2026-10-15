import { useRef, useState } from 'react'
import './HoverGlowButton.css'

/**
 * HoverGlowButton — 21st.dev Animated Feature Button adapted for GRABnSHARE.
 * Displays a radial glow that follows the cursor on hover, with a smooth
 * color transition on the label. All interactive behaviour is identical to
 * the original 21st.dev component; styles are plain CSS.
 */
function HoverGlowButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  glowColor = '#E2231B',
  backgroundColor = '#111827',
  textColor = '#ffffff',
  hoverTextColor = '#FCA5A5',
}) {
  const buttonRef = useRef(null)
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setGlowPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hgb ${disabled ? 'hgb--disabled' : ''} ${className}`}
      style={{
        backgroundColor,
        color: isHovered ? hoverTextColor : textColor,
      }}
    >
      {/* Glow effect */}
      <span
        className={`hgb__glow ${isHovered ? 'hgb__glow--visible' : ''}`}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${glowColor} 10%, transparent 70%)`,
        }}
      />

      {/* Label */}
      <span className="hgb__label">{children}</span>
    </button>
  )
}

export default HoverGlowButton
