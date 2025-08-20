/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Calculate time difference in days
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Sanitize string for safe usage
 */
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '')
}

/**
 * Generate random AI score (1-5)
 */
export function generateAIScore(): number {
  return Math.floor(Math.random() * 5) + 1
}