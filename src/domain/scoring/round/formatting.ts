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

  // Get current date (reset time to midnight for accurate day comparison)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Reset time on the input date for accurate comparison
  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)

  // Calculate difference in days
  const diffTime = today.getTime() - targetDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // Return contextual string based on difference
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} days ago`
  } else {
    // Format as DD/MM/YY
    const day = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObj.getFullYear().toString().slice(-2)
    return `${day}/${month}/${year}`
  }
}