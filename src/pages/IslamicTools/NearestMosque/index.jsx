import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useLanguage } from "../../../context/LanguageContext";
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "600px",
};

const NearestMosqueMap = () => {
  const { t } = useLanguage();
  const [userLocation, setUserLocation] = useState(null);
  const [mosques, setMosques] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMosque, setSelectedMosque] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setError(t("islamicTools.nearestMosque.error"));
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setError(t("islamicTools.nearestMosque.notSupported"));
    }
  }, [t]);

  useEffect(() => {
    if (isLoaded && userLocation) {
      const map = new window.google.maps.Map(document.createElement("div"));
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location: new window.google.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        ),
        radius: 5000,
        type: "mosque",
      };

      service.nearbySearch(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          setMosques(results);
        } else {
          console.error("Places API error:", status);
        }
      });
    }
  }, [isLoaded, userLocation]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!isLoaded || !userLocation) {
    return (
      <div className="loading">{t("islamicTools.nearestMosque.loading")}</div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={14}
      >
        <Marker
          position={userLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          }}
        />

        {mosques.map((mosque) => (
          <Marker
            key={mosque.place_id}
            position={mosque.geometry?.location}
            onClick={() => setSelectedMosque(mosque)}
          >
            {selectedMosque?.place_id === mosque.place_id && (
              <InfoWindow onCloseClick={() => setSelectedMosque(null)}>
                <div>
                  <h3>{mosque.name}</h3>
                  <p>{mosque.vicinity}</p>
                  {mosque.rating && (
                    <p>
                      {t("islamicTools.nearestMosque.rating")}: {mosque.rating}{" "}
                      ★
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
};

export default NearestMosqueMap;
