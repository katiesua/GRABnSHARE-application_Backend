import { useRef, useEffect } from 'react'
import { UploadIcon } from '../../pages/PostFoodNow/components/PostFoodIcons.jsx'
import './PhotoUploader.css'

function PhotoUploader({ photo, onPhotoChange, onPhotoRemove }) {
  const fileInputRef = useRef(null)
  const previewUrlRef = useRef(null)

  /* Revoke object URL on cleanup */
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function handleClick() {
    fileInputRef.current.click()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fileInputRef.current.click()
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0]
    if (file) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
      previewUrlRef.current = URL.createObjectURL(file)
      onPhotoChange(file)
    }
    event.target.value = ''
  }

  function handleRemove() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    onPhotoRemove()
  }

  return (
    <div className="pn-photo-group">
      <span className="form-input-label">
        Food Photo <span className="pn-photo-optional">(optional)</span>
      </span>

      {photo ? (
        <div className="pn-photo-preview-wrapper">
          <img
            src={previewUrlRef.current}
            alt="Food preview"
            className="pn-photo-preview"
          />
          <button
            type="button"
            className="pn-photo-remove-btn"
            onClick={handleRemove}
          >
            ✕ Remove photo
          </button>
        </div>
      ) : (
        <div
          className="pn-photo-upload"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Upload a food photo"
        >
          <div className="pn-photo-upload-icon">
            <UploadIcon />
          </div>
          <span className="pn-photo-upload-text">Click to upload a photo</span>
          <span className="pn-photo-upload-hint">PNG, JPG up to 5MB (optional)</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="pn-photo-hidden-input"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  )
}

export default PhotoUploader
