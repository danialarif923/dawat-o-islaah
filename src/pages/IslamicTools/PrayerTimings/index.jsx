import { useState } from "react";
import { FaLocationDot, FaCrosshairs } from "react-icons/fa6";
import { useLanguage } from "../../../context/LanguageContext";

const PrayerTimings = () => {
  const { t, language } = useLanguage();
  const isRtl = language === "ur";

  const CURRENT_LOCATION_VALUE = "_current_";

  const cities = [
    { value: CURRENT_LOCATION_VALUE, country: "" },
    { value: "Lahore", country: "Pakistan" },
    { value: "Islamabad", country: "Pakistan" },
    { value: "Karachi", country: "Pakistan" },
    { value: "Faisalabad", country: "Pakistan" },
    { value: "Rawalpindi", country: "Pakistan" },
    { value: "Multan", country: "Pakistan" },
    { value: "Peshawar", country: "Pakistan" },
    { value: "Quetta", country: "Pakistan" },
    { value: "Sialkot", country: "Pakistan" },
    { value: "Gujranwala", country: "Pakistan" },
    { value: "Hyderabad", country: "Pakistan" },
    { value: "Mecca", country: "Saudi Arabia" },
    { value: "Madina", country: "Saudi Arabia" },
  ];

  const [selectedCity, setSelectedCity] = useState(cities[1]);
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);

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

  const getCalculationMethod = (country) => {
    const methodMap = {
      "Saudi Arabia": 4,
      Egypt: 5,
      Turkey: 7,
      Iran: 7,
      Pakistan: 1,
      India: 1,
      Bangladesh: 1,
      Malaysia: 8,
      Singapore: 8,
      Indonesia: 9,
      Morocco: 12,
      Algeria: 12,
      Tunisia: 12,
    };
    return methodMap[country] || 2;
  };

  const getGpsLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: false,
      });
    });

  const fetchTimings = async (city, country, lat = null, lng = null) => {
    try {
      setLoading(true);
      setError("");
      const now = new Date();
      const date = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
      const url = lat != null && lng != null
        ? `/aladhan/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=2`
        : `/aladhan/v1/timingsByCity/${date}?city=${city}&country=${country}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 200) {
        setTimings(data.data.timings);
      } else {
        setError("Failed to fetch prayer timings");
      }
    } catch {
      setError("Failed to fetch prayer timings");
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = async (e) => {
    const city = cities.find((c) => c.value === e.target.value);
    if (!city) return;
    setSelectedCity(city);
    if (city.value === CURRENT_LOCATION_VALUE) {
      setIsCurrentLocation(true);
      try {
        const pos = await getGpsLocation();
        fetchTimings(null, null, pos.coords.latitude, pos.coords.longitude);
      } catch {
        setIsCurrentLocation(false);
        setSelectedCity(cities[1]);
        setError("Could not get your location. Please allow location access and try again.");
      }
    } else {
      setIsCurrentLocation(false);
      fetchTimings(city.value, city.country);
    }
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  return (
    <div className="flex justify-center items-center my-12" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {t("islamicTools.prayerTimings.title")}
        </h1>

        <label htmlFor="citySelect" className="block mb-2 font-semibold">
          {t("islamicTools.prayerTimings.selectCity")}
        </label>
        <select
          id="citySelect"
          className="w-full border border-gray-300 rounded p-3 mb-4 outline-none focus:ring-2 focus:ring-green-500"
          value={selectedCity.value}
          onChange={handleCityChange}
        >
          {cities.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value === CURRENT_LOCATION_VALUE
                ? t("islamicTools.prayerTimings.currentLocation")
                : t(`islamicTools.prayerTimings.cities.${c.value}`)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-x-1 mb-4">
          {isCurrentLocation ? <FaCrosshairs color="red" /> : <FaLocationDot color="red" />}
          <span className="font-semibold">
            {isCurrentLocation
              ? t("islamicTools.prayerTimings.currentLocation")
              : `${t(`islamicTools.prayerTimings.cities.${selectedCity.value}`)}, ${t(`islamicTools.prayerTimings.countries.${selectedCity.country}`)}`}
          </span>
        </div>

        {error && (
          <div className="text-red-600 text-center py-1 mb-2 text-sm">{error}</div>
        )}

        {loading && (
          <div className="text-center py-4 text-gray-500">
            {t("islamicTools.prayerTimings.loading")}
          </div>
        )}

        {timings && !loading && (
          <div className="mt-2">
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
