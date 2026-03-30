import { useState, useEffect } from "react";
import { FaLocationDot, FaLocationCrosshairs } from "react-icons/fa6";
import { useLanguage } from "../../../context/LanguageContext";

const HeaderBanner = () => {
  // Try to load saved location from localStorage
  const savedLocation = JSON.parse(localStorage.getItem("prayerTimesLocation"));

  const [locationData, setLocationData] = useState(
    savedLocation || {
      city: "Islamabad",
      country: "Pakistan",
      latitude: null,
      longitude: null,
    }
  );

  const [prayerTimes, setPrayerTimes] = useState({
    Fajr: "5:20 AM",
    Dhuhr: "12:35 PM",
    Asr: "3:45 PM",
    Maghrib: "6:15 PM",
    Isha: "7:30 PM",
  });

  const [currentPrayer, setCurrentPrayer] = useState("Fajr");
  const [nextPrayer, setNextPrayer] = useState("Dhuhr");
  const [locationRequested, setLocationRequested] = useState(!!savedLocation);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);

  const { language, toggleLanguage, t } = useLanguage();

  // Save location data to localStorage whenever it changes
  useEffect(() => {
    if (locationData.latitude && locationData.longitude) {
      localStorage.setItem("prayerTimesLocation", JSON.stringify(locationData));
    }
  }, [locationData]);

  // Convert 12-hour time to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
    if (period === "AM" && hours === 12) totalMinutes = minutes;
    return totalMinutes;
  };

  // Get current time in minutes
  const getCurrentTimeMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Determine current and next prayer
  const updateCurrentPrayer = () => {
    const currentTimeMinutes = getCurrentTimeMinutes();
    const prayerTimesArray = Object.entries(prayerTimes).map(
      ([name, time]) => ({
        name,
        time,
        minutes: timeToMinutes(time),
      })
    );

    // Sort by time
    prayerTimesArray.sort((a, b) => a.minutes - b.minutes);

    let current = prayerTimesArray[prayerTimesArray.length - 1].name; // Default to last prayer
    let next = prayerTimesArray[0].name; // Default to first prayer of next day

    for (let i = 0; i < prayerTimesArray.length; i++) {
      if (currentTimeMinutes < prayerTimesArray[i].minutes) {
        next = prayerTimesArray[i].name;
        current =
          i > 0
            ? prayerTimesArray[i - 1].name
            : prayerTimesArray[prayerTimesArray.length - 1].name;
        break;
      }
    }

    setCurrentPrayer(current);
    setNextPrayer(next);
  };

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
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`
      );
      const data = await response.json();

      if (data.code === 200) {
        const timings = data.data.timings;
        const formattedTimes = {
          Fajr: convertTo12Hour(timings.Fajr),
          Dhuhr: convertTo12Hour(timings.Dhuhr),
          Asr: convertTo12Hour(timings.Asr),
          Maghrib: convertTo12Hour(timings.Maghrib),
          Isha: convertTo12Hour(timings.Isha),
        };
        setPrayerTimes(formattedTimes);
        setLocationData({ city, country, latitude: lat, longitude: lng });
      }
    } catch (error) {
      setLocationError("Failed to fetch prayer times");
      console.error("Prayer times fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert 24-hour format to 12-hour format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
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
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
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
      }
    );
  };

  // Update current prayer every minute
  useEffect(() => {
    updateCurrentPrayer();
    const interval = setInterval(updateCurrentPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Fetch prayer times if we have saved location but no prayer times yet
  useEffect(() => {
    if (savedLocation && savedLocation.latitude && savedLocation.longitude) {
      fetchPrayerTimes(
        savedLocation.latitude,
        savedLocation.longitude,
        savedLocation.city,
        savedLocation.country
      );
    }
  }, []);

  return (
    <div className="bg-[#1E3A5F] py-2 px-5 md:px-10 text-white text-sm">
      {/* Location Request Section - Only show if location not requested and not saved */}
      {!locationRequested && !savedLocation && (
        <div className="flex items-center justify-center py-2 mb-2 bg-[#2A4A6B] rounded">
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            <FaLocationCrosshairs />
            {loading
              ? t("headerBanner.gettingLocation")
              : t("headerBanner.allowLocation")}
          </button>
        </div>
      )}

      {/* Error Message */}
      {locationError && (
        <div className="text-red-300 text-center py-1 mb-2">
          {t("headerBanner.locationError")}
        </div>
      )}

      {/* Main Header Content */}
      <div className="flex justify-between items-center">
        {/* Left Section: Location and Prayer Times */}
        <div className="flex gap-4 items-center">
          {/* Location */}
          <div className="flex items-center gap-x-1">
            <FaLocationDot color="red" />
            <h1>
              {locationData.city}, {locationData.country}
            </h1>
          </div>

          {/* Current Prayer Status */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-green-300">
              {t("headerBanner.current")}: {currentPrayer}
            </span>
            <span className="text-orange-300">
              {t("headerBanner.next")}: {nextPrayer} ({prayerTimes[nextPrayer]})
            </span>
          </div>

          {/* Prayer Times - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex items-center">
            <h1 className="mr-2">{t("headerBanner.prayerTimes")}</h1>
            {Object.entries(prayerTimes).map(([prayer, time], index, array) => (
              <h1
                key={prayer}
                className={`ml-1 ${
                  prayer === currentPrayer
                    ? "text-green-300 font-semibold"
                    : prayer === nextPrayer
                    ? "text-orange-300"
                    : ""
                }`}
              >
                {prayer}: {time}
                {index < array.length - 1 ? " |" : ""}
              </h1>
            ))}
          </div>
        </div>

        {/* Right Section: Language Selector */}
        <div className="flex gap-2 items-center">
          <h1
            className="cursor-pointer hover:text-green-300 transition-colors"
            onClick={toggleLanguage}
          >
            {language === "en"
              ? t("headerBanner.urdu")
              : t("headerBanner.english")}
          </h1>
        </div>
      </div>

      {/* Mobile Prayer Summary */}
      <div className="sm:hidden mt-2 pt-2 border-t border-[#2A4A6B]">
        <div className="flex justify-between items-center">
          <span className="text-green-300">
            {t("headerBanner.current")}: {currentPrayer}
          </span>
          <span className="text-orange-300">
            {t("headerBanner.next")}: {nextPrayer} {t("headerBanner.at")}{" "}
            {prayerTimes[nextPrayer]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;
