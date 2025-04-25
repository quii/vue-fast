//todo: refactor usages of this to the round instance
export function formatRoundName(roundName) {
  if (!roundName) return "";

  // Split the round name into words
  const words = roundName.split(" ");

  // Process each word
  return words.map(word => {
    // Check if the word is a Roman numeral (i, ii, iii, iv, v, etc.)
    const romanNumeralPattern = /^(i{1,3}|iv|v|vi{1,3}|ix|x|xi{1,3}|xiv|xv|xvi{1,3})$/i;

    if (romanNumeralPattern.test(word)) {
      // If it's a Roman numeral, convert to uppercase
      return word.toUpperCase();
    } else {
      // Otherwise, capitalize first letter only
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }).join(" ");
}

export function formatDateContextually(date: string | Date): string {
  if (!date) return ''

  // Convert to Date object if it's a string
  const dateObj = date instanceof Date ? date : new Date(date)

  // Check if valid date
  if (isNaN(dateObj.getTime())) return ''

  // Get current date and time
  const now = new Date()

  // Calculate difference in milliseconds
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  // Reset time to midnight for day comparison
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)

  // Calculate difference in days based on calendar days
  const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))

  // Return contextual string based on difference
  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'} ago`
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  } else if (diffDays === 0) {
    // This case should not happen with our logic, but keeping it for safety
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} days ago`
  } else if (diffDays <= 28) {
    // Use a more conservative approach for weeks (4 weeks max)
    return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} ago`
  } else {
    // Format as DD/MM/YY for anything older than 4 weeks
    const day = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObj.getFullYear().toString().slice(-2)
    return `${day}/${month}/${year}`
  }
}