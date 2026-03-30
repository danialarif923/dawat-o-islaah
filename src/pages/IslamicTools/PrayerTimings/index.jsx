import { useState, useEffect } from "react";
import { FaLocationDot, FaLocationCrosshairs } from "react-icons/fa6";
import { useLanguage } from "../../../context/LanguageContext";

const PrayerTimings = () => {
  const { t } = useLanguage();

  // Try to load saved location from localStorage
  const savedLocation = JSON.parse(localStorage.getItem("prayerTimesLocation"));

  const [locationData, setLocationData] = useState(
    savedLocation || {
      city: "Lahore",
      country: "Pakistan",
      latitude: null,
      longitude: null,
    },
  );

  const [timings, setTimings] = useState(null);
  const [locationRequested, setLocationRequested] = useState(!!savedLocation);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);

  // The order in which to display the prayers
  const prayersOrder = [
    "Fajr",
    "Sunrise",
    "Dhuhr",
    "Asr",
    "Sunset",
    "Maghrib",
    "Isha",
    "Imsak",
    "Midnight",
    "Firstthird",
    "Lastthird",
  ];

  // Save location data to localStorage whenever it changes
  useEffect(() => {
    if (locationData.latitude && locationData.longitude) {
      localStorage.setItem("prayerTimesLocation", JSON.stringify(locationData));
    }
  }, [locationData]);

  // Get appropriate calculation method based on location
  const getCalculationMethod = (country) => {
    const methodMap = {
      "Saudi Arabia": 4, // Umm Al-Qura University, Mecca
      Egypt: 5, // Egyptian General Authority of Survey
      Turkey: 7, // Diyanet İşleri Başkanlığı, Turkey
      Iran: 7, // Institute of Geophysics, University of Tehran
      Pakistan: 1, // University of Islamic Sciences, Karachi
      India: 1, // University of Islamic Sciences, Karachi
      Bangladesh: 1, // University of Islamic Sciences, Karachi
      Malaysia: 8, // Majlis Ugama Islam Singapura, Singapore
      Singapore: 8, // Majlis Ugama Islam Singapura, Singapore
      Indonesia: 9, // Islamic Organization of North America
      Morocco: 12, // Union Organization islamic de France
      Algeria: 12, // Union Organization islamic de France
      Tunisia: 12, // Union Organization islamic de France
    };
    return methodMap[country] || 2; // Default to ISNA
  };

  // Fetch prayer times from API
  const fetchPrayerTimes = async (lat, lng, city, country) => {
    try {
      setLoading(true);
      const method = getCalculationMethod(country);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`,
      );
      const data = await response.json();

      if (data.code === 200) {
        setTimings(data.data.timings);
        setLocationData({ city, country, latitude: lat, longitude: lng });
      } else {
        setLocationError("Failed to fetch prayer times");
      }
    } catch (error) {
      setLocationError("Failed to fetch prayer times");
      console.error("Prayer times fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get user location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setLocationRequested(true);
    setLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Get city name from coordinates
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const locationInfo = await response.json();
          const city =
            locationInfo.city ||
            locationInfo.locality ||
            locationInfo.principalSubdivision ||
            "Unknown City";
          const country = locationInfo.countryName || "Unknown Country";

          await fetchPrayerTimes(latitude, longitude, city, country);
        } catch (error) {
          // Fallback: try a different geocoding service
          try {
            const fallbackResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            );
            const fallbackData = await fallbackResponse.json();
            const city =
              fallbackData.address?.city ||
              fallbackData.address?.town ||
              fallbackData.address?.village ||
              "Unknown City";
            const country = fallbackData.address?.country || "Unknown Country";

            await fetchPrayerTimes(latitude, longitude, city, country);
          } catch (fallbackError) {
            setLocationError("Failed to get location information");
            console.error("Location fetch error:", error, fallbackError);
            setLoading(false);
          }
        }
      },
      (error) => {
        setLocationError("Location access denied or unavailable");
        console.error("Geolocation error:", error);
        setLoading(false);
      },
    );
  };
  const formatTime = (time) => {
    if (!time) return "N/A";

    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12; // 0 becomes 12

    return `${h}:${minute} ${ampm}`;
  };

  // Don't automatically fetch prayer times - only show when user explicitly requests them

  const handleGetTimings = async () => {
    try {
      setLoading(true);

      // If we have location data with coordinates, use location-based API
      if (locationData.latitude && locationData.longitude) {
        const method = getCalculationMethod(locationData.country);
        const response = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${locationData.latitude}&longitude=${locationData.longitude}&method=${method}`,
        );
        const data = await response.json();

        if (data.code === 200) {
          setTimings(data.data.timings);
        } else {
          alert("Error fetching prayer timings. Please try again later.");
        }
      } else {
        // Fallback to city-based API for selected cities
        const country = locationData.city === "Dubai" ? "UAE" : "PK";
        const date = "16-03-2025";
        const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${locationData.city}&country=${country}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.code === 200) {
          setTimings(data.data.timings);
        } else {
          alert("Error fetching prayer timings. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error fetching prayer timings. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-12">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {t("islamicTools.prayerTimings.title")}
        </h1>

        {/* Location Section */}
        <div className="mb-4">
          <div className="flex items-center gap-x-1 mb-2">
            <FaLocationDot color="red" />
            <span className="font-semibold">
              {locationData.city}, {locationData.country}
            </span>
          </div>

          {/* Location Request Section - Only show if location not requested and not saved */}
          {!locationRequested && !savedLocation && (
            <div className="mb-4">
              <button
                onClick={requestLocation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors w-full justify-center"
                disabled={loading}
              >
                <FaLocationCrosshairs />
                {loading
                  ? "Getting your location..."
                  : "Allow location access for accurate prayer times"}
              </button>
            </div>
          )}

          {/* Error Message */}
          {locationError && (
            <div className="text-red-600 text-center py-1 mb-2 text-sm">
              {locationError}
            </div>
          )}
        </div>

        {/* City Dropdown - Only show if no location access */}
        {!locationRequested && !savedLocation && (
          <>
            <label htmlFor="citySelect" className="block mb-2 font-semibold">
              {t("islamicTools.prayerTimings.selectCity")}
            </label>
            <select
              id="citySelect"
              className="w-full border border-gray-300 rounded p-3 mb-4 outline-none focus:ring-2 focus:ring-green-500"
              value={locationData.city}
              onChange={(e) =>
                setLocationData((prev) => ({ ...prev, city: e.target.value }))
              }
            >
              <option value="Lahore">
                {t("islamicTools.prayerTimings.cities.Lahore")}
              </option>
              <option value="Islamabad">
                {t("islamicTools.prayerTimings.cities.Islamabad")}
              </option>
              <option value="Karachi">
                {t("islamicTools.prayerTimings.cities.Karachi")}
              </option>
              <option value="Dubai">
                {t("islamicTools.prayerTimings.cities.Dubai")}
              </option>
            </select>
          </>
        )}

        {/* Button to fetch timings */}
        <button
          onClick={handleGetTimings}
          className="w-full bg-green-500 cursor-pointer text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
          disabled={loading}
        >
          {loading ? "Loading..." : t("islamicTools.prayerTimings.getTimings")}
        </button>

        {/* Display Timings Table if timings are available */}
        {timings && (
          <div className="mt-6">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="p-2 border border-gray-200">
                    {t("islamicTools.prayerTimings.prayer")}
                  </th>
                  <th className="p-2 border border-gray-200">
                    {t("islamicTools.prayerTimings.time")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {prayersOrder.map((prayer) => (
                  <tr key={prayer} className="hover:bg-gray-100">
                    <td className="p-2 border border-gray-200 font-semibold">
                      {t(`islamicTools.prayerTimings.prayerNames.${prayer}`)}
                    </td>
                    <td className="p-2 border border-gray-200">
                      {formatTime(timings[prayer])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerTimings;
