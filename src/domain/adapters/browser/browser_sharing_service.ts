import { ScoresheetOptions, SharingPort } from '@/domain/ports/sharing'
import { HistoryItem } from '@/domain/repositories/player_history'
import { copyImageToClipboard, isMobileDevice, shareToWhatsApp } from '@/utils/shareUtils.js'
import { roundConfigManager } from '@/domain/scoring/game_types'
import { createApp, h } from 'vue'
import { formatRoundName } from '@/domain/scoring/round/formatting'
import RoundScores from '@/components/RoundScores.vue'

type ScoreSheetParams = Pick<HistoryItem, 'gameType' | 'date' | 'scores' | 'classification' | 'handicap'> & {
  shotAt?: string;
  archerName: string;
  gender?: string;
  bowType?: string;
  ageGroup?: string;
  endSize: number;
};

export class BrowserSharingService implements SharingPort {
  async generateScoresheet(historyItem: HistoryItem, options: ScoresheetOptions): Promise<string> {
    const endSize = roundConfigManager.getConfig(historyItem.gameType)?.endSize ?? 6
    try {
      // Extract necessary data from history item
      const svgData = await generateScoreSheetSvg({
        gameType: historyItem.gameType,
        date: historyItem.date,
        shotAt: options.location,
        archerName: options.archerName,
        gender: historyItem.userProfile?.gender,
        handicap: historyItem.handicap,
        bowType: historyItem.userProfile?.bowType,
        ageGroup: historyItem.userProfile?.ageGroup,
        classification: historyItem.classification,
        scores: historyItem.scores,
        endSize
      });

      // Convert SVG to PNG for better compatibility
      const pngData = await svgToPng(svgData);
      return pngData;
    } catch (error) {
      console.error('Error generating scoresheet:', error);
      throw error;
    }
  }

  async shareScoresheet(dataUrl: string, text: string): Promise<void> {
    try {
      // Try to use Web Share API on mobile devices
      if (this.canShareNatively()) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'scoresheet.png', { type: 'image/png' });

          await navigator.share({
            title: 'Archery Score',
            text: text,
            files: [file]
          });
          return;
        } catch (error) {
          console.log('Error sharing with Web Share API:', error);
          // Fall through to WhatsApp sharing if Web Share API fails
        }
      }

      // Fallback to WhatsApp sharing
      shareToWhatsApp(text);
    } catch (error) {
      console.error('Error sharing scoresheet:', error);
      throw error;
    }
  }

  /**
   * Copy a scoresheet to the clipboard
   */
  async copyScoresheet(dataUrl: string): Promise<boolean> {
    try {
      // Get PNG as blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Try to copy the image
      const success = await copyImageToClipboard(blob);

      if (!success) {
        // If image copy fails, we'll return false and let the component
        // decide what to do (e.g., fall back to text)
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error copying scoresheet:', error);
      return false;
    }
  }

  /**
   * Check if the current device supports native sharing
   */
  canShareNatively(): boolean {
    return !!navigator.share && isMobileDevice();
  }
}

/**
 * Generates an SVG representation of a score sheet
 * @param options - Configuration options
 * @returns - SVG data URL
 */
async function generateScoreSheetSvg(options: ScoreSheetParams): Promise<string> {
  try {
    // Create a temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.padding = '20px'
    document.body.appendChild(container)

    // Create a Vue app to render the components
    const app = createApp({
      render() {
        return h('div', {
          style: {
            backgroundColor: 'white',
            padding: '20px',
            fontFamily: 'Arial',
            color: 'black'
          }
        }, [
          // Header content
          h('h2', {
            style: {
              textAlign: 'center',
              textTransform: 'capitalize',
              marginBottom: '15px'
            }
          }, `${formatRoundName(options.gameType)} - ${options.date}`),

          options.shotAt && h('h3', {
            style: {
              textAlign: 'center',
              marginBottom: '20px'
            }
          }, `Shot at ${options.shotAt}`),

          // Archer details section
          h('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              margin: '20px 0',
              padding: '15px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }
          }, [
            // Left column - labels
            h('div', {
              style: {
                flex: '1'
              }
            }, [
              h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Archer:'),
              h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Gender:'),
              options.handicap !== null && h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Handicap:')
            ]),

            // Left column - values
            h('div', {
              style: {
                flex: '1',
                textAlign: 'left',
                paddingLeft: '10px'
              }
            }, [
              h('div', { style: { marginBottom: '8px' } }, options.archerName),
              h('div', {
                style: {
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }
              }, options.gender),
              options.handicap !== null && h('div', { style: { marginBottom: '8px' } }, options.handicap)
            ]),

            // Right column - labels
            h('div', {
              style: {
                flex: '1',
                textAlign: 'right',
                paddingRight: '10px'
              }
            }, [
              h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Bow Type:'),
              h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Age Group:'),
              options.classification && options.classification.name && h('div', {
                style: {
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }
              }, 'Classification:')
            ]),

            // Right column - values
            h('div', {
              style: {
                flex: '1',
                textAlign: 'left'
              }
            }, [
              h('div', {
                style: {
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }
              }, options.bowType),
              h('div', {
                style: {
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }
              }, options.ageGroup),
              options.classification && options.classification.name && h('div', {
                style: {
                  marginBottom: '8px'
                }
              }, `${options.classification.name} (${options.classification.scheme})`)
            ])
          ]),

          // Use RoundScores component
          h(RoundScores, {
            scores: options.scores,
            gameType: options.gameType,
            endSize: options.endSize,
            forceLandscape: true
          }),

          // Add an extra spacer div at the bottom
          h('div', {
            style: {
              height: '40px'
            }
          })
        ])
      }
    })

    app.component('RoundScores', RoundScores)
    app.mount(container)

    // Wait a bit for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Add styling
    applyScoreSheetStyles(container)

    // Calculate dimensions with extra padding for shorter shoots
    let svgHeight = container.offsetHeight

    // Add extra height for shorter shoots (fewer ends)
    const endCount = options.scores.length
    if (endCount < 10) {
      const extraPadding = Math.max(0, (10 - endCount) * 10)
      svgHeight += extraPadding
    }

    // Always add a minimum extra padding
    svgHeight += 30

    // Convert HTML to SVG using SVG foreignObject
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${container.offsetWidth}" height="${svgHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${container.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `

    // Clean up
    app.unmount()
    document.body.removeChild(container)

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`
  } catch (error) {
    console.error('Error generating SVG:', error)
    throw error
  }
}

/**
 * Applies styling to the score sheet container
 * @param container - The container element
 */
function applyScoreSheetStyles(container: HTMLElement): void {
  // Add a style element with the score coloring CSS
  const styleElement = document.createElement('style')
  styleElement.textContent = `
    .score9, .score10, .scoreX {
      background-color: #fefc2a !important;
      color: black !important;
    }

    .round-subtotal {
    background-color: #f2f2f2 !important;
    }

    .score7, .score8 {
      background-color: #fc2e2a !important;
      color: white !important;
    }

    .score5, .score6 {
      background-color: #2790f9 !important;
      color: white !important;
    }

    .score3, .score4 {
      background-color: black !important;
      color: white !important;
    }

    .score1, .score2 {
      background-color: white !important;
      color: black !important;
      border: 1px solid #333 !important;
    }

    .scoreM {
      background-color: darkgreen !important;
      color: white !important;
    }
  `
  container.appendChild(styleElement)

  // Style tables
  const tables = container.querySelectorAll('table')
  tables.forEach(table => {
    // Add border to table
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'
    table.style.border = '1px solid #333'

    // Style all cells
    const cells = table.querySelectorAll('th, td')
    cells.forEach(cell => {
      cell.style.border = '1px solid #333'
      cell.style.padding = '10px'
      cell.style.textAlign = 'center'

      // Don't override background color for score cells
      if (!cell.className.includes('score')) {
        cell.style.backgroundColor = ''
      }
    })

    // Find and style running total rows
    const rows = table.querySelectorAll('tr')
    rows.forEach(row => {
      const cells = row.querySelectorAll('td')
      cells.forEach(cell => {
        if (cell.textContent?.trim() === 'R/T') {
          // Style all cells in this row
          cells.forEach(rowCell => {
            rowCell.style.fontWeight = 'bold'
            rowCell.style.backgroundColor = '#f0f0f0'
          })
        }
      })
    })

    // Style the final score row (last row)
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1]
      const lastRowCells = lastRow.querySelectorAll('td')
      lastRowCells.forEach(cell => {
        cell.style.fontWeight = 'bold'
        cell.style.backgroundColor = '#e6e6e6'
        cell.style.fontSize = '1.1em'
      })
    }
  })
}

/**
 * Converts SVG to PNG
 * @param svgData - SVG data URL
 * @returns - PNG data URL
 */
function svgToPng(svgData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = svgData
  })
}
