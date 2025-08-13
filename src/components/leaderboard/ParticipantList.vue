<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '../BaseCard.vue'
import BaseButton from '../ui/BaseButton.vue'
import GraphIcon from '@/components/icons/GraphIcon.vue'
import UnifiedGraphModal from '@/components/UnifiedGraphModal.vue'
import EndScores from '@/components/EndScores.vue'
import { useUserStore } from '@/stores/user'
import { useShootStore } from '@/stores/shoot'
import { formatRoundName } from '../../domain/scoring/round/formatting.js'
import { roundConfigManager } from '@/domain/scoring/game_types'
import RoundCard from '@/components/RoundCard.vue'

const props = defineProps({
  participants: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    required: false,
    default: ''
  },
  bestEnds: {
    type: Array,
    required: false,
    default: () => []
  }
})

const emit = defineEmits(['participant-clicked'])

const userStore = useUserStore()
const router = useRouter()
const shootStore = useShootStore()

function handleParticipantClick(participant) {
  // Navigate to the participant scorecard page
  const shootCode = shootStore.currentShoot?.code
  if (shootCode) {
    router.push(`/participant-scorecard/${shootCode}/${participant.id}`)
  } else {
    console.warn('No shoot code available for navigation')
  }
}

const sortedParticipants = computed(() => {
  if (!props.participants) return []

  const sorted = [...props.participants]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((participant, index) => ({
      ...participant,
      position: index + 1
    }))

  // Calculate score differences
  return sorted.map((participant, index) => {
    if (index === 0) {
      // First place has no difference
      return { ...participant, scoreDifference: null }
    } else {
      // Calculate difference from the participant above
      const prevScore = sorted[index - 1].totalScore
      const difference = prevScore - participant.totalScore
      return { ...participant, scoreDifference: difference }
    }
  })
})


// Helper function to get card classes for a participant
function getCardClasses(participant) {
  const classes = []

  if (participant.archerName === userStore.user.name) {
    classes.push('is-current-user')
  }

  if (participant.finished) {
    classes.push('is-finished')
  }

  if (participant.currentClassification) {
    classes.push(participant.currentClassification)
  }

  return classes.join(' ')
}

// Helper function to get position indicator data
function getPositionIndicator(participant) {
  return {
    text: participant.position.toString(),
    class: getPositionIndicatorClass(participant)
  }
}

function getPositionIndicatorClass(participant) {
  const classes = ['position-indicator']

  if (participant.finished) {
    classes.push('is-finished')
  }

  if (participant.currentClassification) {
    classes.push(participant.currentClassification)
  }

  return classes.join(' ')
}

// Add graph modal state
const showGraph = ref(false)

// Check if we have enough data for a meaningful graph
const hasGraphData = computed(() => {
  if (!props.participants || props.participants.length < 1) return false
  
  // Count participants with any score data
  const participantsWithData = props.participants.filter(p => 
    (p.scores && p.scores.length > 0) || p.totalScore > 0
  )
  
  return participantsWithData.length >= 1
})

function openGraph() {
  showGraph.value = true
}

function closeGraph() {
  showGraph.value = false
}

// Helper function to check if a participant has the best end for this round
function getParticipantBestEnd(participant) {
  if (!props.bestEnds || props.bestEnds.length === 0) {
    return null
  }
  
  const bestEnd = props.bestEnds.find(end => 
    end.roundName === props.title && end.archerName === participant.archerName
  )
  
  return bestEnd || null
}

// Helper function to get all best ends for a participant in this round
function getParticipantBestEnds(participant) {
  if (!props.bestEnds || props.bestEnds.length === 0) {
    return []
  }
  
  const bestEnds = props.bestEnds.filter(end => 
    end.roundName === props.title && end.archerName === participant.archerName
  )
  
  return bestEnds
}

// Helper function to get score button class for best end display
function getScoreClass(score) {
  // Use the same logic as EndScores component
  if (props.title && (props.title.toLowerCase().includes('worcester'))) {
    if (score === 5) {
      return 'worcester5'
    }
    return 'worcesterRest'
  }
  return `score${score}`
}

// Chart title that includes date and formatted round name
const chartTitle = computed(() => {
  // Get the date from the current shoot, default to today if not available
  const shootDate = shootStore.currentShoot?.createdAt || new Date();
  const dateStr = shootDate instanceof Date ? 
    shootDate.toLocaleDateString() : 
    new Date(shootDate).toLocaleDateString();
  
  // Get round name from the first participant (they should all be the same round in a group)
  const roundName = props.participants?.[0]?.roundName || props.title || 'Unknown Round';
  const formattedRound = formatRoundName(roundName);
  
  return `${dateStr} - ${formattedRound}`;
});

// Generate a distinct color for each participant using CSS variables
const generateColor = (index) => {
  // Get CSS variable values from root
  const root = document.documentElement;
  const colors = [
    getComputedStyle(root).getPropertyValue('--color-chart-1').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-2').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-3').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-4').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-5').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-6').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-7').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-8').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-9').trim(),
    getComputedStyle(root).getPropertyValue('--color-chart-10').trim(),
  ];
  return colors[index % colors.length] || '#6b7280'; // fallback to gray
};

// Prepare cumulative score data for each participant
const chartData = computed(() => {
  const datasets = [];
  
  // If no real participants with data, create demo data for testing
  if (!props.participants || props.participants.length === 0 || 
      !props.participants.some(p => (p.scores && p.scores.length > 0) || p.totalScore > 0)) {
    datasets.push({
      label: 'Demo Archer 1',
      data: [
        { x: 0, y: 0 },   // Start
        { x: 1, y: 42 },  // End 1
        { x: 2, y: 78 },  // End 2
        { x: 3, y: 125 }, // End 3
        { x: 4, y: 158 }, // End 4
        { x: 5, y: 201 }, // End 5
        { x: 6, y: 245 }  // End 6
      ],
      borderColor: generateColor(0),
      backgroundColor: generateColor(0) + '1A', // Add alpha for hex colors
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    });
    
    datasets.push({
      label: 'Demo Archer 2',
      data: [
        { x: 0, y: 0 },   // Start
        { x: 1, y: 38 },  // End 1
        { x: 2, y: 72 },  // End 2
        { x: 3, y: 108 }, // End 3
        { x: 4, y: 142 }, // End 4
        { x: 5, y: 178 }, // End 5
        { x: 6, y: 214 }  // End 6
      ],
      borderColor: generateColor(1),
      backgroundColor: generateColor(1) + '1A', // Add alpha for hex colors
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    });
    
    return { datasets };
  }
  
  props.participants.forEach((participant, index) => {
    const dataPoints = [];
    
    // Get the round configuration to determine end size
    const roundConfig = roundConfigManager.getRound(participant.roundName);
    const endSize = roundConfig?.endSize || 6; // Default to 6 arrows per end
    
    if (participant.scores && participant.scores.length > 0) {
      // Use individual arrow scores to build cumulative progression by end
      let cumulative = 0;
      let endNumber = 1;
      
      // Start with end 0 (before shooting)
      dataPoints.push({ x: 0, y: 0 });
      
      participant.scores.forEach((score, arrowIndex) => {
        // Convert string scores to numbers, skip invalid ones
        const numericScore = typeof score === 'number' ? score : 
                           (typeof score === 'string' && !isNaN(Number(score))) ? Number(score) : 0;
        
        if (numericScore >= 0) { // Allow 0 scores
          cumulative += numericScore;
        }
        
        // Check if we've completed an end
        if ((arrowIndex + 1) % endSize === 0) {
          dataPoints.push({
            x: endNumber,
            y: cumulative
          });
          endNumber++;
        }
      });
      
      // If there are remaining arrows in an incomplete end, add a point for the current progress
      if (participant.scores.length % endSize !== 0) {
        dataPoints.push({
          x: endNumber,
          y: cumulative
        });
      }
      
    } else if (participant.totalScore > 0) {
      // For participants without detailed scores, create a simple progression by estimated ends
      const totalArrows = participant.arrowsShot || Math.max(6, Math.ceil(participant.totalScore / 10));
      const estimatedEnds = Math.ceil(totalArrows / endSize);
      
      // Create progression points (start, incremental ends, current)
      dataPoints.push({ x: 0, y: 0 }); // Starting point
      
      for (let end = 1; end <= estimatedEnds; end++) {
        const progressRatio = end / estimatedEnds;
        const scoreAtEnd = Math.floor(participant.totalScore * progressRatio);
        dataPoints.push({
          x: end,
          y: scoreAtEnd
        });
      }
      
      // Ensure final point shows exact total score
      if (estimatedEnds > 0) {
        dataPoints[dataPoints.length - 1].y = participant.totalScore;
      }
    } else {
      // No score data available
      return;
    }

    const color = generateColor(index);
    
    datasets.push({
      label: participant.archerName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color + '1A', // Add alpha for hex colors
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    });
  });

  return { datasets };
});

// Determine if we're on a portrait screen
const isPortraitOrientation = () => {
  return window.innerHeight > window.innerWidth;
};

// Chart options optimized for cumulative score progression
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: isPortraitOrientation() ? 30 : 20,
        bottom: 10,
        left: isPortraitOrientation() ? 15 : 20
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
            size: isPortraitOrientation() ? 10 : 12
          }
        },
        ticks: {
          stepSize: 1,
          font: {
            size: isPortraitOrientation() ? 8 : 10
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cumulative Score',
          font: {
            size: isPortraitOrientation() ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: isPortraitOrientation() ? 9 : 11
          }
        }
      }
    },
    plugins: {
      legend: {
        position: isPortraitOrientation() ? 'top' : 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: isPortraitOrientation() ? 10 : 12
          },
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            const endNum = tooltipItems[0].parsed.x;
            return endNum === 0 ? 'Start' : `End ${endNum}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };
});
</script>

<template>
  <div class="participant-list-wrapper">
    <UnifiedGraphModal
      :visible="showGraph"
      :title="chartTitle"
      :chart-data="chartData"
      :chart-options="chartOptions"
      chart-type="line"
      :no-data-message="'No score progression data available to display.'"
      :no-data-hint="'Score data will appear as participants shoot arrows.'"
      @close="closeGraph"
    />

    <div class="participant-list">
    <div class="participant-list-header">
      <RoundCard :round="{round: title}" :compact="true" />
      <BaseButton
        v-if="hasGraphData"
        @click="openGraph"
        variant="outline"
        class="graph-button"
        title="View cumulative score progression chart"
      >
        <GraphIcon />
        Graph
      </BaseButton>
    </div>
    
    <div v-if="sortedParticipants.length === 0" class="empty-state">
      <p>No participants in this group.</p>
    </div>

    <div v-else class="leaderboard-list">
      <BaseCard
        v-for="participant in sortedParticipants"
        :key="participant.id"
        :indicator="getPositionIndicator(participant)"
        :class="getCardClasses(participant)"
        class="participant-card"
        data-cy="participant-entry"
        @click="() => handleParticipantClick(participant)"
        style="cursor: pointer;"
      >
        <div class="card-main">
          <div class="card-info">
            <h3 class="archer-name">
              {{ participant.archerName }}
              <span v-if="participant.archerName === userStore.user.name" class="you-indicator">(You)</span>
              <span v-if="participant.finished" class="finished-indicator">✓ Finished</span>
            </h3>
            <div class="card-details">
              <span class="round-name">{{ formatRoundName(participant.roundName) }}</span>
              <span v-if="participant.currentClassification && !participant.finished" class="classification-badge">On track for: {{ participant.currentClassification }}</span>
              <span v-if="participant.currentClassification && participant.finished" class="classification-badge">Achieved: {{ participant.currentClassification }}</span>
              <span class="arrows-shot">{{ participant.arrowsShot }} arrow{{ participant.arrowsShot !== 1 ? 's' : '' }}</span>
            </div>
          </div>
          <div class="score-container">
            <div class="card-score">
              {{ participant.totalScore }}
            </div>
            <div v-if="participant.scoreDifference !== null" class="score-difference">
              -{{ participant.scoreDifference }}
            </div>
          </div>
        </div>
        
        <!-- Best End Display - Multiple distances support -->
        <div v-for="bestEnd in getParticipantBestEnds(participant)" :key="`${bestEnd.distance || 'single'}-${bestEnd.totalScore}`" class="best-end-row">
          <div class="best-end-label">
            <template v-if="bestEnd.distance && bestEnd.distanceUnit">
              Best at {{ bestEnd.distance }}{{ bestEnd.distanceUnit }}:
            </template>
            <template v-else>
              Round's best:
            </template>
          </div>
          <div class="best-end-scores">
            <div class="best-end-display">
              <span 
                v-for="(score, index) in bestEnd.endScores" 
                :key="index"
                :class="getScoreClass(score)"
                class="best-end-score"
              >
                {{ score }}
              </span>
              <span class="best-end-total">
                {{ bestEnd.totalScore }}
              </span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>


  </div>
</div>
</template>

<style scoped>
.score-difference {
  font-size: 0.75em;
  margin-top: 0.2em;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.15); /* Semi-transparent background */
  border-radius: 4px;
  padding: 0.1em 0.4em;
  display: inline-block;
  font-weight: 500;
}

/* For dark backgrounds (B1, B2, B3, MB, GMB, EMB) */
.participant-card.B1 .score-difference,
.participant-card.B2 .score-difference,
.participant-card.B3 .score-difference,
.participant-card.MB .score-difference,
.participant-card.GMB .score-difference,
.participant-card.EMB .score-difference {
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(0, 0, 0, 0.25);
}

/* For light backgrounds (A1, A2, A3) */
.participant-card.A1 .score-difference,
.participant-card.A2 .score-difference,
.participant-card.A3 .score-difference {
  color: var(--color-classification-text-light);
  background-color: rgba(6, 19, 69, 0.15);
}

/* For default background */
.participant-card:not(.B1):not(.B2):not(.B3):not(.MB):not(.GMB):not(.EMB):not(.A1):not(.A2):not(.A3) .score-difference {
  color: var(--color-text-light, #666);
  background-color: rgba(0, 0, 0, 0.08);
}

.participant-list {
  display: flex;
  flex-direction: column;
}

.participant-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.graph-button {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-mute, #666);
  font-style: italic;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Participant card styling */
.participant-card {
  margin-bottom: 0; /* Override BaseCard's default margin */
}

.participant-card.is-current-user {
  border: 2px solid var(--color-border);
}

.participant-card.is-finished {
  background-color: var(--color-background-mute, #f8f9fa);
}

.participant-card.is-finished.is-current-user {
  border: 2px solid var(--color-success, #28a745);
}

/* Classification colors */
.participant-card.B1 {
  background-color: var(--color-classification-b1);
  color: var(--color-classification-text-dark);
}

.participant-card.B2 {
  background-color: var(--color-classification-b2);
  color: var(--color-classification-text-dark);
}

.participant-card.B3 {
  background-color: var(--color-classification-b3);
  color: var(--color-classification-text-dark);
}

.participant-card.A3 {
  background-color: var(--color-classification-a3);
  color: var(--color-classification-text-light);
}

.participant-card.A2 {
  background-color: var(--color-classification-a2);
  color: var(--color-classification-text-light);
}

.participant-card.A1 {
  background-color: var(--color-classification-a1);
  color: var(--color-classification-text-light);
}

.participant-card.MB,
.participant-card.GMB,
.participant-card.EMB {
  background-color: var(--color-classification-mb);
  color: var(--color-classification-text-dark);
}

/* Position indicator styling */
:deep(.position-indicator) {
  background-color: var(--color-text-light, #666);
  color: white;
  font-weight: bold;
  font-size: 1.2em;
}

:deep(.position-indicator.is-finished) {
  background-color: var(--color-success, #28a745);
}

/* Override position indicator colors for classifications */
:deep(.position-indicator.B1),
:deep(.position-indicator.B2),
:deep(.position-indicator.B3),
:deep(.position-indicator.MB),
:deep(.position-indicator.GMB),
:deep(.position-indicator.EMB) {
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--color-classification-text-dark);
}

:deep(.position-indicator.A3),
:deep(.position-indicator.A2),
:deep(.position-indicator.A1) {
  background-color: rgba(6, 19, 69, 0.2);
  color: var(--color-classification-text-light);
}

/* Card content styling */
.card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.archer-name {
  margin: 0;
  font-size: 1.3em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
}

.you-indicator {
  font-weight: 400;
  color: var(--color-text-light, #666);
  font-size: 0.8em;
}

.finished-indicator {
  font-weight: 500;
  color: var(--color-success, #28a745);
  font-size: 0.75em;
  background-color: var(--color-success-light, #d4edda);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  white-space: nowrap;
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 0.2em;
  gap: 1em;
}

.round-name {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
}

.classification-badge {
  font-size: 0.75em;
  font-weight: 600;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.arrows-shot {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  font-weight: 500;
  margin-left: auto;
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-score {
  font-size: 1.3em;
  font-weight: 700;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  color: var(--color-text-light);
}

.participant-card.is-finished .card-score {
  color: var(--color-success, #28a745);
}

/* Override text colors for classification cards to ensure readability */
.participant-card.B1 .you-indicator,
.participant-card.B2 .you-indicator,
.participant-card.B3 .you-indicator,
.participant-card.MB .you-indicator,
.participant-card.GMB .you-indicator,
.participant-card.EMB .you-indicator {
  color: rgba(255, 255, 255, 0.7);
}

.participant-card.B1 .round-name,
.participant-card.B2 .round-name,
.participant-card.B3 .round-name,
.participant-card.MB .round-name,
.participant-card.GMB .round-name,
.participant-card.EMB .round-name,
.participant-card.B1 .arrows-shot,
.participant-card.B2 .arrows-shot,
.participant-card.B3 .arrows-shot,
.participant-card.MB .arrows-shot,
.participant-card.GMB .arrows-shot,
.participant-card.EMB .arrows-shot {
  color: rgba(255, 255, 255, 0.8);
}

/* For blue classification backgrounds (A1, A2, A3) - improve contrast */
.participant-card.A1 .you-indicator,
.participant-card.A2 .you-indicator,
.participant-card.A3 .you-indicator {
  color: var(--color-classification-text-light);
}

.participant-card.A1 .round-name,
.participant-card.A2 .round-name,
.participant-card.A3 .round-name,
.participant-card.A1 .arrows-shot,
.participant-card.A2 .arrows-shot,
.participant-card.A3 .arrows-shot {
  color: var(--color-classification-text-light);
}

/* Best End Display Styles - Integrated into participant card */
.best-end-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.1);
}

.best-end-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  flex-shrink: 0;
  min-width: 65px;
}

.best-end-scores {
  flex: 1;
  overflow: hidden;
}

.best-end-display {
  display: flex;
  gap: 1px;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.best-end-score {
  padding: 0.25rem 0.4rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  min-width: 24px;
  border-radius: 2px;
  flex-shrink: 0;
}

.best-end-total {
  padding: 0.25rem 0.5rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.8rem;
  background-color: var(--color-success, #28a745);
  color: white;
  border: 1px solid var(--color-success, #28a745);
  min-width: 30px;
  border-radius: 2px;
  margin-left: 2px;
  flex-shrink: 0;
}

/* Ensure best end display works on dark classification backgrounds */
.participant-card.B1 .best-end-row,
.participant-card.B2 .best-end-row,
.participant-card.B3 .best-end-row,
.participant-card.MB .best-end-row,
.participant-card.GMB .best-end-row,
.participant-card.EMB .best-end-row {
  border-top-color: rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.2);
}

.participant-card.B1 .best-end-label,
.participant-card.B2 .best-end-label,
.participant-card.B3 .best-end-label,
.participant-card.MB .best-end-label,
.participant-card.GMB .best-end-label,
.participant-card.EMB .best-end-label {
  color: rgba(255, 255, 255, 0.9);
}

.participant-card.B1 .best-end-score,
.participant-card.B2 .best-end-score,
.participant-card.B3 .best-end-score,
.participant-card.MB .best-end-score,
.participant-card.GMB .best-end-score,
.participant-card.EMB .best-end-score {
  border-color: rgba(255, 255, 255, 0.5);
}

/* Ensure best end display works on light classification backgrounds */
.participant-card.A1 .best-end-row,
.participant-card.A2 .best-end-row,
.participant-card.A3 .best-end-row {
  border-top-color: rgba(6, 19, 69, 0.2);
  background-color: rgba(255, 255, 255, 0.2);
}

.participant-card.A1 .best-end-label,
.participant-card.A2 .best-end-label,
.participant-card.A3 .best-end-label {
  color: var(--color-classification-text-light);
}

.participant-card.A1 .best-end-score,
.participant-card.A2 .best-end-score,
.participant-card.A3 .best-end-score {
  border-color: rgba(6, 19, 69, 0.3);
}


</style>