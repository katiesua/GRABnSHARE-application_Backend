import { useState, useEffect, useRef } from 'react'
import Button3D from '../../../components/Button3D/Button3D.jsx'

function UpdateAvailabilityModal({ post, onConfirm, onCancel }) {
  const [serves, setServes] = useState(post.estimatedServes || 0)
  const [status, setStatus] = useState(post.status === 'Low Stock' ? 'Low Stock' : 'Available')
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

  function handleSubmit(e) {
    e.preventDefault()
    onConfirm({
      estimatedServes: Number(serves),
      status,
    })
  }

  return (
    <div className="mp-modal-overlay" ref={overlayRef} onMouseDown={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Update availability">
      <div className="mp-modal">
        <h2 className="mp-modal-title">Update Availability</h2>
        <p className="mp-modal-subtitle">{post.foodAvailable || post.eventName}</p>

        <form onSubmit={handleSubmit} className="mp-modal-form">
          <div className="mp-modal-field">
            <label className="mp-modal-label" htmlFor="mp-update-serves">Remaining Serves</label>
            <input
              className="mp-modal-input"
              id="mp-update-serves"
              type="number"
              min="0"
              value={serves}
              onChange={e => setServes(e.target.value)}
            />
          </div>

          <div className="mp-modal-field">
            <label className="mp-modal-label" htmlFor="mp-update-status">Status</label>
            <select
              className="mp-modal-select"
              id="mp-update-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          <div className="mp-modal-actions">
            <Button3D label="Cancel" variant="secondary" onClick={onCancel} />
            <Button3D label="Save Changes" type="submit" />
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateAvailabilityModal
