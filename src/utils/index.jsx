import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  Search,
  Sliders,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { SearchCache, createCacheKey } from "../../../utils/searchOptimizations";
import { searchMosquesViaOverpass, getNavigationLink, geocodeQuery, getFastLocation } from "./utils";

const NearestMosqueMap = () => {
  const { t, language } = useLanguage();
  const isRtl = language === "ur";

  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [searchLocationLabel, setSearchLocationLabel] = useState("");
  const [mosques, setMosques] = useState([]);
  const [filteredMosques, setFilteredMosques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(5);
  const [radiusDisplay, setRadiusDisplay] = useState(5);

  const handleRadiusChange = (val) => {
    setRadiusDisplay(val);
    if (radiusDebounceRef.current) clearTimeout(radiusDebounceRef.current);
    radiusDebounceRef.current = setTimeout(() => {
      setRadius(val);
      radiusDebounceRef.current = null;
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (radiusDebounceRef.current) clearTimeout(radiusDebounceRef.current);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [sortBy, setSortBy] = useState("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [prefetchStatus, setPrefetchStatus] = useState({ active: false, done: 0, total: 0 });

  const cacheRef = useRef(new SearchCache(200));
  const cityCacheRef = useRef(new Map());
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const prefetchActiveRef = useRef(false);
  const radiusDebounceRef = useRef(null);

  const MAJOR_CITIES = [
    { name: 'Karachi', nameUr: 'کراچی', lat: 24.8607, lng: 67.0011 },
    { name: 'Lahore', nameUr: 'لاہور', lat: 31.5204, lng: 74.3587 },
    { name: 'Islamabad', nameUr: 'اسلام آباد', lat: 33.6844, lng: 73.0479 },
    { name: 'Rawalpindi', nameUr: 'راولپنڈی', lat: 33.5651, lng: 73.0169 },
    { name: 'Faisalabad', nameUr: 'فیصل آباد', lat: 31.4504, lng: 73.1350 },
    { name: 'Multan', nameUr: 'ملتان', lat: 30.1575, lng: 71.5249 },
    { name: 'Peshawar', nameUr: 'پشاور', lat: 34.0150, lng: 71.5249 },
    { name: 'Quetta', nameUr: 'کوئٹہ', lat: 30.1798, lng: 66.9750 },
    { name: 'Sialkot', nameUr: 'سیالکوٹ', lat: 32.4945, lng: 74.5229 },
    { name: 'Gujranwala', nameUr: 'گوجرانوالہ', lat: 32.1877, lng: 74.1945 },
    { name: 'Hyderabad', nameUr: 'حیدرآباد', lat: 25.3960, lng: 68.3578 },
    { name: 'Sargodha', nameUr: 'سرگودھا', lat: 32.0836, lng: 72.6711 },
  ];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

  const getUserLocation = useCallback(async () => {
    setLocationLoading(true);
    setError(null);

    try {
      const loc = await getFastLocation(new AbortController().signal);
      setUserLocation(loc);
      setSearchLocation(loc);
      setSearchLocationLabel("");
    } catch (err) {
      setError(`Could not get your location: ${err.message}. Try typing a city name above.`);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Debounced geocoding when user types a city/area
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      if (userLocation) {
        setSearchLocation(userLocation);
        setSearchLocationLabel("");
      } else {
        setSearchLocation(null);
        setSearchLocationLabel("");
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const trimmed = searchQuery.trim().toLowerCase();

      // If query matches a major city, use its known coords (skip Nominatim)
      const city = MAJOR_CITIES.find(c => c.name.toLowerCase() === trimmed);
      if (city) {
        setError(null);
        setSearchLocation({ lat: city.lat, lng: city.lng });
        setSearchLocationLabel(city.name);
        setGeocoding(true);
        // The useEffect watching searchLocation will fetch with correct radius.
        // Pre-populate cacheRef with prefetched data only if its radius covers the request.
        const prefetched = cityCacheRef.current.get(trimmed);
        if (prefetched) {
          const refLoc = userLocation || city;
          const cacheKey = createCacheKey(`${city.lat.toFixed(2)},${city.lng.toFixed(2)}`, { radius, query: "" });
          const withDistance = prefetched.map(m => ({
            ...m,
            distance: calculateDistance(refLoc.lat, refLoc.lng, m.lat, m.lng),
          }));
          cacheRef.current.set(cacheKey, withDistance);
        }
        setGeocoding(false);
        return;
      }

      setGeocoding(true);
      setError(null);
      try {
        const geoCoords = await geocodeQuery(searchQuery, new AbortController().signal);
        if (geoCoords) {
          setSearchLocation({ lat: geoCoords.lat, lng: geoCoords.lng });
          setSearchLocationLabel(geoCoords.displayName);
        } else {
          setError(`Could not find location: "${searchQuery}". Try a different name.`);
          setSearchLocation(null);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(`Geocoding failed: ${err.message}`);
        setSearchLocation(null);
      } finally {
        setGeocoding(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, userLocation]);

  // Pre-fetch mosques for major cities in the background
  useEffect(() => {
    if (prefetchActiveRef.current) return;
    prefetchActiveRef.current = true;

    let cancelled = false;
    const prefetchCities = async () => {
      const cities = [...MAJOR_CITIES];
      setPrefetchStatus({ active: true, done: 0, total: cities.length });
      let done = 0;

      // Process in parallel batches of 2
      for (let i = 0; i < cities.length; i += 2) {
        if (cancelled) break;
        const batch = cities.slice(i, i + 2);

        await Promise.allSettled(batch.map(async (city) => {
          const cacheKey = city.name.toLowerCase();
          if (cityCacheRef.current.has(cacheKey)) return;

          try {
            const results = await searchMosquesViaOverpass(
              { lat: city.lat, lng: city.lng },
              15,
              "",
              new AbortController().signal
            );
            if (cancelled) return;
            cityCacheRef.current.set(cacheKey, results);
          } catch {
            // silently skip failed cities
          }
        }));

        if (cancelled) break;
        done = Math.min(i + 2, cities.length);
        setPrefetchStatus({ active: true, done, total: cities.length });
        // Let rate limit recover between batches
        if (i + 2 < cities.length) {
          await new Promise(r => setTimeout(r, 600));
        }
      }

      if (!cancelled) {
        prefetchActiveRef.current = false;
        setPrefetchStatus({ active: false, done: cities.length, total: cities.length });
      }
    };
    prefetchCities();
    return () => { cancelled = true; };
  }, []);

  const searchMosques = useCallback(async (location, searchRadius, query = "") => {
    if (!location) {
      setError("Please provide a location or enable your device location.");
      return;
    }

    setLoading(true);
    setError(null);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const results = await searchMosquesViaOverpass(
        location,
        searchRadius,
        query,
        abortRef.current.signal
      );

      const refLoc = userLocation || location;
      const mosquesWithDistance = results.map((mosque) => ({
        ...mosque,
        distance: calculateDistance(
          refLoc.lat,
          refLoc.lng,
          mosque.lat,
          mosque.lng
        ),
      }));

      setMosques(mosquesWithDistance);
      setFilteredMosques(mosquesWithDistance);

      const cacheKey = createCacheKey(`${location.lat},${location.lng}`, {
        radius: searchRadius,
        query: query,
      });
      cacheRef.current.set(cacheKey, mosquesWithDistance);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Mosque search error:", err);
      setError(
        `Could not find mosques. The search service may be temporarily unavailable. Please try again in a moment.`
      );
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // Fetch mosques when search location or radius changes
  useEffect(() => {
    if (!searchLocation) return;

    const cacheKey = createCacheKey(`${searchLocation.lat.toFixed(2)},${searchLocation.lng.toFixed(2)}`, {
      radius,
      query: "",
    });

    const cachedResults = cacheRef.current.get(cacheKey);
    if (cachedResults) {
      const refLoc = userLocation || searchLocation;
      const refreshed = cachedResults.map(m => ({
        ...m,
        distance: calculateDistance(refLoc.lat, refLoc.lng, m.lat, m.lng),
      }));
      setMosques(refreshed);
      setFilteredMosques(refreshed);
      setLoading(false);
      return;
    }

    searchMosques(searchLocation, radius, "");
  }, [searchLocation, radius, searchMosques]);

  // When userLocation changes (GPS update), recalculate distances without re-fetching
  useEffect(() => {
    if (!userLocation || !searchLocation || mosques.length === 0) return;
    const refreshed = mosques.map(m => ({
      ...m,
      distance: calculateDistance(userLocation.lat, userLocation.lng, m.lat, m.lng),
    }));
    setMosques(refreshed);
  }, [userLocation]);

  useEffect(() => {
    let filtered = [...mosques];
    if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      filtered.sort((a, b) => a.distance - b.distance);
    }
    setFilteredMosques(filtered);
  }, [sortBy, mosques]);

  const getDirectionLink = (mosque) => {
    if (!searchLocation) return "#";
    const from = userLocation || searchLocation;
    return getNavigationLink(
      from.lat,
      from.lng,
      mosque.lat,
      mosque.lng,
      mosque.name
    );
  };

  const translations = {
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
    openNow: isRtl ? "اب کھلا ہے" : "Open Now",
    closed: isRtl ? "بند" : "Closed",
    reviews: isRtl ? "جائزے" : "Reviews",
    enableLocation: isRtl
      ? "براہ کرم اپنا مقام شامل کریں"
      : "Please enable your location",
    filters: isRtl ? "فلٹرز" : "Filters",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-gray-200 border-b transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {translations.title}
              </h1>
              <p className="text-sm text-gray-600">
                {translations.description}
              </p>
            </div>
          </div>

          {/* Search & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                locationLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30"
              }`}
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span>{locationLoading ? translations.searching : translations.getLocation}</span>
            </button>

            <div className="relative">
              <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
              <input
                type="text"
                placeholder={translations.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRtl ? "pr-10 text-right" : "pl-10"} py-2 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <Sliders className="w-4 h-4" />
              <span>{translations.filters}</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 rounded-lg border bg-gray-100 border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {translations.radius}: {radiusDisplay} {translations.km}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radiusDisplay}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {translations.sortBy}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="distance">{translations.distance}</option>
                    <option value="rating">{translations.rating}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {prefetchStatus.active && (
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${(prefetchStatus.done / prefetchStatus.total) * 100}%` }}
                />
              </div>
              <span className="whitespace-nowrap">Pre-fetching mosques… {prefetchStatus.done}/{prefetchStatus.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 bg-red-50 border-red-500 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {searchLocation && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-700">
              📍 {isRtl ? "تلاش کا مقام:" : "Search location:"}{" "}
              <span className="font-medium">
                {searchLocationLabel || `${searchLocation.lat.toFixed(4)}, ${searchLocation.lng.toFixed(4)}`}
              </span>
            </p>
          </div>
        )}

        {(loading || geocoding) && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-600">
              {geocoding ? (isRtl ? "مقام تلاش کیا جا رہا ہے..." : "Looking up location...") : translations.searching}
            </p>
          </div>
        )}

        {!loading && !geocoding && !searchLocation && !searchQuery.trim() && (
          <div className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              {translations.enableLocation}
            </h3>
            <p className="text-sm mb-4 text-gray-500">
              {isRtl ? "یا اوپر شہر کا نام لکھ کر تلاش کریں" : "Or type a city/area name above to search"}
            </p>
            <button
              onClick={getUserLocation}
              className="mt-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              {translations.getLocation}
            </button>
          </div>
        )}

        {!loading && !geocoding && searchLocation && filteredMosques.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              {translations.noMosques}
            </h3>
            <p className="text-sm mb-4 text-gray-600">
              {translations.tryLargerRadius}
            </p>
            <button
              onClick={() => setRadius(Math.min(radius + 5, 50))}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              {isRtl ? "رینج بڑھائیں" : "Increase Radius"}
            </button>
          </div>
        )}

        {!loading && !geocoding && filteredMosques.length > 0 && (
          <div>
            <p className="mb-6 text-sm font-medium text-gray-600">
              {filteredMosques.length}{" "}
              {isRtl ? "مسجدیں ملیں" : "mosques found"}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {filteredMosques.map((mosque) => (
                <div
                  key={mosque.id}
                  className="group rounded-xl border transition-all hover:shadow-lg hover:shadow-emerald-500/10 overflow-hidden bg-white border-gray-200 hover:border-emerald-500/50"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2 text-gray-900">
                              {mosque.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {mosque.address}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                              <p className="text-sm font-bold text-emerald-600">
                                {mosque.distance.toFixed(1)} km
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <a
                        href={getDirectionLink(mosque)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all group/btn"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>{translations.getDirections}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearestMosqueMap;
