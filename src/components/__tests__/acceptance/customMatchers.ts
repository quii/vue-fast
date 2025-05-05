import { expect } from 'vitest'
import { Button } from './pages/elements/button'

interface CustomMatchers<R = unknown> {
  toBeEnabled(): R;
  toBeDisabled(): R;
}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

expect.extend({
  toBeEnabled(received: Button) {
    const isEnabled = !received.hasAttribute('disabled')
    return {
      pass: isEnabled,
      message: () =>
        isEnabled
          ? `Expected button '${received.text}' not to be enabled`
          : `Expected button '${received.text}' to be enabled`
    }
  },
  toBeDisabled(received: Button) {
    const isDisabled = received.hasAttribute('disabled')
    return {
      pass: isDisabled,
      message: () =>
        isDisabled
          ? `Expected button '${received.text}' not to be disabled`
          : `Expected button '${received.text}' to be disabled`
    }
  }
})