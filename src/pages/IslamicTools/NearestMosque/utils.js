export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export const geocodeQuery = async (query, signal) => {
  if (!query.trim()) return null;
  const url = `${NOMINATIM_ENDPOINT}?q=${encodeURIComponent(query.trim())}&format=json&limit=1`;
  const res = await fetch(url, {
    signal,
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
};

export const getNavigationLink = (userLat, userLng, destLat, destLng, name) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
};

export const formatDistance = (distance, options = {}) => {
  const { unit = "km", decimals = 1 } = options;
  if (unit === "miles") {
    const miles = distance * 0.621371;
    return `${miles.toFixed(decimals)} mi`;
  }
  return `${distance.toFixed(decimals)} km`;
};

export const getTranslations = (isRtl = false) => {
  return {
    title: isRtl ? "قریب ترین مسجدیں" : "Nearest Mosques",
    description: isRtl
      ? "اپنے قریب کی مسجدوں کو تلاش کریں اور راستہ حاصل کریں"
      : "Find mosques near you and get directions",
    getLocation: isRtl ? "میرا مقام حاصل کریں" : "Get My Location",
    searching: isRtl ? "تلاش جاری ہے..." : "Searching...",
    searchPlaceholder: isRtl ? "شہر یا علاقہ تلاش کریں..." : "Search by city or area...",
    radius: isRtl ? "تلاش کی رینج (کلومیٹر)" : "Search Radius (km)",
    sortBy: isRtl ? "ترتیب" : "Sort By",
    distance: isRtl ? "فاصلہ" : "Distance",
    rating: isRtl ? "درجہ بندی" : "Rating",
    noMosques: isRtl
      ? "اس رینج میں کوئی مسجد نہیں ملی"
      : "No mosques found in this radius",
    tryLargerRadius: isRtl
      ? "بڑی رینج میں تلاش کریں"
      : "Try increasing the search radius",
    km: isRtl ? "کلومیٹر" : "km",
    getDirections: isRtl ? "راستہ حاصل کریں" : "Get Directions",
    enableLocation: isRtl
      ? "براہ کرم اپنا مقام شامل کریں"
      : "Please enable your location",
    filters: isRtl ? "فلٹرز" : "Filters",
    hoursNotAvailable: isRtl ? "معلومات دستیاب نہیں" : "Hours not available",
    increaseRadius: isRtl ? "رینج بڑھائیں" : "Increase Radius",
    mosquesFound: isRtl ? "مسجدیں ملیں" : "mosques found",
    openNow: isRtl ? "اب کھلا ہے" : "Open Now",
    closed: isRtl ? "بند" : "Closed",
    reviews: isRtl ? "جائزے" : "Reviews",
  };
};

const LOCATION_CACHE_KEY = 'nearest_mosque_location';
const IP_API = 'https://ipinfo.io/json';

const getIpLocation = async (signal) => {
  const res = await fetch(IP_API, {
    signal,
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`IP geolocation failed: ${res.status}`);
  const data = await res.json();
  if (!data.loc) throw new Error('IP geolocation unsuccessful');
  const [lat, lng] = data.loc.split(',');
  return { lat: parseFloat(lat), lng: parseFloat(lng), source: 'ip' };
};

const getGpsLocation = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'gps', accuracy: pos.coords.accuracy }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout, maximumAge: 300000 }
    );
  });
};

export const getFastLocation = async (signal) => {
  const cached = localStorage.getItem(LOCATION_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 3600000) { // 1-hour cache
        return { lat: parsed.lat, lng: parsed.lng, source: 'cache' };
      }
    } catch {}
  }

  try {
    const gps = await getGpsLocation(5000);
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ ...gps, timestamp: Date.now() }));
    return gps;
  } catch {
    try {
      const ip = await getIpLocation(signal);
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ lat: ip.lat, lng: ip.lng, timestamp: Date.now() }));
      return ip;
    } catch (ipErr) {
      // Final attempt: retry GPS with longer timeout
      const gps = await getGpsLocation(10000);
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ ...gps, timestamp: Date.now() }));
      return gps;
    }
  }
};

export const clearCachedLocation = () => localStorage.removeItem(LOCATION_CACHE_KEY);

export const getUserGeolocation = (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: "NOT_SUPPORTED",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let errorCode = "UNKNOWN";
        let message = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCode = "PERMISSION_DENIED";
            message = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorCode = "POSITION_UNAVAILABLE";
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorCode = "TIMEOUT";
            message = "Location request timed out. Please try again.";
            break;
        }
        reject({ code: errorCode, message });
      },
      defaultOptions
    );
  });
};

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 800;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchWithTimeout = async (url, timeoutMs = 15000, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const combinedSignal = options.signal
    ? AbortSignal.any ? AbortSignal.any([options.signal, controller.signal]) : options.signal
    : controller.signal;
  try {
    const res = await fetch(url, { ...options, signal: combinedSignal });
    return res;
  } finally {
    clearTimeout(timer);
  }
};

const MOSQUE_CACHE_PREFIX = 'nm_';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const getCacheKey = (location, radiusKm) =>
  `${MOSQUE_CACHE_PREFIX}${location.lat.toFixed(3)},${location.lng.toFixed(3)}_${radiusKm}`;

const getLocalCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
};

const setLocalCache = (key, data, ttl = CACHE_TTL) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, expiry: Date.now() + ttl }));
  } catch { /* quota exceeded, ignore */ }
};

export const searchMosquesViaOverpass = async (location, radiusKm = 5, query = "", signal) => {
  const cacheKey = getCacheKey(location, radiusKm);
  const cached = getLocalCache(cacheKey);
  if (cached) {
    let results = cached;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(m => m.name.toLowerCase().includes(q));
    }
    return results;
  }

  const radiusMeters = radiusKm * 1000;
  const overpassQuery = `
    [out:json][timeout:60];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${location.lat},${location.lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${location.lat},${location.lng});
    );
    out center;
  `;

  let lastErr = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const url = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;

      const now = Date.now();
      const elapsed = now - lastRequestTime;
      if (elapsed < MIN_INTERVAL_MS) {
        await wait(MIN_INTERVAL_MS - elapsed);
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      }
      lastRequestTime = Date.now();

      const response = await fetchWithTimeout(url, 55000, { signal });

      if (response.status === 429) {
        console.warn(`Overpass 429 on ${endpoint} — waiting 3s`);
        await wait(3000);
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        continue;
      }

      if (!response.ok) {
        console.warn(`Overpass ${response.status} on ${endpoint} — trying next`);
        continue;
      }

      const data = await response.json();
      const elements = data.elements || [];

      const mosques = [];
      const qLower = query.toLowerCase();
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const lat = el.type === 'node' ? el.lat : el.center?.lat;
        const lng = el.type === 'node' ? el.lon : el.center?.lon;
        if (lat == null || lng == null) continue;
        const tags = el.tags || {};
        const name = tags.name || tags["name:en"] || `Mosque (OSM ${el.id})`;
        if (query && !name.toLowerCase().includes(qLower)) continue;
        mosques.push({
          id: `${el.type}-${el.id}`,
          name,
          address: [
            tags["addr:street"],
            tags["addr:city"],
            tags["addr:country"],
          ].filter(Boolean).join(", ") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat,
          lng,
          rating: null,
          reviews: 0,
          isOpen: null,
          osmType: el.type,
          osmId: el.id,
        });
      }

      setLocalCache(cacheKey, mosques);
      return mosques;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      lastErr = err;
      console.warn(`Overpass endpoint ${endpoint} failed:`, err.message);
    }
  }

  throw lastErr || new Error("All Overpass endpoints failed");
};

export const sortMosques = (mosques, sortBy = "distance") => {
  const sorted = [...mosques];
  switch (sortBy) {
    case "rating":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "distance":
    default:
      return sorted.sort((a, b) => a.distance - b.distance);
  }
};

export const filterMosquesByQuery = (mosques, query) => {
  if (!query.trim()) return mosques;
  const lowerQuery = query.toLowerCase();
  return mosques.filter(
    (mosque) =>
      mosque.name.toLowerCase().includes(lowerQuery) ||
      mosque.address.toLowerCase().includes(lowerQuery)
  );
};

export const formatRating = (rating) => {
  if (!rating) return "N/A";
  return `${rating.toFixed(1)} ★`;
};

export const getStatusColor = (isOpen) => {
  if (isOpen === true) {
    return {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      icon: "text-green-600 dark:text-green-500",
    };
  } else if (isOpen === false) {
    return {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: "text-red-600 dark:text-red-500",
    };
  }
  return {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    icon: "text-gray-500 dark:text-gray-500",
  };
};

export const debounce = (func, wait = 300) => {
  let timeoutId = null;
  return function debounced(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

export default {
  calculateHaversineDistance,
  getNavigationLink,
  formatDistance,
  getTranslations,
  getUserGeolocation,
  searchMosquesViaOverpass,
  sortMosques,
  filterMosquesByQuery,
  formatRating,
  getStatusColor,
  debounce,
};
