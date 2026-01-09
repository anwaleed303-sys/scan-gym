import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { supabase } from "../../Integrations/client";
import { Map, MapPin, Clock, Phone, X, ExternalLink } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Gym {
  id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_time: string | null;
  closing_time: string | null;
  services: string[] | null;
  phone: string | null;
  is_active: boolean | null;
}

interface GymsMapViewProps {
  gyms: Gym[];
}

const SERVICE_LABELS: Record<string, string> = {
  weights: "Weight Training",
  cardio: "Cardio",
  yoga: "Yoga",
  swimming: "Swimming",
  personal_training: "Personal Training",
  group_classes: "Group Classes",
  crossfit: "CrossFit",
  martial_arts: "Martial Arts",
};

export const GymsMapView = ({ gyms }: GymsMapViewProps) => {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (isExpanded && mapboxToken && mapContainer.current && !map.current) {
      initializeMap();
    }
  }, [isExpanded, mapboxToken]);

  useEffect(() => {
    if (map.current && gyms.length > 0) {
      updateMarkers();
    }
  }, [gyms, map.current]);

  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-mapbox-token"
      );
      if (error) throw error;
      setMapboxToken(data.token);
    } catch (error) {
      console.error("Error fetching Mapbox token:", error);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Find center from gyms with coordinates
    const gymsWithCoords = gyms.filter((g) => g.latitude && g.longitude);
    const center: [number, number] =
      gymsWithCoords.length > 0
        ? [gymsWithCoords[0].longitude!, gymsWithCoords[0].latitude!]
        : [67.0011, 24.8607]; // Default to Karachi

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      updateMarkers();
      fitBounds();
    });
  };

  const updateMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add markers for each gym
    gyms.forEach((gym) => {
      if (!gym.latitude || !gym.longitude) return;

      const el = document.createElement("div");
      el.className = "gym-marker";
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
          gym.is_active ? "bg-emerald-500" : "bg-gray-500"
        }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6h-3a3 3 0 1 0 0 6h3"/>
            <path d="M6 6h3a3 3 0 1 1 0 6H6"/>
            <path d="M18 6v12"/>
            <path d="M6 6v12"/>
            <path d="M21 9v6"/>
            <path d="M3 9v6"/>
          </svg>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedGym(gym);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([gym.longitude, gym.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  const fitBounds = () => {
    if (!map.current) return;

    const gymsWithCoords = gyms.filter((g) => g.latitude && g.longitude);
    if (gymsWithCoords.length === 0) return;

    if (gymsWithCoords.length === 1) {
      map.current.flyTo({
        center: [gymsWithCoords[0].longitude!, gymsWithCoords[0].latitude!],
        zoom: 14,
      });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    gymsWithCoords.forEach((gym) => {
      bounds.extend([gym.longitude!, gym.latitude!]);
    });

    map.current.fitBounds(bounds, { padding: 50 });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const gymsWithLocation = gyms.filter((g) => g.latitude && g.longitude);
  const gymsWithoutLocation = gyms.filter((g) => !g.latitude || !g.longitude);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Map className="w-5 h-5" />
            Gyms Map View
          </CardTitle>
          <CardDescription>
            View all gym locations on the map ({gymsWithLocation.length} with
            location, {gymsWithoutLocation.length} without)
          </CardDescription>
        </div>
        <Button
          variant={isExpanded ? "secondary" : "default"}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide Map" : "Show Map"}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="relative">
            {mapboxToken ? (
              <div
                ref={mapContainer}
                className="w-full h-[500px] rounded-lg overflow-hidden"
              />
            ) : (
              <div className="w-full h-[500px] rounded-lg flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
              <p className="text-sm font-medium mb-2">Legend</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>Active Gym</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span>Inactive Gym</span>
                </div>
              </div>
            </div>

            {/* Selected Gym Info */}
            {selectedGym && (
              <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {selectedGym.name}
                      </h3>
                      <Badge
                        variant={
                          selectedGym.is_active ? "default" : "secondary"
                        }
                      >
                        {selectedGym.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedGym.address || selectedGym.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(selectedGym.opening_time)} -{" "}
                          {formatTime(selectedGym.closing_time)}
                        </span>
                      </div>
                      {selectedGym.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{selectedGym.phone}</span>
                        </div>
                      )}
                    </div>

                    {selectedGym.services &&
                      selectedGym.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {selectedGym.services.map((service) => (
                            <Badge
                              key={service}
                              variant="outline"
                              className="text-xs"
                            >
                              {SERVICE_LABELS[service] || service}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedGym(null)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Gyms without location */}
          {gymsWithoutLocation.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Gyms without location ({gymsWithoutLocation.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {gymsWithoutLocation.map((gym) => (
                  <Badge key={gym.id} variant="outline">
                    {gym.name} - {gym.city}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
