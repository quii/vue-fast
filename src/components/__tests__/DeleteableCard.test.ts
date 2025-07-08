import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DeleteableCard from '@/components/DeleteableCard.vue'
import BaseCard from '@/components/BaseCard.vue'

// Mock BaseCard component for easier testing
vi.mock('@/components/BaseCard.vue', () => ({
  default: {
    name: 'BaseCard',
    props: ['indicator'],
    template: '<div class="base-card"><slot></slot></div>'
  }
}))

describe('DeleteableCard', () => {
  let wrapper: any

  const createWrapper = (props = {}) => {
    return mount(DeleteableCard, {
      props,
      slots: {
        default: '<div>Test Content</div>'
      },
      global: {
        components: {
          BaseCard
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
  })

  describe('when rendering', () => {
    it('should display card content and delete button', () => {
      expect(wrapper.find('.deleteable-card-container').exists()).toBe(true)
      expect(wrapper.find('.deleteable-card').exists()).toBe(true)
      expect(wrapper.find('.delete-button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Content')
    })

    it('should pass indicator prop to BaseCard', () => {
      const indicator = { text: 'New', class: 'highlight' }
      wrapper = createWrapper({ indicator })
      
      expect(wrapper.findComponent(BaseCard).props('indicator')).toEqual(indicator)
    })

    it('should show "Delete" text on delete button', () => {
      const deleteButton = wrapper.find('.delete-button')
      expect(deleteButton.text()).toBe('Delete')
    })
  })

  describe('when clicked', () => {
    it('should emit click event when card is clicked normally', async () => {
      await wrapper.find('.deleteable-card').trigger('click')
      
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should emit delete event when delete button is clicked', async () => {
      await wrapper.find('.delete-button').trigger('click')
      
      expect(wrapper.emitted('delete')).toHaveLength(1)
    })

    it('should not emit click when in delete mode', async () => {
      wrapper.vm.isDeleting = true
      await wrapper.vm.$nextTick()
      
      await wrapper.find('.deleteable-card').trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('should reset swipe when clicking card while in delete mode', async () => {
      wrapper.vm.isDeleting = true
      await wrapper.vm.$nextTick()
      
      await wrapper.find('.deleteable-card').trigger('click')
      
      expect(wrapper.vm.isDeleting).toBe(false)
    })
  })

  describe('when swiping', () => {
    it('should initialize touch tracking on touchstart', async () => {
      await wrapper.find('.deleteable-card').trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      
      expect(wrapper.vm.startX).toBe(100)
      expect(wrapper.vm.startY).toBe(100)
      expect(wrapper.vm.currentX).toBe(0)
      expect(wrapper.vm.isSwipeDetected).toBe(false)
    })

    it('should detect horizontal leftward swipes', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 70, clientY: 105 }] })
      
      expect(wrapper.vm.isSwipeDetected).toBe(true)
      expect(wrapper.vm.currentX).toBe(-30)
    })

    it('should ignore rightward movement', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 130, clientY: 105 }] })
      
      expect(wrapper.vm.isSwipeDetected).toBe(false)
    })

    it('should preserve vertical scrolling', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 105, clientY: 130 }] })
      
      expect(wrapper.vm.isSwipeDetected).toBe(false)
    })

    it('should require minimum horizontal distance before detecting swipe', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 95, clientY: 100 }] })
      
      expect(wrapper.vm.isSwipeDetected).toBe(false)
    })

    it('should show delete button when swiped beyond threshold', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 70, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 10, clientY: 100 }] })
      await card.trigger('touchend')
      
      expect(wrapper.vm.isDeleting).toBe(true)
      expect(wrapper.find('.deleteable-card-container').classes()).toContain('is-swiping')
    })

    it('should reset if not swiped far enough', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 70, clientY: 100 }] })
      await card.trigger('touchend')
      
      expect(wrapper.vm.isDeleting).toBe(false)
      expect(wrapper.vm.currentX).toBe(0)
    })
  })

  describe('when calculating styles', () => {
    it('should apply delete transform when in delete mode', async () => {
      wrapper.vm.isDeleting = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.cardStyle.transform).toBe('translateX(-80px)')
    })

    it('should apply swipe transform during active swipe', async () => {
      wrapper.vm.isSwipeDetected = true
      wrapper.vm.currentX = -50
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.cardStyle.transform).toBe('translateX(-50px)')
    })

    it('should apply no transform when not swiping', () => {
      expect(wrapper.vm.cardStyle).toEqual({})
    })

    it('should add is-swiping class when deleting or actively swiping', async () => {
      wrapper.vm.isDeleting = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.deleteable-card-container').classes()).toContain('is-swiping')
      
      wrapper.vm.isDeleting = false
      wrapper.vm.isSwipeDetected = true
      wrapper.vm.currentX = -20
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.deleteable-card-container').classes()).toContain('is-swiping')
    })
  })

  describe('when resetting', () => {
    it('should reset all swipe state correctly', async () => {
      wrapper.vm.currentX = -50
      wrapper.vm.isDeleting = true
      
      wrapper.vm.resetSwipe()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.currentX).toBe(0)
      expect(wrapper.vm.isDeleting).toBe(false)
    })
  })

  describe('with complex touch interactions', () => {
    it('should handle diagonal swipe that becomes horizontal', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 95, clientY: 105 }] })
      expect(wrapper.vm.isSwipeDetected).toBe(false)
      
      await card.trigger('touchmove', { touches: [{ clientX: 80, clientY: 110 }] })
      expect(wrapper.vm.isSwipeDetected).toBe(true)
    })

    it('should continue tracking after swipe is detected', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 70, clientY: 100 }] })
      expect(wrapper.vm.isSwipeDetected).toBe(true)
      
      await card.trigger('touchmove', { touches: [{ clientX: 40, clientY: 100 }] })
      expect(wrapper.vm.currentX).toBe(-60)
    })

    it('should reset swipe detection on touchend', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 70, clientY: 100 }] })
      expect(wrapper.vm.isSwipeDetected).toBe(true)
      
      await card.trigger('touchend')
      expect(wrapper.vm.isSwipeDetected).toBe(false)
    })

    it('should handle multiple rapid touch events gracefully', async () => {
      const card = wrapper.find('.deleteable-card')
      
      await card.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 90, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 80, clientY: 100 }] })
      await card.trigger('touchmove', { touches: [{ clientX: 70, clientY: 100 }] })
      await card.trigger('touchend')
      
      expect(wrapper.vm.isSwipeDetected).toBe(false)
    })
  })

  describe('for accessibility', () => {
    it('should have proper element structure', () => {
      expect(wrapper.find('.delete-button').attributes('role')).toBeFalsy()
      expect(wrapper.find('.delete-button').element.tagName).toBe('DIV')
    })

    it('should trigger delete when button is clicked', async () => {
      const deleteButton = wrapper.find('.delete-button')
      await deleteButton.trigger('click')
      
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')).toHaveLength(1)
    })
  })
})
