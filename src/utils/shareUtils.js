// eslint-disable-next-line no-unused-vars
/* global navigator, window, console, ClipboardItem, fetch, Image */

/**
 * Checks if the current device is mobile
 * @returns {boolean} - True if mobile device
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Shares content to WhatsApp
 * @param {string} text - Text to share
 */
export function shareToWhatsApp(text) {
  const encodedText = encodeURIComponent(text)

  if (isMobileDevice()) {
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
  } else {
    window.open(`https://web.whatsapp.com/send?text=${encodedText}`, '_blank')
  }
}

/**
 * Copies image to clipboard
 * @param {Blob} blob - Image blob to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyImageToClipboard(blob) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    return true
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err)
    return false
  }
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err)
    return false
  }
}