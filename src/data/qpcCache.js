let cachePromise = null;
let cacheData = null;
let loaded = false;
const listeners = new Set();

export function preloadQpcData() {
  if (!cachePromise) {
    cachePromise = import("../../assets/Tajweed/qpc-v4.json/qpc-v4.json")
      .then(mod => {
        cacheData = mod.default || mod;
        loaded = true;
        listeners.forEach(cb => cb());
        listeners.clear();
        return cacheData;
      });
  }
  return cachePromise;
}

export function getQpcData() {
  if (cacheData) return Promise.resolve(cacheData);
  return preloadQpcData();
}

export function getCachedData() {
  return cacheData;
}

export function isLoaded() {
  return loaded;
}

export function onReady(cb) {
  if (loaded) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}
