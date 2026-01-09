import { useState, useCallback } from "react";

interface GeolocationState {
  loading: boolean;
  error: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

// Default coordinates for major Pakistan cities
const DEFAULT_LOCATIONS = {
  lahore: { latitude: 31.5204, longitude: 74.3587 },
  karachi: { latitude: 24.8607, longitude: 67.0011 },
  islamabad: { latitude: 33.6844, longitude: 73.0479 },
  rawalpindi: { latitude: 33.5651, longitude: 73.0169 },
  faisalabad: { latitude: 31.4504, longitude: 73.1350 },
  multan: { latitude: 30.1575, longitude: 71.5249 },
  peshawar: { latitude: 34.0151, longitude: 71.5249 },
  quetta: { latitude: 30.1798, longitude: 66.9750 },
  sialkot: { latitude: 32.4945, longitude: 74.5229 },
  gujranwala: { latitude: 32.1877, longitude: 74.1945 },
  hyderabad: { latitude: 25.3960, longitude: 68.3578 },
  bahawalpur: { latitude: 29.3956, longitude: 71.6836 },
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    coordinates: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: "Geolocation is not supported by your browser",
        coordinates: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions or use manual selection.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable. Try using manual city selection below.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Try using manual city selection.";
            break;
        }
        setState({
          loading: false,
          error: errorMessage,
          coordinates: null,
        });
      },
      {
        enableHighAccuracy: false, // Set to false for faster response
        timeout: 15000, // Increased timeout
        maximumAge: 600000, // 10 minutes cache
      }
    );
  }, []);

  const setManualLocation = useCallback((city: keyof typeof DEFAULT_LOCATIONS) => {
    const coords = DEFAULT_LOCATIONS[city];
    setState({
      loading: false,
      error: null,
      coordinates: coords,
    });
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      loading: false,
      error: null,
      coordinates: null,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    setManualLocation,
    clearLocation,
    availableCities: Object.keys(DEFAULT_LOCATIONS) as (keyof typeof DEFAULT_LOCATIONS)[],
  };
};
