import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PrintModal from '@/components/modals/PrintModal.vue'
import { FakeSharingService } from '@/domain/adapters/in-memory/fake_sharing_service'

describe('PrintModal.vue', () => {
  let fakeSharingService: FakeSharingService

  beforeEach(() => {
    fakeSharingService = new FakeSharingService()
  })

  const mountComponent = (props = {}) => {
    return mount(PrintModal, {
      props: {
        shoot: {
          id: 'test-id',
          date: '2023-08-15',
          gameType: 'Bray I',
          score: 96,
          scores: [[9, 8, 7], [8, 8, 8]],
          // ... other properties
        },
        archerName: 'Test Archer',
        // ... other props
      },
      global: {
        provide: {
          sharingService: fakeSharingService
        }
      }
    })
  }

  it('generates preview when location is entered', async () => {
    const wrapper = mountComponent()

    // Wait for initial automatic preview generation
    await wrapper.vm.$nextTick()

    // Clear the fake service calls to start fresh
    fakeSharingService.generateCalls = []

    // Enter a new location (which clears the preview)
    await wrapper.find('#location').setValue('Sherwood Forest')

    // Now trigger the generate button
    await wrapper.find('.generate-button').trigger('click')

    // Check that generateScoresheet was called with the new location
    expect(fakeSharingService.generateCalls.length).toBe(1)
    expect(fakeSharingService.generateCalls[0].options.location).toBe('Sherwood Forest')

    // Update the selector to match the component's template
    const preview = wrapper.find('.svg-preview img')
    expect(preview.attributes('src')).toBe(fakeSharingService.scoresheetResult)
  })

  it('automatically generates preview on mount without requiring location input', async () => {
    const wrapper = mountComponent()

    // Wait for any async operations to complete
    await wrapper.vm.$nextTick()

    // Wait a bit longer to ensure all promises are resolved
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check that generateScoresheet was called automatically
    expect(fakeSharingService.generateCalls.length).toBe(1)

    // Force the component to update
    await wrapper.vm.$forceUpdate()
    await wrapper.vm.$nextTick()

    // Check that the preview image is visible
    const preview = wrapper.find('.svg-preview img')
    expect(preview.exists()).toBe(true)
    expect(preview.attributes('src')).toBe(fakeSharingService.scoresheetResult)
  })

  it('copies scoresheet to clipboard', async () => {
    const wrapper = mountComponent()

    // Wait for initial automatic preview generation
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Clear the fake service calls to start fresh
    fakeSharingService.copyCalls = []

    // Find the copy button and click it
    const copyButton = wrapper.findAll('button').find(b => b.text().includes('Copy'))
    await copyButton.trigger('click')

    // Check that copyScoresheet was called
    expect(fakeSharingService.copyCalls.length).toBe(1)
    expect(fakeSharingService.copyCalls[0]).toBe(fakeSharingService.scoresheetResult)
  })

  it('shares scoresheet when share button is clicked', async () => {
    const wrapper = mountComponent()

    // Wait for initial automatic preview generation
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Clear the fake service calls to start fresh
    fakeSharingService.shareCalls = []

    // Find the share button and click it
    const shareButton = wrapper.find('.share-button')
    await shareButton.trigger('click')

    // Check that shareScoresheet was called
    expect(fakeSharingService.shareCalls.length).toBe(1)
    expect(fakeSharingService.shareCalls[0].dataUrl).toBe(fakeSharingService.scoresheetResult)
    expect(fakeSharingService.shareCalls[0].text).toContain('Test Archer scored 96')
  })
})
