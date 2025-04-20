import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format relative time (e.g., "2 hours ago", "3 days ago")
export const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`

  // For older messages, show the actual date
  return date.toLocaleDateString()
}

// Format the odds value to a readable string
export const formatOdds = (odds: number) => {
  const oddsMap: Record<number, string> = {
      1: "1 in 2",
      2: "1 in 10",
      3: "1 in 100",
      4: "1 in 1,000",
      5: "1 in 1,000,000",
  }
  return oddsMap[odds] || odds.toString()
}

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}