import { useEffect, useState } from "react";
import { authApiClient } from "../../api/backendApi";
import { useAuthData } from "../../context/AuthContext";

const Settings = () => {
  // ✅ Get updateUser from AuthContext
  const { token, user, updateUser } = useAuthData();

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  // Sync local toggle state with the global user object
  useEffect(() => {
    if (user) {
      setEmailEnabled(!!user.receive_daily_email);
    }
  }, [user]);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await authApiClient.post(
        "api/auth/toggle-daily-email/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Update the global user object. This automatically saves to storage.
      updateUser({ receive_daily_email: res.data.receive_daily_email });

    } catch (err) {
      console.error(err);
      alert("Failed to update email setting");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationStatus("Fetching coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        try {
          await authApiClient.post(
            "api/auth/update-location/",
            { latitude, longitude },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // ✅ Update global user state with new coordinates
          updateUser({ latitude, longitude });

          setLocationStatus("Location updated successfully!");
          setTimeout(() => setLocationStatus(""), 3000);
        } catch (err) {
          console.error("Django Error Response:", err.response?.data);
          const errorMsg = err.response?.data?.latitude?.[0] || "Failed to sync with server";
          setLocationStatus(errorMsg);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        setLocationStatus("Permission denied");
        console.error(error);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Settings
        </h1>

        {/* EMAIL SETTING */}
        <div className="flex items-center justify-between border-b pb-6 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Daily Ayat & Hadith Email
            </h3>
            <p className="text-sm text-gray-500">
              Receive a daily Quran verse and Hadith in your email
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
              emailEnabled ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                emailEnabled ? "translate-x-7" : ""
              }`}
            />
          </button>
        </div>

        {/* LOCATION SETTING */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Prayer Time Location
            </h3>
            <p className="text-sm text-gray-500">
              Update your location to receive emails exactly at Fajr time
            </p>
            {locationStatus && (
              <p className={`text-xs mt-1 ${locationStatus.includes("success") ? "text-green-500" : "text-red-500"}`}>
                {locationStatus}
              </p>
            )}
          </div>

          <button
            onClick={handleUpdateLocation}
            disabled={locationLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
              locationLoading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {locationLoading ? "Updating..." : "Update Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;