/**
 * Formats a date string into a localized format
 * 
 * @param dateString - Date string to format (can be ISO format or any valid date string)
 * @param locale - Locale to use for formatting (defaults to browser locale)
 * @returns Formatted date string
 */
export function formatDate(dateString?: string | null, locale?: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
}

/**
 * Formats a date string to show relative time (e.g., "2 days ago", "in 3 months")
 * 
 * @param dateString - Date string to format
 * @returns Relative time string
 */
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';
    
    if (diffInDays > 0) {
      if (diffInDays < 30) return `In ${diffInDays} days`;
      if (diffInDays < 365) {
        const months = Math.round(diffInDays / 30);
        return `In ${months} ${months === 1 ? 'month' : 'months'}`;
      }
      const years = Math.round(diffInDays / 365);
      return `In ${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      const absDiffInDays = Math.abs(diffInDays);
      if (absDiffInDays < 30) return `${absDiffInDays} days ago`;
      if (absDiffInDays < 365) {
        const months = Math.round(absDiffInDays / 30);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      }
      const years = Math.round(absDiffInDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Error formatting date';
  }
}