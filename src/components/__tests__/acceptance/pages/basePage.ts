import { VueWrapper } from '@vue/test-utils'
import { vi } from 'vitest'
import { Button } from './elements/button'

export class BasePage {
  constructor(protected wrapper: VueWrapper) {}

  async waitForUpdate(): Promise<void> {
    await vi.dynamicImportSettled()
  }

  // Helper method to find elements by text content
  async findByText(text: string, selector = '*') {
    // Find all elements matching the selector
    const elements = this.wrapper.findAll(selector)

    // Filter to find the one containing the text
    for (const element of elements) {
      if (element.text().includes(text)) {
        return element
      }
    }

    // Return an empty wrapper if not found
    return { exists: () => false } as any
  }

  // Get a Button object for a button with the given text
  async button(text: string): Promise<Button> {
    const buttonElement = await this.findByText(text, 'button')
    if (!buttonElement.exists()) {
      throw new Error(`Button with text "${text}" not found`)
    }
    return new Button(buttonElement, text)
  }

  // Helper method to click a button by its text
  async clickButton(text: string) {
    const button = await this.button(text)
    await button.click()
    await this.waitForUpdate()
  }

  // Debug method to get the current HTML
  html(): string {
    return this.wrapper.html()
  }

  // Get the current route path
  getCurrentPath(): string | null {
    if (this.wrapper.vm.$route) {
      return this.wrapper.vm.$route.path
    }
    return null
  }

  // Debug method to log the current HTML and route to the console
  debug(): void {
    const currentPath = this.getCurrentPath()
    console.log('=== DEBUG INFO ===')
    console.log(`Current path: ${currentPath || 'Unknown'}`)
    console.log('Current HTML:')
    console.log(this.html())
    console.log('=== END DEBUG INFO ===')
  }

  async navigateTo(path: string) {
    await this.wrapper.vm.$router.push(path)
    await this.waitForUpdate()

    // Wait a bit longer to ensure the page is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}