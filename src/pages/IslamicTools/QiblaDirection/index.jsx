import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../../context/LanguageContext";
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Shared function to load Google Maps API.
const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps) {
    callback();
  } else {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
  }
};

// Main QiblaDirection component: decides between mobile and desktop.
const QiblaDirection = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  // A simple user agent check for mobile devices.
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Get user location.
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) =>
          setError(
            `${t("islamicTools.qiblaDirection.errorGettingLocation")} ${
              err.message
            }`
          ),
        { enableHighAccuracy: true }
      );
    } else {
      setError(t("islamicTools.qiblaDirection.notSupported"));
    }
    // eslint-disable-next-line
  }, []);

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>{t("islamicTools.qiblaDirection.loadingLocation")}</p>
      </div>
    );
  }

  return isMobile ? (
    <MobileQibla location={location} />
  ) : (
    <DesktopQibla location={location} />
  );
};

// ------------------------
// Mobile Qibla Component
// Uses device orientation (with fallback) and displays the map with a rotating user marker.
// ------------------------
const MobileQibla = ({ location }) => {
  const { t } = useLanguage();
  const [heading, setHeading] = useState(null);
  const [isManual, setIsManual] = useState(false);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Calculate the Qibla bearing using spherical trigonometry.
  const calculateQiblaDirection = (lat, lon) => {
    const kaabaLat = 21.4225; // Latitude of the Kaaba
    const kaabaLon = 39.8262; // Longitude of the Kaaba
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const toDegrees = (rad) => (rad * 180) / Math.PI;

    const lat1 = toRadians(lat);
    const lon1 = toRadians(lon);
    const lat2 = toRadians(kaabaLat);
    const lon2 = toRadians(kaabaLon);
    const deltaLon = lon2 - lon1;

    const numerator = Math.sin(deltaLon);
    const denominator =
      Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLon);
    let bearing = toDegrees(Math.atan2(numerator, denominator));
    return (bearing + 360) % 360;
  };

  const qiblaDirection = calculateQiblaDirection(
    location.latitude,
    location.longitude
  );
  // Compute the rotation needed relative to the device heading.
  const rotationAngle =
    heading !== null ? (qiblaDirection - heading + 360) % 360 : 0;

  // Device orientation event (with iOS permission request if needed).
  useEffect(() => {
    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        DeviceOrientationEvent.requestPermission
      ) {
        try {
          const response = await DeviceOrientationEvent.requestPermission();
          if (response !== "granted") {
            setIsManual(true);
          }
        } catch (err) {
          setIsManual(true);
        }
      }
    };
    requestPermission();

    const handleOrientation = (event) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    // Fallback: if no orientation data is received in 5 seconds, enable manual mode.
    const timer = setTimeout(() => {
      if (heading === null) {
        setIsManual(true);
        setHeading(0);
      }
    }, 5000);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearTimeout(timer);
    };
  }, [heading]);

  // Initialize the map with markers and polyline.
  useEffect(() => {
    loadGoogleMapsScript(() => {
      const { latitude, longitude } = location;
      const userLatLng = new window.google.maps.LatLng(latitude, longitude);
      const kaabaLatLng = new window.google.maps.LatLng(21.4225, 39.8262);

      // Initialize the map centered on the user's location.
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLatLng,
        zoom: 10,
      });
      mapInstanceRef.current = map;

      // Create a custom marker for the user's location that uses an arrow symbol.
      const userMarker = new window.google.maps.Marker({
        position: userLatLng,
        map: map,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: "#0000FF",
          fillOpacity: 0.8,
          strokeWeight: 2,
          rotation: heading || 0,
        },
      });
      userMarkerRef.current = userMarker;

      // Marker for the Kaaba.
      new window.google.maps.Marker({
        position: kaabaLatLng,
        map: map,
        title: "Kaaba",
      });

      // Draw a geodesic polyline between the two locations.
      const line = new window.google.maps.Polyline({
        path: [userLatLng, kaabaLatLng],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      line.setMap(map);
    });
  }, [location]);

  // Update the user marker's icon rotation when heading changes.
  useEffect(() => {
    if (userMarkerRef.current && heading !== null) {
      const icon = userMarkerRef.current.getIcon();
      icon.rotation = heading;
      userMarkerRef.current.setIcon(icon);
    }
  }, [heading]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>
        {t("islamicTools.qiblaDirection.qiblaDirectionLabel")}:{" "}
        {Math.round(qiblaDirection)}
        {t("islamicTools.qiblaDirection.degree")}
      </h2>
      <p>
        {t("islamicTools.qiblaDirection.deviceHeading")}:{" "}
        {heading !== null
          ? Math.round(heading)
          : t("islamicTools.qiblaDirection.nA")}
        {t("islamicTools.qiblaDirection.degree")}
      </p>
      {isManual && (
        <div style={{ marginBottom: "20px" }}>
          <p>{t("islamicTools.qiblaDirection.manualAdjust")}</p>
          <input
            type="range"
            min="0"
            max="360"
            value={heading}
            onChange={(e) => setHeading(Number(e.target.value))}
          />
        </div>
      )}
      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          margin: "20px auto",
          width: "90%",
          maxWidth: "500px",
          height: "400px",
          border: "2px solid #ccc",
          borderRadius: "8px",
        }}
      ></div>
      <p className="mx-4 mb-4">
        {t("islamicTools.qiblaDirection.rotateInstruction")}
      </p>
    </div>
  );
};

// ------------------------
// Desktop Qibla Component
// Loads the Google Maps API and displays a map with a line (polyline)
// from the user's location to the Kaaba.
// ------------------------
const DesktopQibla = ({ location }) => {
  const { t } = useLanguage();
  const mapRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsScript(() => {
      const { latitude, longitude } = location;
      const userLatLng = new window.google.maps.LatLng(latitude, longitude);
      const kaabaLatLng = new window.google.maps.LatLng(21.4225, 39.8262);

      // Initialize the map centered on the user's location.
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLatLng,
        zoom: 10,
      });

      // Marker for the user's location.
      new window.google.maps.Marker({
        position: userLatLng,
        map: map,
        title: "Your Location",
      });

      // Marker for the Kaaba.
      new window.google.maps.Marker({
        position: kaabaLatLng,
        map: map,
        title: "Kaaba",
      });

      // Draw a geodesic polyline between the two locations.
      const line = new window.google.maps.Polyline({
        path: [userLatLng, kaabaLatLng],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      line.setMap(map);
    });
  }, [location]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2 className="text-xl my-4">{t("islamicTools.qiblaDirection.onMap")}</h2>
      <div className="flex justify-center">
        <div
          ref={mapRef}
          style={{
            margin: "0 auto 20px",
            border: "2px solid #ccc",
            borderRadius: "8px",
          }}
          className="h-40 sm:h-96 w-[90%] sm:w-[80%]"
        ></div>
      </div>
    </div>
  );
};

export default QiblaDirection;
