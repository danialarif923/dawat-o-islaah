/**
 * Search Optimization Utilities
 * Includes: debouncing, caching, request cancellation
 */

/**
 * Debounce function to prevent excessive API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Advanced debounce hook for React - returns value after delay
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = require("react").useState(value);

  require("react").useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Simple LRU Cache for search results
 * Limits memory usage by removing least recently used items
 */
export class SearchCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);

    // Remove least recently used if cache is full
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.cache.has(key);
  }
}

/**
 * Request manager with AbortController support
 * Cancels previous requests when new search is initiated
 */
export class RequestManager {
  constructor() {
    this.currentController = null;
  }

  /**
   * Cancel the current request
   */
  cancel() {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }
  }

  /**
   * Get a new AbortSignal for a request
   * Cancels previous request automatically
   */
  getSignal() {
    this.cancel();
    this.currentController = new AbortController();
    return this.currentController.signal;
  }

  /**
   * Check if current request was aborted
   */
  isAborted() {
    return this.currentController?.signal.aborted || false;
  }
}

/**
 * Create a cache key from search parameters
 */
export const createCacheKey = (query, filters = {}) => {
  const filterStr = Object.entries(filters)
    .sort()
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return `${query}${filterStr ? "|" + filterStr : ""}`;
};

/**
 * Batch multiple API calls with priority queue
 * Prevents overwhelming the server
 */
export class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }

  clear() {
    this.queue = [];
  }
}

/**
 * Retry logic for failed requests
 */
export const retryFetch = async (
  url,
  options = {},
  maxRetries = 2,
  delay = 1000,
) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default {
  debounce,
  useDebouncedValue,
  SearchCache,
  RequestManager,
  createCacheKey,
  RequestQueue,
  retryFetch,
};
