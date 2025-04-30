<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonStack from '@/components/ui/ButtonStack.vue'
import { ref, h, createApp, onMounted } from 'vue'
import RoundScores from "@/components/RoundScores.vue";
import ArcherDetails from "@/components/ArcherDetails.vue";
import SaveScoreSheetButton from "@/components/SaveScoreSheetButton.vue";
import WhatsAppIcon from '@/components/icons/WhatsAppIcon.vue'
import CopyIcon from '@/components/icons/CopyIcon.vue'

const props = defineProps(["shoot", "archerName", "endSize", "ageGroup", "gender", "bowType", "gameType", "date", "status"]);
const emit = defineEmits(["close"]);
const targetCaptain = ref("");
const shotAt = ref("");
const showCopySuccess = ref(false)
const svgData = ref(null)
const isGenerating = ref(false)

function print() {
  const formatTitle = (str) => str ? str.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-") : "";
  const title = [
    formatTitle(props.archerName),
    shotAt.value ? formatTitle(shotAt.value) : ""
  ].filter(Boolean).join("-");

  const printWindow = window.open("", "_blank", "");
  const doc = printWindow.document;
  doc.title = title;

  const style = document.createElement("style");
  style.textContent = `
    body { font-family: Arial; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid black; padding: 8px; text-align: center; text-transform: capitalize; }
    .score { font-weight: bold; }
    .signatures { margin-top: 2em; }
    h1 { text-transform: capitalize; text-align: center; }
    h2 {text-align: center;}
    #classification { display: none; }
  `;

  const container = document.createElement("div");
  const app = createApp({
    render() {
      return h("div", [
        h("h1", `${props.gameType} - ${props.date}`),
        shotAt.value && h("h2", `Shot at ${shotAt.value}`),
        h(ArcherDetails, {
          name: props.archerName,
          ageGroup: props.ageGroup,
          gender: props.gender,
          bowType: props.bowType,
          status: props.status
        }),
        h(RoundScores, {
          scores: props.shoot.scores,
          gameType: props.shoot.gameType,
          endSize: props.endSize,
          forceLandscape: true
        })
      ]);
    }
  });

  app.component("ArcherDetails", ArcherDetails);
  app.mount(container);

  const signatures = document.createElement("div");
  signatures.className = "signatures";
  signatures.innerHTML = `
  <div class="signature-block">
    <div class="signature-row">
      <span>Target Captain: ${targetCaptain.value}</span>
      <div class="signature-line"></div>
    </div>
  </div>

  <div class="signature-block">
    <div class="signature-row">
      <span>Archer: ${props.archerName}</span>
      <div class="signature-line"></div>
    </div>
  </div>
`;

  const signatureStyles = `
  .signatures {
    margin-top: 3em;
    display: flex;
    flex-direction: column;
    gap: 6em;
  }
  .signature-row {
    display: flex;
    align-items: center;
    gap: 1em;
  }
  .signature-line {
    flex-grow: 1;
    border-bottom: 2px dotted black;
    height: 2em;
  }
`;
  style.textContent += signatureStyles;
  doc.head.appendChild(style);
  doc.body.appendChild(container);
  doc.body.appendChild(signatures);
  doc.body.appendChild(document.createElement("script")).textContent = "window.onload = () => window.print()";

  emit("close");
}

async function generateSvg() {
  isGenerating.value = true

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
          // Header content remains the same
          h('h2', {
            style: {
              textAlign: 'center',
              textTransform: 'capitalize',
              marginBottom: '15px'
            }
          }, `${props.gameType} - ${props.date}`),

          shotAt.value && h('h3', {
            style: {
              textAlign: 'center',
              marginBottom: '20px'
            }
          }, `Shot at ${shotAt.value}`),

          // Archer details section remains the same
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
              h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Gender:')
            ]),

            // Left column - values
            h('div', {
              style: {
                flex: '1',
                textAlign: 'left',
                paddingLeft: '10px'
              }
            }, [
              h('div', { style: { marginBottom: '8px' } }, props.archerName),
              h('div', {
                style: {
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }
              }, props.gender)
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
              h('div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Age Group:')
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
              }, props.bowType),
              h('div', {
                style: {
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }
              }, props.ageGroup)
            ])
          ]),

          // Use RoundScores component
          h(RoundScores, {
            scores: props.shoot.scores,
            gameType: props.gameType,
            endSize: props.endSize,
            forceLandscape: true
          }),

          // Add an extra spacer div at the bottom
          h('div', {
            style: {
              height: '40px'
            }
          })
        ]);
      }
    });

    app.component('RoundScores', RoundScores)
    app.mount(container)

    // Wait a bit for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Add a style element with the score coloring CSS
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      .score9, .score10, .scoreX {
        background-color: #fefc2a !important;
        color: black !important;
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

    // Directly modify the table styles in the DOM
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
        // that already have a class-based color
        if (!cell.className.includes('score')) {
          cell.style.backgroundColor = ''
        }
      });

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
            });
          }
        });
      });

      // Style the final score row (last row)
      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1]
        const lastRowCells = lastRow.querySelectorAll('td')
        lastRowCells.forEach(cell => {
          cell.style.fontWeight = 'bold'
          cell.style.backgroundColor = '#e6e6e6'
          cell.style.fontSize = '1.1em'
        });
      }
    });

    // Calculate dimensions with extra padding for shorter shoots
    let svgHeight = container.offsetHeight

    // Add extra height for shorter shoots (fewer ends)
    const endCount = props.shoot.scores.length
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
    `;

    // Store the SVG data
    svgData.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`

    // Clean up
    app.unmount()
    document.body.removeChild(container)
  } catch (error) {
    console.error('Error generating SVG:', error)
  } finally {
    isGenerating.value = false
  }
}

async function svgToPng() {
  if (!svgData.value) {
    await generateSvg()
  }

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
    img.src = svgData.value
  })
}

async function copyToClipboard() {
  try {
    const pngData = await svgToPng()

    const response = await fetch(pngData)
    const blob = await response.blob()

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      showCopySuccess.value = true
      setTimeout(() => {
        showCopySuccess.value = false
      }, 2000)
    } catch (err) {
      const scoreTotal = props.shoot.scores.reduce((total, end) => {
        if (Array.isArray(end)) {
          return total + end.reduce((endTotal, arrow) => endTotal + (parseInt(arrow) || 0), 0)
        }
        return total
      }, 0)

      const shareText = `${props.archerName} scored ${scoreTotal} on a ${props.gameType} round${shotAt.value ? ` at ${shotAt.value}` : ''}!`
      await navigator.clipboard.writeText(shareText)

      showCopySuccess.value = true
      setTimeout(() => {
        showCopySuccess.value = false
      }, 2000)
    }
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

async function shareToWhatsApp() {
  try {
    const pngData = await svgToPng()

    if (navigator.share && isMobileDevice()) {
      try {
        const response = await fetch(pngData)
        const blob = await response.blob()
        const file = new File([blob], `${props.archerName}-${props.gameType}.png`, { type: 'image/png' })

        await navigator.share({
          title: `${props.archerName}'s ${props.gameType} Score`,
          files: [file]
        })

        emit('close')
        return
      } catch (error) {
        console.log('Error sharing with Web Share API:', error)
      }
    }

    const scoreTotal = props.shoot.scores.reduce((total, end) => {
      if (Array.isArray(end)) {
        return total + end.reduce((endTotal, arrow) => endTotal + (parseInt(arrow) || 0), 0)
      }
      return total
    }, 0)

    const shareText = `${props.archerName} scored ${scoreTotal} on a ${props.gameType} round${shotAt.value ? ` at ${shotAt.value}` : ''}!`
    openWhatsAppDirectly(shareText)
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error)
  }
}

function openWhatsAppDirectly(text) {
  const encodedText = encodeURIComponent(text)

  if (isMobileDevice()) {
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
  } else {
    window.open(`https://web.whatsapp.com/send?text=${encodedText}`, '_blank')
  }

  emit('close')
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

onMounted(() => {
  generateSvg()
})
</script>

<template>
  <BaseModal title="Share Score Sheet">
    <form @submit.prevent="print">
      <div class="form-group">
        <label for="captain">Target Captain's Name</label>
        <input
          id="captain"
          v-model="targetCaptain"
          type="text"
          placeholder="Enter name"
          autofocus
        >
      </div>

      <div class="form-group">
        <label for="location">Shot At</label>
        <input
          id="location"
          v-model="shotAt"
          type="text"
          placeholder="Enter location (optional)"
          @input="svgData = null"
        >
      </div>

      <!-- SVG Preview -->
      <div class="preview-container">
        <h3>Score Sheet Preview</h3>
        <div v-if="isGenerating" class="generating-message">
          Generating preview...
        </div>
        <div v-else-if="svgData" class="svg-preview">
          <img :src="svgData" alt="Score Sheet Preview" />
        </div>
        <div v-else class="no-preview">
          <button type="button" @click="generateSvg" class="generate-button">
            Generate Preview
          </button>
        </div>
      </div>
    </form>

    <!-- Move buttons outside the form -->
    <div class="share-options">
      <h3>Share Options</h3>

      <ButtonStack spacing="medium">
        <BaseButton
          type="button"
          variant="outline"
          @click="copyToClipboard"
          :disabled="!svgData"
          fullWidth
        >
          <CopyIcon class="button-icon" />
          <span v-if="showCopySuccess">Copied to Clipboard!</span>
          <span v-else>Copy to Clipboard</span>
        </BaseButton>

        <BaseButton
          type="button"
          variant="outline"
          @click="shareToWhatsApp"
          :disabled="!svgData"
          fullWidth
          class="whatsapp-button"
        >
          <WhatsAppIcon class="button-icon whatsapp-icon" />
          <span>Share to WhatsApp</span>
        </BaseButton>

        <BaseButton
          type="button"
          @click="print"
          :disabled="!targetCaptain.trim()"
          fullWidth
          variant="outline"
          data-test="view-shoot-save2"
        >
          <span>Download PDF</span>
        </BaseButton>
      </ButtonStack>
    </div>

    <div class="button-group cancel-group">
      <BaseButton
        type="button"
        variant="text"
        @click="emit('close')"
        fullWidth
      >
        Cancel
      </BaseButton>
    </div>
  </BaseModal>
</template>
<style scoped>
h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.preview-container {
  margin: 1.5rem 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
}

.preview-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.svg-preview {
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
}

.svg-preview img {
  max-width: 100%;
  display: block;
}

.generating-message, .no-preview {
  text-align: center;
  padding: 2rem 0;
  font-style: italic;
  color: var(--color-text-light);
}

.generate-button {
  background-color: var(--color-primary, #4a5568);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
}

.share-options {
  margin-top: 1.5rem;
}

.share-options h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.cancel-group {
  margin-top: 1.5rem;
  text-align: center;
}

.button-icon {
  margin-right: 0.5rem;
}

/* Special styling for WhatsApp button */
.whatsapp-button {
  background-color: #25D366;
  color: white;
  border-color: #25D366;
}

.whatsapp-button:hover {
  background-color: #1ea952;
  border-color: #1ea952;
}

.whatsapp-icon {
  color: white;
  width: 20px;
  height: 20px;
}
</style>
