import { Button } from '../components/__tests__/acceptance/pages/elements/button'

declare module 'vitest' {
  interface Assertion {
    toBeEnabled(): void;
    toBeDisabled(): void;
  }

  interface AsymmetricMatchersContaining {
    toBeEnabled(): void;
    toBeDisabled(): void;
  }
}