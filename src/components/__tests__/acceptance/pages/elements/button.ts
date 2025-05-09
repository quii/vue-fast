import { DOMWrapper } from '@vue/test-utils'

export class Button {
  constructor(
    private readonly element: DOMWrapper<Element>,
    public readonly text: string
  ) {}

  hasAttribute(name: string): boolean {
    return this.element.attributes(name) !== undefined
  }

  hasAttributeWithValue(name: string, value: string): boolean {
    const attribute = this.element.attributes(name)
    return attribute !== undefined && attribute.valueOf() === value
  }

  async click(): Promise<void> {
    await this.element.trigger('click')
  }
}