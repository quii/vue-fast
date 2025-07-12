import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useShootTimingStore } from '../shoot-timing';

describe('useShootTimingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
    
    // Mock Date.now() for consistent testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('records first arrow time', () => {
    const store = useShootTimingStore();
    const mockTime = 1000000;
    vi.setSystemTime(mockTime);

    expect(store.hasStarted()).toBe(false);
    
    store.recordFirstArrow();
    
    expect(store.hasStarted()).toBe(true);
    expect(store.startTime).toBe(mockTime);
  });

  test('only records start time once', () => {
    const store = useShootTimingStore();
    const firstTime = 1000000;
    const secondTime = 2000000;
    
    vi.setSystemTime(firstTime);
    store.recordFirstArrow();
    
    vi.setSystemTime(secondTime);
    store.recordFirstArrow(); // Should not update start time
    
    expect(store.startTime).toBe(firstTime);
  });

  test('records last arrow time', () => {
    const store = useShootTimingStore();
    const mockTime = 2000000;
    vi.setSystemTime(mockTime);

    store.recordLastArrow();
    
    expect(store.endTime).toBe(mockTime);
  });

  test('updates last arrow time on subsequent calls', () => {
    const store = useShootTimingStore();
    const firstTime = 1000000;
    const secondTime = 2000000;
    
    vi.setSystemTime(firstTime);
    store.recordLastArrow();
    
    vi.setSystemTime(secondTime);
    store.recordLastArrow();
    
    expect(store.endTime).toBe(secondTime);
  });

  test('calculates shoot duration correctly', () => {
    const store = useShootTimingStore();
    const startTime = 1000000;
    const endTime = 1060000; // 60 seconds later
    
    vi.setSystemTime(startTime);
    store.recordFirstArrow();
    
    vi.setSystemTime(endTime);
    store.recordLastArrow();
    
    expect(store.getShootDuration()).toBe(60000); // 60 seconds in ms
  });

  test('returns undefined for invalid duration', () => {
    const store = useShootTimingStore();
    
    // No start time
    expect(store.getShootDuration()).toBeUndefined();
    
    // Only start time
    vi.setSystemTime(1000000);
    store.recordFirstArrow();
    expect(store.getShootDuration()).toBeUndefined();
    
    // Clear and test negative duration scenario
    store.clearTiming();
    
    // End time before start time (shouldn't happen in practice)
    const startTime = 2000000;
    const endTime = 1000000;
    
    vi.setSystemTime(startTime);
    store.recordFirstArrow();
    vi.setSystemTime(endTime);
    store.recordLastArrow();
    
    expect(store.getShootDuration()).toBeUndefined();
  });

  test('clears timing data', () => {
    const store = useShootTimingStore();
    
    vi.setSystemTime(1000000);
    store.recordFirstArrow();
    store.recordLastArrow();
    
    expect(store.hasStarted()).toBe(true);
    expect(store.startTime).not.toBeNull();
    expect(store.endTime).not.toBeNull();
    
    store.clearTiming();
    
    expect(store.hasStarted()).toBe(false);
    expect(store.startTime).toBeNull();
    expect(store.endTime).toBeNull();
  });

  test('hasStarted returns correct state', () => {
    const store = useShootTimingStore();
    
    expect(store.hasStarted()).toBe(false);
    
    store.recordFirstArrow();
    expect(store.hasStarted()).toBe(true);
    
    store.clearTiming();
    expect(store.hasStarted()).toBe(false);
  });
});
