/* global HTMLCanvasElement */
import { mount } from '@vue/test-utils'
import { describe, test, expect, vi } from 'vitest'
import ScoreDistributionChart from './ScoreDistributionChart.vue'

// Mock Chart.js to avoid actual chart rendering in tests
vi.mock('chart.js/auto', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
      resize: vi.fn()
    }))
  }
})

// Mock canvas context to prevent getContext errors
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    // Add other canvas 2D context methods as needed
  })
})

vi.mock('chartjs-plugin-datalabels', () => ({
  default: {}
}))

describe('ScoreDistributionChart', () => {
  const defaultProps = {
    scores: [9, 8, 7, 6, 5, 4, 3, 2, 1, 'M'],
    gameType: 'national'
  }

  function createWrapper(props = {}) {
    return mount(ScoreDistributionChart, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          // Stub canvas to avoid DOM issues and prevent chart creation
          canvas: '<div data-testid="chart-canvas"></div>'
        }
      }
    })
  }

  describe('score distribution calculation', () => {
    test('calculates distribution correctly for mixed scores', () => {
      const wrapper = createWrapper({
        scores: [9, 9, 7, 7, 7, 5, 'M'],
        gameType: 'national'
      })

      const distribution = wrapper.vm.scoreDistribution

      // Test that score counts are calculated correctly (National uses odd numbers only)
      const nineScore = distribution.find(item => item.score === '9')
      const sevenScore = distribution.find(item => item.score === '7')
      const fiveScore = distribution.find(item => item.score === '5')
      const missScore = distribution.find(item => item.score === 'M')

      expect(nineScore?.count).toBe(2)
      expect(sevenScore?.count).toBe(3)
      expect(fiveScore?.count).toBe(1)
      expect(missScore?.count).toBe(1)
    })

    test('filters out scores with zero count', () => {
      const wrapper = createWrapper({
        scores: [9, 9, 8],
        gameType: 'national'
      })

      const distribution = wrapper.vm.scoreDistribution
      
      // Should not include scores that weren't shot
      expect(distribution.every(item => item.count > 0)).toBe(true)
      expect(distribution.find(item => item.score === '5')).toBeUndefined()
    })

    test('handles Worcester rounds with special scoring', () => {
      const wrapper = createWrapper({
        scores: [5, 4, 3, 2, 1],
        gameType: 'worcester'
      })

      const distribution = wrapper.vm.scoreDistribution
      
      expect(distribution).toBeDefined()
      expect(distribution.length).toBeGreaterThan(0)
    })

    test('calculates percentages correctly', () => {
      const wrapper = createWrapper({
        scores: [9, 8, 8, 7, 7, 7, 7], // 7 total scores
        gameType: 'national'
      })

      const distribution = wrapper.vm.scoreDistribution
      const sevenScore = distribution.find(item => item.score === '7')
      
      expect(sevenScore.percentage).toBeCloseTo(57.14, 1) // 4/7 * 100
    })
  })

  describe('distance chart data', () => {
    test('returns single distance data for simple rounds', () => {
      const wrapper = createWrapper({
        scores: [9, 8, 7, 6, 5, 4],
        gameType: 'bray i'
      })

      const distanceData = wrapper.vm.distanceChartData
      
      expect(distanceData).toHaveLength(1)
      expect(distanceData[0].title).toBe('Score Distribution')
    })

    test('handles empty scores gracefully', () => {
      const wrapper = createWrapper({
        scores: [],
        gameType: 'national'
      })

      expect(wrapper.vm.hasData).toBe(false)
      expect(wrapper.vm.distanceChartData).toEqual([])
    })

    test('converts MISS to M for consistency', () => {
      const wrapper = createWrapper({
        scores: [9, 'MISS', 8],
        gameType: 'national'
      })

      const distribution = wrapper.vm.scoreDistribution
      const missScore = distribution.find(item => item.score === 'M')
      
      expect(missScore).toBeDefined()
      expect(missScore.count).toBe(1)
    })
  })

  describe('chart visibility logic', () => {
    test('shows no data message when no meaningful data exists', () => {
      const wrapper = createWrapper({
        scores: [],
        gameType: 'national'
      })

      expect(wrapper.find('.no-data-message').exists()).toBe(true)
      expect(wrapper.find('.score-distribution-container').classes()).toContain('no-data')
    })

    test('shows chart when meaningful data exists', () => {
      const wrapper = createWrapper({
        scores: [9, 8, 7],
        gameType: 'national'
      })

      expect(wrapper.find('.no-data-message').exists()).toBe(false)
      expect(wrapper.find('.chart-wrapper').exists()).toBe(true)
    })
  })

  describe('color mapping', () => {
    test('assigns colors for Worcester rounds', () => {
      const wrapper = createWrapper({
        scores: [5, 4],
        gameType: 'worcester'
      })

      const distribution = wrapper.vm.scoreDistribution
      const fiveScore = distribution.find(item => item.score === '5')
      const fourScore = distribution.find(item => item.score === '4')

      // Test that colors are assigned (specific colors may vary)
      expect(fiveScore.color).toBeDefined()
      expect(fiveScore.color.backgroundColor).toBeDefined()
      expect(fiveScore.color.borderColor).toBeDefined()
      
      expect(fourScore.color).toBeDefined()
      expect(fourScore.color.backgroundColor).toBeDefined()
      expect(fourScore.color.borderColor).toBeDefined()
    })

    test('assigns colors for regular rounds', () => {
      const wrapper = createWrapper({
        scores: [9, 'M'],
        gameType: 'national'
      })

      const distribution = wrapper.vm.scoreDistribution
      const nineScore = distribution.find(item => item.score === '9')
      const missScore = distribution.find(item => item.score === 'M')

      // Test that colors are assigned
      expect(nineScore.color).toBeDefined()
      expect(nineScore.color.backgroundColor).toBeDefined()
      expect(nineScore.color.borderColor).toBeDefined()
      
      expect(missScore.color).toBeDefined()
      expect(missScore.color.backgroundColor).toBeDefined()
      expect(missScore.color.borderColor).toBeDefined()
    })
  })

  describe('shared legend', () => {
    test('generates shared legend for multiple distance charts', async () => {
      // Mock a multi-distance scenario
      const wrapper = createWrapper({
        scores: new Array(72).fill(9), // Full National round
        gameType: 'national'
      })

      // Force the component to process multi-distance data
      wrapper.vm.distanceCharts = [
        { distribution: [{ score: '9', count: 5, color: { backgroundColor: '#e8e32a', borderColor: '#000' } }] },
        { distribution: [{ score: '8', count: 3, color: { backgroundColor: '#fc2e2a', borderColor: '#fff' } }] }
      ]

      await wrapper.vm.$nextTick()

      const legend = wrapper.vm.sharedLegend
      expect(legend).toHaveLength(2)
      expect(legend.find(item => item.score === '9')).toBeDefined()
      expect(legend.find(item => item.score === '8')).toBeDefined()
    })

    test('returns empty legend for single distance charts', () => {
      const wrapper = createWrapper({
        scores: [9, 8, 7],
        gameType: 'bray i'
      })

      expect(wrapper.vm.sharedLegend).toEqual([])
    })
  })
})