import { useEffect, useRef } from 'react'
import Button3D from '../../../components/Button3D/Button3D.jsx'
import { WarningIcon } from './MyPostsIcons.jsx'

function ConfirmAllGoneModal({ post, onConfirm, onCancel }) {
  const overlayRef = useRef(null)

  /* Close on Escape key */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  /* Close on backdrop click */
  function handleBackdropClick(e) {
    if (e.target === overlayRef.current) onCancel()
  }

  return (
    <div className="mp-modal-overlay" ref={overlayRef} onMouseDown={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Confirm mark all gone">
      <div className="mp-modal mp-modal--confirm">
        <div className="mp-modal-warning-icon">
          <WarningIcon />
        </div>

        <h2 className="mp-modal-title">Mark as All Gone?</h2>
        <p className="mp-modal-message">
          This will mark <strong>&ldquo;{post.foodAvailable || post.eventName}&rdquo;</strong> as no longer available for students.
        </p>
        <p className="mp-modal-note">
          You can reverse this by updating the post availability.
        </p>

        <div className="mp-modal-actions">
          <Button3D label="Cancel" variant="secondary" onClick={onCancel} />
          <Button3D label="Mark All Gone" onClick={onConfirm} className="mp-btn-confirm-danger" />
        </div>
      </div>
    </div>
  )
}

export default ConfirmAllGoneModal
