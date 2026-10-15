import { useState, useRef, useEffect, useCallback } from 'react'
import './LocationAutocomplete.css'

function LocationAutocomplete({
  label,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  suggestions = [],
}) {
  const [filtered, setFiltered] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  /* ── Filter suggestions when value changes ── */
  useEffect(() => {
    if (!value.trim()) {
      setFiltered([])
      setShowDropdown(false)
      return
    }
    const query = value.toLowerCase()
    const matches = suggestions.filter(s =>
      s.value.toLowerCase().includes(query)
    )
    setFiltered(matches)
    setShowDropdown(matches.length > 0)
    setHighlightedIndex(-1)
  }, [value, suggestions])

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ── Select a suggestion ── */
  const selectSuggestion = useCallback((suggestionValue) => {
    onChange({ target: { name: id, value: suggestionValue } })
    setShowDropdown(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }, [onChange, id])

  /* ── Keyboard navigation ── */
  function handleKeyDown(e) {
    if (!showDropdown || filtered.length === 0) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filtered.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filtered.length - 1
        )
        break
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault()
          selectSuggestion(filtered[highlightedIndex].value)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setHighlightedIndex(-1)
        break
      default:
        break
    }
  }

  /* ── Blur handler with delay for click registration ── */
  function handleBlur(e) {
    setTimeout(() => {
      setShowDropdown(false)
      setHighlightedIndex(-1)
    }, 150)
    if (onBlur) onBlur(e)
  }

  /* ── Focus handler — reopen dropdown if matches exist ── */
  function handleFocus() {
    if (filtered.length > 0 && value.trim()) {
      setShowDropdown(true)
    }
  }

  /* ── Highlight matched text in a suggestion ── */
  function highlightMatch(text) {
    if (!value.trim()) return text
    const query = value.trim()
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text
    return (
      <>
        {text.slice(0, index)}
        <strong className="la-highlight">{text.slice(index, index + query.length)}</strong>
        {text.slice(index + query.length)}
      </>
    )
  }

  const fieldClasses = [
    'form-input-field',
    'la-input',
    error ? 'form-input-field--error' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="la-wrapper" ref={wrapperRef}>
      <div className={`form-input-group ${error ? 'form-input-group--error' : ''}`}>
        <label className="form-input-label" htmlFor={id}>
          {label}
          {required && <span className="form-input-required"> *</span>}
        </label>

        <input
          ref={inputRef}
          className={fieldClasses}
          type="text"
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-expanded={showDropdown && filtered.length > 0}
          aria-autocomplete="list"
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
          }
          role="combobox"
        />

        {error && (
          <span className="form-input-error" role="alert">
            {error}
          </span>
        )}
      </div>

      {showDropdown && filtered.length > 0 && (
        <ul
          className="la-dropdown"
          id={`${id}-suggestions`}
          role="listbox"
          aria-label="Location suggestions"
        >
          {filtered.map((suggestion, index) => (
            <li
              key={suggestion.value}
              id={`${id}-option-${index}`}
              className={`la-option${index === highlightedIndex ? ' la-option--highlighted' : ''}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(suggestion.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <svg
                className="la-option-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 1.5C5.24 1.5 3 3.74 3 6.5C3 10.25 8 14.5 8 14.5C8 14.5 13 10.25 13 6.5C13 3.74 10.76 1.5 8 1.5ZM8 8.25C7.006 8.25 6.25 7.494 6.25 6.5C6.25 5.506 7.006 4.75 8 4.75C8.994 4.75 9.75 5.506 9.75 6.5C9.75 7.494 8.994 8.25 8 8.25Z"
                  fill="currentColor"
                />
              </svg>
              <span className="la-option-text">{highlightMatch(suggestion.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LocationAutocomplete
