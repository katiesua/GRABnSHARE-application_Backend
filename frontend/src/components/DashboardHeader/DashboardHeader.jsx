import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'
import './DashboardHeader.css'

function DashboardHeader({ role = 'organiser', homePath = '/organiser' }) {
  const navigate = useNavigate()
  const { user, logout } = useAppContext()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isStudent = role === 'student'
  const fullName = (user?.fullName || '').trim()
  const avatarLetter = fullName ? fullName.charAt(0).toUpperCase() : (isStudent ? 'S' : 'O')
  const roleLabel = user?.role === 'organiser' ? 'Organiser' : 'Student'

  function toggleMenu() {
    setMenuOpen((prev) => !prev)
  }

  async function handleLogout() {
    setMenuOpen(false)
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
    navigate('/')
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <header className="dh-header">
      <div className="dh-inner">
        <Link to={homePath} className="dh-logo-link" aria-label="GRABnSHARE Dashboard">
          <img
            className="dh-logo"
            src="/assets/grabnshare-logo.png"
            alt="GRABnSHARE"
          />
        </Link>

        <div className="dh-identity" ref={menuRef}>
          <div className="dh-identity-text">
            <span className="dh-org-name">{fullName || 'La Trobe University'}</span>
            <span className="dh-org-role">{roleLabel}</span>
          </div>
          <button
            className="dh-avatar-btn"
            aria-label="User menu"
            type="button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className={`dh-avatar-circle${isStudent ? ' dh-avatar-circle--student' : ''}`}>{avatarLetter}</span>
            <svg
              className={`dh-chevron${menuOpen ? ' dh-chevron--open' : ''}`}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className="dh-menu" role="menu">
              <span className="dh-menu-item dh-menu-item--label" role="menuitem" aria-disabled="true">
                {roleLabel}
              </span>
              <div className="dh-menu-divider" role="separator"></div>
              <button className="dh-menu-item dh-menu-item--action" role="menuitem" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader