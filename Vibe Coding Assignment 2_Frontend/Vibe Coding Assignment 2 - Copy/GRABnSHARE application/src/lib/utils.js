/**
 * Simple class name merger utility.
 * Filters out falsy values and joins the remaining class names.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}