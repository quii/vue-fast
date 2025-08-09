/* global HTMLCanvasElement */
import { mount } from '@vue/test-utils'
import { describe, test, expect, vi } from 'vitest'
import EndTotalChart from './EndTotalChart.vue'

// Mock Chart.js to avoid actual chart rendering but capture configuration
vi.mock('chart.js/auto', () => ({
  default: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    resize: vi.fn()
  }))
}))

// Mock canvas context to prevent getContext errors
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    // Add other canvas 2D context methods as needed
  })
})

vi.mock('chartjs-plugin-annotation', () => ({
  default: {}
}))

describe('EndTotalChart Configuration Tests', () => {
  const defaultProps = {
    scores: [9, 8, 7, 6, 5, 4, 8, 7, 6, 5, 4, 3], // 2 complete ends: 39, 33
    gameType: 'national'
  }

  function createWrapper(props = {}) {
    return mount(EndTotalChart, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          // Stub canvas to avoid DOM issues
          canvas: '<div></div>'
        }
      }
    })
  }

  describe('chart options generation', () => {
    test('generates valid chart options for basic chart', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.chartOptions

      expect(options).toEqual(expect.objectContaining({
        responsive: true,
        maintainAspectRatio: false,
        interaction: expect.any(Object),
        plugins: expect.any(Object),
        scales: expect.any(Object)
      }))
    })

    test('includes proper scale configuration', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.chartOptions

      expect(options.scales).toEqual(expect.objectContaining({
        x: expect.objectContaining({
          grid: expect.any(Object),
          ticks: expect.any(Object)
        }),
        y: expect.objectContaining({
          min: expect.any(Number),
          max: expect.any(Number),
          grid: expect.any(Object),
          ticks: expect.any(Object),
          title: expect.any(Object)
        })
      }))
    })

    test('calculates appropriate y-axis range', () => {
      const wrapper = createWrapper({
        scores: [9, 9, 9, 9, 9, 9, 1, 1, 1, 1, 1, 1] // High end (54) and low end (6)
      })
      const options = wrapper.vm.chartOptions

      expect(options.scales.y.min).toBeGreaterThanOrEqual(0)
      expect(options.scales.y.max).toBeGreaterThan(options.scales.y.min)
      expect(options.scales.y.max).toBeGreaterThan(54) // Should add padding
    })

    test('handles tooltip configuration properly', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.chartOptions

      expect(options.plugins.tooltip).toEqual(expect.objectContaining({
        backgroundColor: expect.any(String),
        titleColor: expect.any(String),
        bodyColor: expect.any(String),
        borderColor: expect.any(String),
        borderWidth: expect.any(Number),
        callbacks: expect.objectContaining({
          title: expect.any(Function),
          label: expect.any(Function)
        })
      }))
    })
  })

  describe('chart data generation', () => {
    test('generates correct labels and data arrays', () => {
      const wrapper = createWrapper()
      const chartData = wrapper.vm.chartData

      expect(chartData.labels).toEqual(['End 1', 'End 2'])
      expect(chartData.datasets).toHaveLength(1)
      expect(chartData.datasets[0].data).toEqual([39, 33])
    })

    test('includes proper dataset configuration', () => {
      const wrapper = createWrapper()
      const chartData = wrapper.vm.chartData

      const dataset = chartData.datasets[0]
      expect(dataset).toEqual(expect.objectContaining({
        label: 'End Total',
        data: expect.any(Array),
        backgroundColor: expect.any(String),
        borderColor: expect.any(String),
        borderWidth: expect.any(Number),
        fill: true,
        tension: expect.any(Number),
        pointBackgroundColor: expect.any(String),
        pointBorderColor: expect.any(String),
        pointBorderWidth: expect.any(Number),
        pointRadius: expect.any(Number),
        pointHoverRadius: expect.any(Number)
      }))
    })
  })

  describe('configuration validation', () => {
    test('chart options pass basic Chart.js validation', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.chartOptions
      
      // Test that essential Chart.js properties are present and have correct types
      expect(typeof options.responsive).toBe('boolean')
      expect(typeof options.maintainAspectRatio).toBe('boolean')
      expect(typeof options.interaction).toBe('object')
      expect(typeof options.plugins).toBe('object')
      expect(typeof options.scales).toBe('object')
      
      // Validate scales structure
      expect(options.scales.x).toBeDefined()
      expect(options.scales.y).toBeDefined()
      expect(typeof options.scales.y.min).toBe('number')
      expect(typeof options.scales.y.max).toBe('number')
    })

    test('plugin configuration is valid', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.chartOptions
      
      // Should have legend and tooltip configurations
      expect(options.plugins.legend).toBeDefined()
      expect(options.plugins.tooltip).toBeDefined()
      
      // Legend should be properly configured
      expect(typeof options.plugins.legend.display).toBe('boolean')
      
      // Tooltip should have callbacks
      expect(typeof options.plugins.tooltip.callbacks).toBe('object')
      expect(typeof options.plugins.tooltip.callbacks.title).toBe('function')
      expect(typeof options.plugins.tooltip.callbacks.label).toBe('function')
    })

    test('no undefined or null values in critical paths', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.chartOptions
      
      // Check for undefined/null in critical configuration paths
      expect(options.scales.y.min).not.toBeNull()
      expect(options.scales.y.min).not.toBeNaN()
      expect(options.scales.y.max).not.toBeNull()
      expect(options.scales.y.max).not.toBeNaN()
      
      // Check plugins object doesn't have undefined values
      Object.keys(options.plugins).forEach(pluginKey => {
        expect(options.plugins[pluginKey]).toBeDefined()
      })
    })
  })

  describe('annotation plugin integration', () => {
    test('annotation configuration structure is valid when enabled', async () => {
      // Import the validation helper
      const { validateAnnotationConfig } = await import('./__tests__/chart-validation.test.js')
      
      // Create a test annotation configuration similar to what EndTotalChart would generate
      const testAnnotations = {
        firstDistance: {
          type: 'line',
          xMin: 0,
          xMax: 0,
          yMin: 0,
          yMax: 100,
          borderColor: 'rgba(75, 192, 192, 0.6)',
          borderWidth: 2,
          borderDash: [3, 3],
          label: {
            display: true,
            content: '60yd',
            position: 'start',
            backgroundColor: 'rgba(75, 192, 192, 0.9)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            borderRadius: 4,
            color: 'white',
            font: {
              size: 11,
              weight: 'bold'
            },
            padding: {
              x: 6,
              y: 4
            },
            yAdjust: -10
          }
        },
        distanceChange1: {
          type: 'line',
          xMin: 8,
          xMax: 8,
          yMin: 0,
          yMax: 100,
          borderColor: 'rgba(255, 99, 132, 0.8)',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            display: true,
            content: '50yd',
            position: 'start',
            backgroundColor: 'rgba(255, 99, 132, 0.9)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            borderRadius: 4,
            color: 'white',
            font: {
              size: 11,
              weight: 'bold'
            },
            padding: {
              x: 6,
              y: 4
            },
            yAdjust: -10
          }
        }
      }
      
      // This should not throw if the configuration is valid
      expect(() => validateAnnotationConfig(testAnnotations)).not.toThrow()
    })

    test('handles distance information correctly', () => {
      const wrapper = createWrapper()
      const endTotals = wrapper.vm.endTotals

      // Each end should have distance information
      endTotals.forEach(end => {
        expect(end).toEqual(expect.objectContaining({
          endNumber: expect.any(Number),
          total: expect.any(Number),
          isComplete: expect.any(Boolean),
          distance: expect.anything(), // Could be null or a number
          distanceUnit: expect.any(String),
          isDistanceChange: expect.any(Boolean)
        }))
      })
    })
  })

  describe('error resilience', () => {
    test('handles empty scores gracefully', () => {
      const wrapper = createWrapper({ scores: [] })
      
      expect(wrapper.vm.hasData).toBe(false)
      expect(wrapper.vm.endTotals).toEqual([])
      expect(() => wrapper.vm.chartOptions).not.toThrow()
    })

    test('handles single incomplete end', () => {
      const wrapper = createWrapper({ scores: [9, 8, 7] })
      
      expect(wrapper.vm.hasData).toBe(false) // Need at least 2 complete ends
      expect(wrapper.vm.endTotals.length).toBe(1)
      expect(wrapper.vm.endTotals[0].isComplete).toBe(false)
    })

    test('chart configuration is stable across updates', () => {
      const wrapper = createWrapper()
      
      const options1 = wrapper.vm.chartOptions
      const options2 = wrapper.vm.chartOptions
      
      // Configuration should be consistent
      expect(options1.scales.y.min).toBe(options2.scales.y.min)
      expect(options1.scales.y.max).toBe(options2.scales.y.max)
    })
  })
})