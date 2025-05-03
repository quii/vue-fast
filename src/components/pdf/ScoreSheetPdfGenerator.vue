<script setup>
import { h, createApp } from 'vue'
import RoundScores from '@/components/RoundScores.vue'
import ArcherDetails from '@/components/ArcherDetails.vue'

const props = defineProps({
  archerName: String,
  shotAt: String,
  targetCaptain: String,
  shoot: Object,
  gameType: String,
  date: String,
  ageGroup: String,
  gender: String,
  bowType: String,
  status: String,
  handicap: [Number, String],
  classification: Object,
  endSize: Number
})

/**
 * Generates and opens a printable PDF
 */
function generatePdf() {
  // Log the captain name to verify it's being received
  console.log('Target Captain in PDF generator:', props.targetCaptain)

  const formatTitle = (str) => str ? str.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-') : ''
  const title = [
    formatTitle(props.archerName),
    props.shotAt ? formatTitle(props.shotAt) : ''
  ].filter(Boolean).join('-')

  const printWindow = window.open('', '_blank', '')
  const doc = printWindow.document
  doc.title = title

  const style = document.createElement('style')
  style.textContent = `
    body { font-family: Arial; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid black; padding: 8px; text-align: center; text-transform: capitalize; }
    .score { font-weight: bold; }
    .signatures { margin-top: 2em; }
    h1 { text-transform: capitalize; text-align: center; }
    h2 {text-align: center;}
    #classification { display: none; }
  `

  const container = document.createElement('div')
  const app = createApp({
    render() {
      return h('div', [
        h('h1', `${props.gameType} - ${props.date}`),
        props.shotAt && h('h2', `Shot at ${props.shotAt}`),
        h(ArcherDetails, {
          name: props.archerName,
          ageGroup: props.ageGroup,
          gender: props.gender,
          bowType: props.bowType,
          status: props.status,
          handicap: props.handicap,
          classification: props.classification
        }),
        h(RoundScores, {
          scores: props.shoot.scores,
          gameType: props.shoot.gameType,
          endSize: props.endSize,
          forceLandscape: true
        })
      ])
    }
  })

  app.component('ArcherDetails', ArcherDetails)
  app.mount(container)

  // Store the captain name in a local variable to ensure it's captured correctly
  const captainName = props.targetCaptain || 'Not specified'

  const signatures = document.createElement('div')
  signatures.className = 'signatures'
  signatures.innerHTML = `
  <div class="signature-block">
    <div class="signature-row">
      <span>Target Captain: ${captainName}</span>
      <div class="signature-line"></div>
    </div>
  </div>

  <div class="signature-block">
    <div class="signature-row">
      <span>Archer: ${props.archerName}</span>
      <div class="signature-line"></div>
    </div>
  </div>
`

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
`
  style.textContent += signatureStyles
  doc.head.appendChild(style)
  doc.body.appendChild(container)
  doc.body.appendChild(signatures)
  doc.body.appendChild(document.createElement('script')).textContent = 'window.onload = () => window.print()'

  return true
}

defineExpose({
  generatePdf
})
</script>

<template>
</template>