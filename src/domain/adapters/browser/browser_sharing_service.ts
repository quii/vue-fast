import { ScoresheetOptions, SharingPort, LiveShootExportOptions } from '@/domain/ports/sharing'
import { HistoryItem } from '@/domain/repositories/player_history'
import { Shoot, groupParticipantsByRound, getUniqueRoundNames } from '../../../../shared/models/Shoot'
import { copyImageToClipboard, isMobileDevice, shareToWhatsApp } from '@/utils/shareUtils.js'
import { roundConfigManager } from '@/domain/scoring/game_types'
import { createApp, h } from 'vue'
import { formatRoundName } from '@/domain/scoring/round/formatting'
import RoundScores from '@/components/RoundScores.vue'
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
} from 'chart.js';

// Register only essential Chart.js components globally (these are safe)
// Avoid registering interactive plugins globally to prevent interference
let componentsRegistered = false;

function ensureComponentsRegistered() {
  if (!componentsRegistered) {
    // Register core components that are needed for chart structure
    Chart.register(
      LineController,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement
      // Note: Legend and Tooltip are NOT registered globally to avoid interference
    );
    componentsRegistered = true;
  }
}

/**
 * Get the correct classification colors matching the project's color scheme
 */
function getClassificationStyle(classification: string | null): { backgroundColor: string; color: string } {
  if (!classification) return { backgroundColor: '#f0f0f0', color: '#666' }
  
  switch (classification) {
    case 'B1':
      return { backgroundColor: 'hsl(3, 84%, 36%)', color: 'white' }
    case 'B2':
      return { backgroundColor: 'hsl(3, 84%, 46%)', color: 'white' }
    case 'B3':
      return { backgroundColor: 'hsl(3, 84%, 56%)', color: 'white' }
    case 'A3':
      return { backgroundColor: 'hsl(207, 85%, 90%)', color: '#061345' }
    case 'A2':
      return { backgroundColor: 'hsl(207, 85%, 80%)', color: '#061345' }
    case 'A1':
      return { backgroundColor: 'hsl(207, 85%, 72%)', color: '#061345' }
    case 'MB':
    case 'GMB':
    case 'EMB':
      return { backgroundColor: 'rebeccapurple', color: 'white' }
    default:
      return { backgroundColor: '#f0f0f0', color: '#666' }
  }
}

/**
 * Generate HTML for a classification pill
 */
function generateClassificationPill(classification: string | null): string {
  if (!classification) return ''
  
  const style = getClassificationStyle(classification)
  return `<span style="display: inline-block; padding: 0.3em 0.7em; border-radius: 12px; font-size: 0.85em; font-weight: bold; min-width: 2.5em; text-align: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); background-color: ${style.backgroundColor}; color: ${style.color}; margin-left: 0.5em;">${classification}</span>`
}

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

  async generateLiveShootExport(shoot: Shoot, options: LiveShootExportOptions): Promise<string> {
    try {
      console.log('Generating simplified live shoot export for:', shoot.title || 'Untitled Shoot')
      
      // Group participants by round
      const participantsByRound = groupParticipantsByRound(shoot.participants)
      const roundNames = getUniqueRoundNames(shoot.participants)
      
      // Create HTML for each round with leaderboard + scorecards
      let html = `
        <div style="background: white; padding: 30px; font-family: Arial, sans-serif; color: black; line-height: 1.4;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
            <h1 style="margin: 0 0 10px 0; font-size: 2.2em; color: #333;">${shoot.title || 'Live Shoot Results'}</h1>
            <p style="margin: 0; font-size: 1.1em; color: #666;">Code: ${shoot.code} • ${new Date(shoot.createdAt).toLocaleDateString()}</p>
          </div>
      `
      
      // For each round, show leaderboard and then all scorecards
      for (const roundName of roundNames) {
        const participants = participantsByRound[roundName] || []
        if (participants.length === 0) continue
        
        const sortedParticipants = [...participants].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
        
        html += `
          <div style="margin-bottom: 50px; page-break-inside: avoid;">
            <h2 style="font-size: 1.8em; color: #333; margin-bottom: 20px; padding-left: 0;">${formatRoundName(roundName)}</h2>
            
            <!-- Leaderboard table -->
            <div style="overflow: hidden; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse; background-color: white;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold;">Pos.</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold;">Archer</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-weight: bold;">Score</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-weight: bold;">Arrows</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold;">Classification</th>
                  </tr>
                </thead>
                <tbody>
        `
        
        // Add leaderboard rows
        sortedParticipants.forEach((participant, index) => {
          const colors = ['#FFD700', '#C0C0C0', '#CD7F32']
          const posColor = index < 3 ? colors[index] : '#333'
          const bgColor = index % 2 === 0 ? 'white' : '#f8f9fa'
          
          html += `
            <tr style="background-color: ${bgColor};">
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; color: ${posColor};">${index + 1}.</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${participant.archerName}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; font-size: 1.1em;">${participant.totalScore || 0}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">${participant.arrowsShot || 0}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${participant.currentClassification ? generateClassificationPill(participant.currentClassification) : '<span style="font-style: italic; color: #999;">Not classified</span>'}</td>
            </tr>
          `
        })
        
        html += `
                </tbody>
              </table>
            </div>
            
            <!-- Participant Scorecards -->
        `
        
        // Add each participant's scorecard
        for (const participant of sortedParticipants) {
          try {
            const scorecardHtml = await generateSimpleParticipantScorecard(participant)
            html += `<div style="margin-bottom: 5px; page-break-inside: avoid;">${scorecardHtml}</div>`
          } catch (error) {
            console.error('Error generating scorecard for participant:', participant.archerName, error)
            // Continue with other participants even if one fails
          }
        }
        
        html += `</div>` // End round section
      }
      
      // Footer
      html += `
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 0.9em;">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Total Participants: ${shoot.participants.length} • Rounds: ${roundNames.map(name => formatRoundName(name)).join(', ')}</p>
          </div>
        </div>
      `
      
      // Convert HTML to SVG
      const svgData = await htmlToSvg(html)
      console.log('HTML to SVG conversion successful, SVG length:', svgData.length)
      
      // Convert SVG to PNG
      const pngData = await svgToPng(svgData)
      console.log('SVG to PNG conversion successful, PNG length:', pngData.length)
      
      return pngData
      
    } catch (error) {
      console.error('Error generating live shoot export:', error)
      throw error
    }
  }

  async shareLiveShootResults(dataUrl: string, text: string): Promise<void> {
    try {
      // Try to use Web Share API on mobile devices
      if (this.canShareNatively()) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'shoot-results.png', { type: 'image/png' });

          await navigator.share({
            title: 'Live Shoot Results',
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
      console.error('Error sharing live shoot results:', error);
      throw error;
    }
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
      const htmlCell = cell as HTMLElement
      htmlCell.style.border = '1px solid #333'
      htmlCell.style.padding = '10px'
      htmlCell.style.textAlign = 'center'

      // Don't override background color for score cells
      if (!htmlCell.className.includes('score')) {
        htmlCell.style.backgroundColor = ''
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
            const htmlRowCell = rowCell as HTMLElement
            htmlRowCell.style.fontWeight = 'bold'
            htmlRowCell.style.backgroundColor = '#f0f0f0'
          })
        }
      })
    })

    // Style the final score row (last row)
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1]
      const lastRowCells = lastRow.querySelectorAll('td')
      lastRowCells.forEach(cell => {
        const htmlCell = cell as HTMLElement
        htmlCell.style.fontWeight = 'bold'
        htmlCell.style.backgroundColor = '#e6e6e6'
        htmlCell.style.fontSize = '1.1em'
      })
    }
  })
}

/**
 * Generates cumulative score graph data for participants
 * @param participants - Array of participants
 * @returns Chart configuration data
 */
function generateCumulativeScoreGraphData(participants: any[]) {
  const datasets: any[] = []
  const colors = [
    'rgba(255, 99, 132, 1)',   // Red
    'rgba(54, 162, 235, 1)',   // Blue
    'rgba(255, 206, 86, 1)',   // Yellow
    'rgba(75, 192, 192, 1)',   // Teal
    'rgba(153, 102, 255, 1)',  // Purple
    'rgba(255, 159, 64, 1)',   // Orange
    'rgba(199, 199, 199, 1)',  // Gray
    'rgba(83, 102, 255, 1)',   // Indigo
    'rgba(255, 99, 255, 1)',   // Pink
    'rgba(99, 255, 132, 1)',   // Green
  ]

  participants.forEach((participant, index) => {
    const dataPoints: { x: number; y: number }[] = []
    
    // Get the round configuration to determine end size
    const roundConfig = roundConfigManager.getRound(participant.roundName)
    const endSize = roundConfig?.endSize || 6

    if (participant.scores && participant.scores.length > 0) {
      // Use individual arrow scores to build cumulative progression by end
      let cumulative = 0
      let endNumber = 1
      
      // Start with end 0 (before shooting)
      dataPoints.push({ x: 0, y: 0 })
      
      participant.scores.forEach((score: any, arrowIndex: number) => {
        // Convert string scores to numbers, skip invalid ones
        const numericScore = typeof score === 'number' ? score : 
                           (typeof score === 'string' && !isNaN(Number(score))) ? Number(score) : 0
        
        if (numericScore >= 0) { // Allow 0 scores
          cumulative += numericScore
        }
        
        // Check if we've completed an end
        if ((arrowIndex + 1) % endSize === 0) {
          dataPoints.push({
            x: endNumber,
            y: cumulative
          })
          endNumber++
        }
      })
      
      // If there are remaining arrows in an incomplete end, add a point for the current progress
      if (participant.scores.length % endSize !== 0) {
        dataPoints.push({
          x: endNumber,
          y: cumulative
        })
      }
      
    } else if (participant.totalScore > 0) {
      // For participants without detailed scores, create a simple progression by estimated ends
      const totalArrows = participant.arrowsShot || Math.max(6, Math.ceil(participant.totalScore / 10))
      const estimatedEnds = Math.ceil(totalArrows / endSize)
      
      // Create progression points (start, incremental ends, current)
      dataPoints.push({ x: 0, y: 0 }) // Starting point
      
      for (let end = 1; end <= estimatedEnds; end++) {
        const progressRatio = end / estimatedEnds
        const scoreAtEnd = Math.floor(participant.totalScore * progressRatio)
        dataPoints.push({
          x: end,
          y: scoreAtEnd
        })
      }
      
      // Ensure final point shows exact total score
      if (estimatedEnds > 0) {
        dataPoints[dataPoints.length - 1].y = participant.totalScore
      }
    } else {
      // No score data available, skip this participant
      return
    }

    const color = colors[index % colors.length]
    
    datasets.push({
      label: participant.archerName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color.replace('1)', '0.1)'),
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    })
  })

  return {
    labels: [], // Not used for scatter/line plots with x,y data
    datasets
  }
}

/**
 * Generates a cumulative score graph as SVG
 * @param participants - Array of participants
 * @param title - Graph title
 * @returns SVG string
 */
async function generateCumulativeScoreGraph(participants: any[], title: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Skip if no participants with data
      const chartData = generateCumulativeScoreGraphData(participants)
      if (chartData.datasets.length === 0) {
        resolve('')
        return
      }
      
      // Create a canvas element
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 400
      document.body.appendChild(canvas) // Add to DOM temporarily
      
      // Ensure Chart.js components are registered before creating chart
      ensureComponentsRegistered();
      
      // Create Chart.js chart
      const chart = new Chart(canvas, {
        type: 'line',
        data: chartData,
        options: {
          responsive: false,
          animation: false,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: {
                  size: 12
                },
                usePointStyle: true
              }
            }
          },
          scales: {
            x: {
              type: 'linear',
              beginAtZero: true,
              title: {
                display: true,
                text: 'End Number',
                font: {
                  size: 12
                }
              },
              ticks: {
                stepSize: 1,
                font: {
                  size: 10
                }
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cumulative Score',
                font: {
                  size: 12
                }
              },
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          }
        },
        plugins: [Legend, Tooltip] // Register Legend and Tooltip plugins per-chart to avoid global interference
      })

      // Wait for chart to render, then convert to data URL
      setTimeout(() => {
        try {
          // Get canvas as data URL (PNG format)
          const dataUrl = canvas.toDataURL('image/png')
          chart.destroy()
          document.body.removeChild(canvas)
          resolve(dataUrl)
        } catch (error) {
          chart.destroy()
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas)
          }
          reject(error)
        }
      }, 200) // Give more time for rendering
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generates a participant scorecard as SVG
 * @param participant - Participant data
 * @returns SVG data URL
 */
async function generateParticipantScorecard(participant: any): Promise<string> {
  try {
    // Skip if no detailed scores available
    if (!participant.scores || participant.scores.length === 0) {
      return ''
    }

    // Create a temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.padding = '20px'
    document.body.appendChild(container)

    // Get round configuration
    const roundConfig = roundConfigManager.getRound(participant.roundName)
    const endSize = roundConfig?.endSize || 6

    // Create a Vue app to render the scorecard
    const app = createApp({
      render() {
        return h('div', {
          style: {
            backgroundColor: 'white',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            color: 'black',
            lineHeight: '1.4'
          }
        }, [
          // Header
          h('div', {
            style: {
              textAlign: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #333',
              paddingBottom: '15px'
            }
          }, [
            h('h2', {
              style: {
                margin: '0 0 10px 0',
                fontSize: '1.8em',
                color: '#333'
              }
            }, `${participant.archerName}'s Scorecard`),
            
            h('p', {
              style: {
                margin: '0 0 5px 0',
                fontSize: '1.1em',
                color: '#666'
              }
            }, formatRoundName(participant.roundName)),

            h('p', {
              style: {
                margin: '0',
                fontSize: '1em',
                color: '#666'
              }
            }, `Total Score: ${participant.totalScore} • ${participant.arrowsShot} arrows`)
          ]),

          // Scorecard
          h(RoundScores, {
            scores: participant.scores,
            gameType: participant.roundName,
            endSize: endSize,
            forceLandscape: true, // Force landscape for better export layout
            userProfile: {}
          })
        ])
      }
    })

    // Mount the app
    app.mount(container)

    // Wait for Vue to render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Convert to SVG using SVG foreignObject
    const svgHeight = container.offsetHeight + 50 // Add some padding
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${container.offsetWidth}" height="${svgHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${container.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `

    const svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`

    // Clean up
    app.unmount()
    document.body.removeChild(container)

    return svgData
  } catch (error) {
    console.error('Error generating participant scorecard:', error)
    return ''
  }
}

/**
 * Generates an SVG representation of live shoot results
 * @param shoot - The live shoot data
 * @param options - Export options
 * @returns - SVG data URL
 */
/**
 * Generates a proper participant scorecard using the same Vue components as PrintModal
 * @param participant - Participant data from live shoot
 * @returns HTML string of the scorecard
 */
async function generateSimpleParticipantScorecard(participant: any): Promise<string> {
  try {
    // Check if participant has detailed scores
    if (!participant.scores || participant.scores.length === 0) {
      // Return a simple summary card instead of a detailed scorecard
      return `
        <div style="background: white; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif;">
          <h3 style="text-align: center; margin-bottom: 15px; color: #333;">${participant.archerName}</h3>
          <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 1.2em; color: #666; margin-bottom: 8px;">${formatRoundName(participant.roundName) || 'Unknown Round'}</div>
            <div style="font-size: 2em; font-weight: bold; color: #27ae60; margin-bottom: 8px;">${participant.totalScore || 0}</div>
            <div style="color: #666;">${participant.arrowsShot || 0} arrows shot</div>
          </div>
        </div>
      `
    }

    // Create a temporary container for Vue rendering (same approach as PrintModal)
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.padding = '20px'
    document.body.appendChild(container)

    // Get round configuration for proper endSize
    const roundConfig = roundConfigManager.getRound(participant.roundName)
    const endSize = roundConfig?.endSize || 6

    // Create a Vue app to render the scorecard using the same components as PrintModal
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
          // Header
          h('h3', {
            style: {
              textAlign: 'center',
              marginBottom: '15px',
              color: '#333'
            }
          }, participant.archerName),



          // Use the same RoundScores component as PrintModal
          h(RoundScores, {
            scores: participant.scores,
            gameType: participant.roundName,
            endSize: endSize,
            forceLandscape: true,
            userProfile: {
              gender: participant.gender || 'unknown',
              ageGroup: participant.ageGroup || 'unknown',
              bowType: participant.bowType || 'unknown'
            }
          }),

          // No classification info displayed here anymore since it's in the section title
        ])
      }
    })

    // Register the RoundScores component
    app.component('RoundScores', RoundScores)
    app.mount(container)

    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Apply the same styling as the scoresheet generation
    applyScoreSheetStyles(container)

    // Get the rendered HTML
    const renderedHTML = container.innerHTML

    // Clean up
    app.unmount()
    document.body.removeChild(container)

    return `<div style="background: white; padding: 8px; margin: 3px 0; page-break-inside: avoid;">${renderedHTML}</div>`

  } catch (error) {
    console.error('Error generating participant scorecard:', error)
    // Return a minimal fallback
    return `
      <div style="background: white; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif;">
        <h3 style="text-align: center; margin-bottom: 15px; color: #333;">${participant.archerName}</h3>
        <div style="text-align: center; color: #999; font-style: italic;">Scorecard temporarily unavailable</div>
      </div>
    `
  }
}

/**
 * Creates HTML content for export
 */
function createExportHTML(shoot: any, options: any, roundGroups: any, roundNames: string[], cumulativeGraphs: any, participantScorecards: any): string {
  let html = `
    <div style="background: white; padding: 30px; font-family: Arial, sans-serif; color: black; line-height: 1.4;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="margin: 0 0 10px 0; font-size: 2.2em; color: #333;">${shoot.title || 'Live Shoot Results'}</h1>
        <p style="margin: 0; font-size: 1.1em; color: #666;">Code: ${shoot.code} • ${new Date(shoot.createdAt).toLocaleDateString()}</p>
        ${options.location ? `<p style="margin: 5px 0 0 0; font-size: 1em; color: #666;">Location: ${options.location}</p>` : ''}
      </div>
  `

  // Round-by-round results
  roundNames.forEach(roundName => {
    const participants = roundGroups[roundName] || []
    const sortedParticipants = [...participants].sort((a: any, b: any) => b.totalScore - a.totalScore)
    
    html += `
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 1.6em; color: #333; margin-bottom: 15px; padding-left: 0;">${formatRoundName(roundName)}</h2>
        
        <!-- Leaderboard table -->
        <div style="overflow: hidden; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse; background-color: white;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold;">Pos.</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold;">Archer</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-weight: bold;">Score</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-weight: bold;">Arrows</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold;">Classification</th>
              </tr>
            </thead>
            <tbody>
    `

    sortedParticipants.forEach((participant: any, index: number) => {
      const colors = ['#FFD700', '#C0C0C0', '#CD7F32']
      const posColor = index < 3 ? colors[index] : '#333'
      const bgColor = index % 2 === 0 ? 'white' : '#f8f9fa'
      
      html += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; color: ${posColor};">${index + 1}.</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${participant.archerName}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; font-size: 1.1em;">${participant.totalScore}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">${participant.arrowsShot}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-style: ${participant.currentClassification ? 'normal' : 'italic'}; color: ${participant.currentClassification ? '#333' : '#999'};">${participant.currentClassification || 'Not classified'}</td>
        </tr>
      `
    })

    html += `
            </tbody>
          </table>
        </div>
    `

    // Add cumulative graph if available
    if (cumulativeGraphs[roundName]) {
      html += `
        <div style="margin-bottom: 30px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Score Progression</h3>
          <img src="${cumulativeGraphs[roundName]}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px;" />
        </div>
      `
    }

    // Add participant scorecards
    sortedParticipants.forEach((participant: any) => {
      if (participantScorecards[participant.id]) {
        html += `<div style="margin-bottom: 30px;">${participantScorecards[participant.id]}</div>`
      }
    })

    html += `</div>`
  })

  // Summary section
  html += `
    <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
      <h3 style="margin: 0 0 15px 0; color: #333;">Shoot Summary</h3>
      <p style="margin: 5px 0; color: #666;">Total Participants: ${shoot.participants.length}</p>
      <p style="margin: 5px 0; color: #666;">Rounds: ${roundNames.map(name => formatRoundName(name)).join(', ')}</p>
      <p style="margin: 5px 0; color: #666;">Last Updated: ${new Date(shoot.lastUpdated).toLocaleString()}</p>
    </div>
  `

  html += `</div>`
  return html
}

/**
 * Converts HTML content to canvas
 */
async function htmlToCanvas(htmlContent: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.width = '1000px'
      container.style.padding = '20px'
      container.innerHTML = htmlContent
      document.body.appendChild(container)

      // Wait for any images to load
      const images = container.querySelectorAll('img')
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolveImg) => {
          if (img.complete) {
            resolveImg(undefined)
          } else {
            img.onload = () => resolveImg(undefined)
            img.onerror = () => resolveImg(undefined) // Continue even if image fails
          }
        })
      })

      Promise.all(imagePromises).then(() => {
        setTimeout(() => {
          try {
            // Create canvas
            const canvas = document.createElement('canvas')
            const containerRect = container.getBoundingClientRect()
            canvas.width = Math.max(1000, containerRect.width)
            canvas.height = Math.max(600, containerRect.height + 100)

            const ctx = canvas.getContext('2d')
            if (!ctx) {
              reject(new Error('Failed to get canvas context'))
              return
            }

            // Fill with white background
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Use html2canvas-like approach with DOM-to-Canvas API
            // For now, we'll create a simple text-based export as a fallback
            ctx.fillStyle = 'black'
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'
            
            let y = 50
            ctx.fillText(container.textContent?.slice(0, 100) || 'Export Generated', canvas.width / 2, y)
            
            // Clean up
            document.body.removeChild(container)
            resolve(canvas)
          } catch (error) {
            if (document.body.contains(container)) {
              document.body.removeChild(container)
            }
            reject(error)
          }
        }, 200)
      }).catch(reject)
    } catch (error) {
      reject(error)
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
    try {
      // If it's already a PNG data URL, return it directly
      if (svgData.startsWith('data:image/png')) {
        resolve(svgData)
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width || 800
          canvas.height = img.height || 600

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Fill with white background
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)

          resolve(canvas.toDataURL('image/png'))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          reject(new Error(`Failed to convert image to PNG: ${errorMessage}`))
        }
      }
      
      img.onerror = (error) => {
        console.error('Image load error:', error, 'SVG data length:', svgData.length)
        reject(new Error(`Failed to load SVG image: ${error}`))
      }
      
      img.src = svgData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      reject(new Error(`SVG to PNG conversion failed: ${errorMessage}`))
    }
  })
}

/**
 * Converts HTML string to SVG data URL
 * @param html - HTML string to convert
 * @returns - SVG data URL
 */
async function htmlToSvg(html: string): Promise<string> {
  try {
    // Create a temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.padding = '20px'
    container.innerHTML = html
    document.body.appendChild(container)

    // Calculate dimensions
    const svgWidth = container.offsetWidth
    const svgHeight = Math.max(container.offsetHeight, 600) // Minimum height

    // Convert HTML to SVG using SVG foreignObject
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${container.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `

    // Clean up
    document.body.removeChild(container)

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
  } catch (error) {
    console.error('Error converting HTML to SVG:', error)
    throw error
  }
}


