import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import PrintModal from '@/components/modals/PrintModal.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonStack from '@/components/ui/ButtonStack.vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'

// Mock the utility functions
vi.mock('@/utils/scoreSheetGenerator.js', () => ({
  generateScoreSheetSvg: vi.fn().mockResolvedValue('data:image/svg+xml;base64,mockedSvgData'),
  svgToPng: vi.fn().mockResolvedValue('data:image/png;base64,mockedPngData')
}))

// Update your mock to handle the fetch operation
vi.mock('@/utils/shareUtils.js', () => ({
  shareToWhatsApp: vi.fn(),
  copyImageToClipboard: vi.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
  copyTextToClipboard: vi.fn(),
  isMobileDevice: vi.fn().mockReturnValue(false)
}))

describe('PrintModal.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        write: vi.fn().mockResolvedValue(undefined),
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      configurable: true,
      writable: true
    })

    // Mock window.open
    window.open = vi.fn();

    // Mock fetch for data URLs
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.startsWith('data:')) {
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob(['mocked image data'], { type: 'image/png' }))
        });
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const mountComponent = (props = {}) => {
    return mount(PrintModal, {
      props: {
        shoot: {
          id: 'test-id',
          date: '2023-08-15',
          gameType: 'Bray I',
          score: 96,
          scores: [[9, 8, 7], [8, 8, 8], [7, 7, 7], [9, 9, 9]],
          unit: 'yd',
          userProfile: {
            name: 'Test Archer',
            gender: 'male',
            ageGroup: 'senior',
            bowType: 'recurve',
            classification: 'B3'
          },
          shootStatus: 'Practice'
        },
        archerName: 'Test Archer',
        endSize: 3,
        ageGroup: 'senior',
        gender: 'male',
        bowType: 'recurve',
        gameType: 'Bray I',
        date: '2023-08-15',
        status: 'Practice',
        handicap: '45',
        classification: {
          name: 'B3',
          scheme: 'AGB'
        },
        ...props
      },
      global: {
        plugins: [createPinia(), Toast],
        components: {
          // Register real components instead of stubs for these
          BaseModal,
          BaseButton,
          ButtonStack
        },
        stubs: {
          // Still stub these components
          'WhatsAppIcon': true,
          'CopyIcon': true,
          'CaptainInputModal': true,
          'ScoreSheetPdfGenerator': true
        }
      }
    })
  }

  it('renders correctly with shoot data', async () => {
    wrapper = mountComponent()

    // Wait for component to initialize
    await vi.dynamicImportSettled()

    // Check that the location input is present
    expect(wrapper.find('#location').exists()).toBe(true)
  })

  it('generates preview when location is entered', async () => {
    wrapper = mountComponent()

    // Wait for component to initialize
    await vi.dynamicImportSettled()

    // Enter a location
    await wrapper.find('#location').setValue('Sherwood Forest')

    // Click the generate preview button since entering a location sets svgData to null
    await wrapper.find('.generate-button').trigger('click')

    // Wait for the preview to be generated
    await vi.dynamicImportSettled()

    // Check that the SVG preview is displayed
    const svgPreview = wrapper.find('.svg-preview img')
    console.log('RENDERED HTML:', wrapper.html())

    expect(svgPreview.exists()).toBe(true)
  })

  it('copies to clipboard with correct PNG data when Copy button is clicked', async () => {
    // Import the actual utility functions to spy on them
    const shareUtils = await import('@/utils/shareUtils.js');
    const copyImageSpy = vi.spyOn(shareUtils, 'copyImageToClipboard').mockResolvedValue(true);

    // Import the scoreSheetGenerator to spy on svgToPng
    const scoreSheetGenerator = await import('@/utils/scoreSheetGenerator.js');
    const svgToPngSpy = vi.spyOn(scoreSheetGenerator, 'svgToPng');

    wrapper = mountComponent();

    // Wait for component to initialize
    await vi.dynamicImportSettled();

    // Generate the preview
    await wrapper.find('#location').setValue('Test Location');
    await wrapper.find('.generate-button').trigger('click');
    await vi.dynamicImportSettled();

    // Find the copy button and click it
    const buttons = wrapper.findAll('button');
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].text().includes('Copy to Clipboard')) {
        await buttons[i].trigger('click');
        break;
      }
    }

    // Check that svgToPng was called
    expect(svgToPngSpy).toHaveBeenCalled();

    // Check that copyImageToClipboard was called with a Blob
    expect(copyImageSpy).toHaveBeenCalledWith(expect.any(Blob));
  })

  it('shares via Web Share API when available', async () => {
    // Mock isMobileDevice to return true
    const shareUtils = await import('@/utils/shareUtils.js')
    vi.spyOn(shareUtils, 'isMobileDevice').mockReturnValue(true)

    // Mock navigator.share
    Object.defineProperty(navigator, 'share', {
      value: vi.fn().mockResolvedValue(undefined),
      configurable: true,
      writable: true
    })

    wrapper = mountComponent()

    // Wait for component to initialize
    await vi.dynamicImportSettled()

    // Generate the preview instead of directly setting svgData
    await wrapper.find('#location').setValue('Test Location')
    await wrapper.find('.generate-button').trigger('click')
    await vi.dynamicImportSettled()

    // Find the share button by its class
    const shareButton = wrapper.find('.share-button')
    await shareButton.trigger('click')

    // Check that navigator.share was called
    expect(navigator.share).toHaveBeenCalled()
  })

  it('falls back to WhatsApp sharing when Web Share API is unavailable', async () => {
    // Remove navigator.share
    delete (navigator as any).share

    // Import the actual utility functions to spy on them
    const shareUtils = await import('@/utils/shareUtils.js')
    const shareToWhatsAppSpy = vi.spyOn(shareUtils, 'shareToWhatsApp')

    wrapper = mountComponent()

    // Wait for component to initialize
    await vi.dynamicImportSettled()

    // Generate the preview instead of directly setting svgData
    await wrapper.find('#location').setValue('Test Location')
    await wrapper.find('.generate-button').trigger('click')
    await vi.dynamicImportSettled()

    // Find the share button by its class
    const shareButton = wrapper.find('.share-button')
    await shareButton.trigger('click')

    // Check that shareToWhatsApp was called
    expect(shareToWhatsAppSpy).toHaveBeenCalled()
  })
})