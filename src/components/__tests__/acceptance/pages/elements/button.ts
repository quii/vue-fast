import { DOMWrapper } from '@vue/test-utils'

export class Button {
  constructor(
    private readonly element: DOMWrapper<Element>,
    public readonly text: string
  ) {}

  hasAttribute(name: string): boolean {
    return this.element.attributes(name) !== undefined
  }

  async click(): Promise<void> {
    await this.element.trigger('click')
  }
}