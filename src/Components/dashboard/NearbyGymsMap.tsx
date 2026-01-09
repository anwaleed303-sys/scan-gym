import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../../Integrations/client";
import { MapPin, Navigation, Clock, Building2 } from "lucide-react";
import { Button } from "../ui/button";

interface Gym {
  id: string;
  name: string;
  city: string;
  address: string | null;
}

interface NearbyGymsMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

const NearbyGymsMap = ({ userLocation }: NearbyGymsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      const { data, error } = await supabase.functions.invoke(
        "get-mapbox-token"
      );
      if (data?.token) {
        setMapboxToken(data.token);
      }
      setLoading(false);
    };
    fetchToken();
  }, []);

  // Fetch gyms
  useEffect(() => {
    const fetchGyms = async () => {
      const { data } = await supabase.from("gyms").select("*");
      if (data) {
        setGyms(data);
      }
    };
    fetchGyms();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 13,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add user location marker
    const userMarkerEl = document.createElement("div");
    userMarkerEl.className = "user-marker";
    userMarkerEl.innerHTML = `
      <div class="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg animate-pulse flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    `;
    userMarkerEl.style.cssText = `
      width: 24px;
      height: 24px;
      background: hsl(142, 76%, 36%);
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    `;

    new mapboxgl.Marker(userMarkerEl)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map.current);

    // Add gym markers (simulated locations near user)
    gyms.forEach((gym, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.02;
      const offsetLng = (Math.random() - 0.5) * 0.02;

      const markerEl = document.createElement("div");
      markerEl.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 46%));
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;
      `;
      markerEl.innerHTML = `<span style="font-size: 18px;">🏋️</span>`;
      markerEl.onmouseenter = () => {
        markerEl.style.transform = "scale(1.2)";
      };
      markerEl.onmouseleave = () => {
        markerEl.style.transform = "scale(1)";
      };
      markerEl.onclick = () => {
        setSelectedGym(gym);
      };

      new mapboxgl.Marker(markerEl)
        .setLngLat([
          userLocation.longitude + offsetLng,
          userLocation.latitude + offsetLat,
        ])
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation, gyms]);

  if (loading) {
    return (
      <div className="h-96 bg-card rounded-2xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="h-96 bg-card rounded-2xl flex items-center justify-center p-6">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Map unavailable. Please configure Mapbox token.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative h-96 rounded-2xl overflow-hidden border border-border">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* User Location Badge */}
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 border border-border">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-foreground font-medium">
            Your Location
          </span>
        </div>

        {/* Gyms Count Badge */}
        <div className="absolute top-4 right-16 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-border">
          <span className="text-sm text-foreground font-medium">
            {gyms.length} Gyms Nearby
          </span>
        </div>
      </div>

      {/* Selected Gym Card */}
      {selectedGym && (
        <div className="bg-card rounded-xl p-5 border border-border animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center text-3xl">
              🏋️
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-foreground">
                {selectedGym.name}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {selectedGym.address || selectedGym.city}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-primary">
                  <Clock className="w-4 h-4" />
                  Open Now
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Navigation className="w-4 h-4" />~
                  {Math.round(Math.random() * 2 + 0.5)} km away
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="hero" className="flex-1">
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" onClick={() => setSelectedGym(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Nearby Gyms List */}
      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Partner Gyms Near You
        </h3>
        {gyms.slice(0, 4).map((gym) => (
          <div
            key={gym.id}
            className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => setSelectedGym(gym)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-xl">
                🏋️
              </div>
              <div className="flex-1">
                <h4 className="font-display font-bold text-foreground">
                  {gym.name}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {gym.address || gym.city}
                </p>
              </div>
              <div className="text-right">
                <span className="text-primary text-sm font-medium">Open</span>
                <p className="text-muted-foreground text-xs">
                  ~{Math.round(Math.random() * 2 + 0.5)} km
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyGymsMap;
