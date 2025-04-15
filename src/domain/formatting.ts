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
