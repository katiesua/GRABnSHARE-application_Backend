/**
 * Shared date and time formatting utilities for GRABnSHARE.
 * Used by both organiser (MyPosts) and student pages.
 */

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const monthIndex = Number(parts[1]) - 1
  return `${Number(parts[2])} ${months[monthIndex]} ${parts[0]}`
}

export function formatTime12(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const now = Date.now()
  const created = new Date(isoString).getTime()
  const diffMs = now - created
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return formatDate(isoString.split('T')[0])
}
