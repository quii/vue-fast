// eslint-disable-next-line no-unused-vars
/* global navigator, window, console, ClipboardItem, fetch, Image, document, setTimeout, URL */

import { createApp, h } from 'vue'
import RoundScores from '@/components/RoundScores.vue'
import { formatRoundName } from '@/domain/scoring/round/formatting.js'

/**
 * Generates an SVG representation of a score sheet
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - SVG data URL
 */
export async function generateScoreSheetSvg({
                                              gameType,
                                              date,
                                              shotAt,
                                              archerName,
                                              gender,
                                              handicap,
                                              bowType,
                                              ageGroup,
                                              classification,
                                              scores,
                                              endSize
                                            }) {
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
          }, `${formatRoundName(gameType)} - ${date}`),

          shotAt && h('h3', {
            style: {
              textAlign: 'center',
              marginBottom: '20px'
            }
          }, `Shot at ${shotAt}`),

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
              handicap !== null && h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Handicap:')
            ]),

            // Left column - values
            h('div', {
              style: {
                flex: '1',
                textAlign: 'left',
                paddingLeft: '10px'
              }
            }, [
              h('div', { style: { marginBottom: '8px' } }, archerName),
              h('div', {
                style: {
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }
              }, gender),
              handicap !== null && h('div', { style: { marginBottom: '8px' } }, handicap)
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
              classification && classification.name && h('div', {
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
              }, bowType),
              h('div', {
                style: {
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }
              }, ageGroup),
              classification && classification.name && h('div', {
                style: {
                  marginBottom: '8px'
                }
              }, `${classification.name} (${classification.scheme})`)
            ])
          ]),

          // Use RoundScores component
          h(RoundScores, {
            scores: scores,
            gameType: gameType,
            endSize: endSize,
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
    const endCount = scores.length
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
 * @param {HTMLElement} container - The container element
 */
function applyScoreSheetStyles(container) {
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
        if (cell.textContent.trim() === 'R/T') {
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
 * @param {string} svgData - SVG data URL
 * @returns {Promise<string>} - PNG data URL
 */
export function svgToPng(svgData) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = svgData
  })
}