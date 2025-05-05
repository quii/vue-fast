// Mock localStorage for server tests
class MockStorage {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  setItem(key: string, value: string): void {
    this.store[key] = value
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }
}

// Set up global localStorage mock
global.localStorage = new MockStorage() as unknown as Storage

// Set up any other browser globals that might be needed
global.window = {} as any