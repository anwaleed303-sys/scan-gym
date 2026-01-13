import { useState, useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Map,
  MapPin,
  Clock,
  Phone,
  X,
  Search,
  Navigation,
  Loader2,
  Route,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

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
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const routingControl = useRef<any>(null);
  const userMarker = useRef<L.Marker | null>(null);

  // Filter gyms based on search query
  const filteredGyms = useMemo(() => {
    if (!searchQuery.trim()) return gyms;

    const query = searchQuery.toLowerCase();
    return gyms.filter(
      (gym) =>
        gym.name.toLowerCase().includes(query) ||
        gym.city.toLowerCase().includes(query) ||
        gym.address?.toLowerCase().includes(query)
    );
  }, [gyms, searchQuery]);

  // Filter for active gyms only with valid coordinates
  const activeGyms = useMemo(() => {
    return filteredGyms.filter(
      (gym) => gym.is_active && gym.latitude && gym.longitude
    );
  }, [filteredGyms]);

  // Calculate gym statistics
  const gymStats = useMemo(() => {
    const total = gyms.length;
    const active = gyms.filter(
      (g) => g.is_active && g.latitude && g.longitude
    ).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [gyms]);

  // Inactive or gyms without location
  const inactiveOrNoLocation = gyms.filter(
    (g) => !g.is_active || !g.latitude || !g.longitude
  );

  useEffect(() => {
    if (isExpanded && mapContainer.current && !map.current) {
      initializeMap();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (map.current && activeGyms.length > 0) {
      updateMarkers();
      fitBounds();
    }
  }, [activeGyms]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current) return;

    const gymsWithCoords = activeGyms;
    if (gymsWithCoords.length === 0) {
      return;
    }

    // Calculate center point from all gyms
    const avgLat =
      gymsWithCoords.reduce((sum, gym) => sum + gym.latitude!, 0) /
      gymsWithCoords.length;
    const avgLng =
      gymsWithCoords.reduce((sum, gym) => sum + gym.longitude!, 0) /
      gymsWithCoords.length;

    const center: [number, number] = [avgLat, avgLng];

    map.current = L.map(mapContainer.current).setView(center, 12);

    // Add OpenStreetMap tiles - THIS WAS MISSING!
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    updateMarkers();
    fitBounds();
  };
  // const initializeMap = () => {
  //   if (!mapContainer.current) return;

  //   const gymsWithCoords = activeGyms;
  //   if (gymsWithCoords.length === 0) {
  //     return;
  //   }

  //   // Calculate center point from all gyms
  //   const avgLat =
  //     gymsWithCoords.reduce((sum, gym) => sum + gym.latitude!, 0) /
  //     gymsWithCoords.length;
  //   const avgLng =
  //     gymsWithCoords.reduce((sum, gym) => sum + gym.longitude!, 0) /
  //     gymsWithCoords.length;

  //   const center: [number, number] = [avgLat, avgLng];

  //   map.current = L.map(mapContainer.current).setView(center, 12);
  // };

  const createCustomIcon = (isActive: boolean) => {
    const color = isActive ? "#10b981" : "#6b7280";
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M18 16h-3a3 3 0 1 0 0 6h3M22 16h3a3 3 0 1 1 0 6h-3M18 16v12M22 16v12M25 19v6M15 19v6" 
              stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: "custom-gym-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const updateMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add markers ONLY for ACTIVE gyms with coordinates
    activeGyms.forEach((gym) => {
      if (!gym.latitude || !gym.longitude) return;

      const icon = createCustomIcon(true); // All shown gyms are active

      const destination = gym.address
        ? encodeURIComponent(`${gym.address}, ${gym.city}`)
        : `${gym.latitude},${gym.longitude}`;

      const popupContent = `
        <div style="text-align: center; min-width: 150px;">
          <strong style="font-size: 14px;">${gym.name}</strong><br/>
          <span style="font-size: 12px; color: #666;">${
            gym.address || gym.city
          }</span><br/>
          <button 
            onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${destination}', '_blank')"
            style="
              margin-top: 8px;
              padding: 6px 12px;
              background: #10b981;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
            "
            onmouseover="this.style.background='#059669'"
            onmouseout="this.style.background='#10b981'"
          >
            Get Directions
          </button>
        </div>
      `;

      const marker = L.marker([gym.latitude, gym.longitude], { icon })
        .addTo(map.current!)
        .bindPopup(popupContent)
        .on("click", () => {
          setSelectedGym(gym);
          clearRoute();
        });

      markers.current.push(marker);
    });
  };

  const fitBounds = () => {
    if (!map.current) return;

    if (activeGyms.length === 0) return;

    if (activeGyms.length === 1) {
      map.current.setView(
        [activeGyms[0].latitude!, activeGyms[0].longitude!],
        14
      );
      return;
    }

    const bounds = L.latLngBounds(
      activeGyms.map((gym) => [gym.latitude!, gym.longitude!])
    );

    map.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = { lat: latitude, lng: longitude };
        setUserLocation(userPos);

        if (map.current) {
          // Create or update user location marker
          if (userMarker.current) {
            userMarker.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              html: `
                <div style="width: 30px; height: 30px;">
                  <svg width="30" height="30" viewBox="0 0 30 30">
                    <circle cx="15" cy="15" r="13" fill="#3b82f6" stroke="white" stroke-width="3"/>
                    <circle cx="15" cy="15" r="5" fill="white"/>
                  </svg>
                </div>
              `,
              className: "user-location-marker",
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });

            userMarker.current = L.marker([latitude, longitude], {
              icon: userIcon,
              zIndexOffset: 1000,
            }).addTo(map.current);

            userMarker.current.bindPopup(
              "<strong>Your Location</strong><br/>Current position"
            );
          }

          map.current.setView([latitude, longitude], 13);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Unable to retrieve your location. Please enable location access."
        );
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const calculateRoute = async (gym: Gym) => {
    if (!map.current || !gym.latitude || !gym.longitude) return;

    // Get user location if not already set
    if (!userLocation) {
      alert("Please set your location first by clicking 'Get My Location'");
      return;
    }

    setIsLoadingRoute(true);

    try {
      // Remove existing route if any
      if (routingControl.current) {
        map.current.removeControl(routingControl.current);
        routingControl.current = null;
      }

      // Create routing control with Leaflet Routing Machine
      const control = (L as any).Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(gym.latitude, gym.longitude),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: "#10b981", weight: 5, opacity: 0.7 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        createMarker: () => null, // Don't create default markers
      }).addTo(map.current);

      // Listen for route calculation
      control.on("routesfound", (e: any) => {
        const routes = e.routes;
        const summary = routes[0].summary;

        // Calculate distance and duration
        const distanceKm = (summary.totalDistance / 1000).toFixed(2);
        const durationMin = Math.round(summary.totalTime / 60);

        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${durationMin} min`,
        });

        setIsLoadingRoute(false);
      });

      control.on("routingerror", (e: any) => {
        console.error("Routing error:", e);
        alert("Could not calculate route. Please try again.");
        setIsLoadingRoute(false);
      });

      routingControl.current = control;
    } catch (error) {
      console.error("Route calculation error:", error);
      alert("Error calculating route. Please try again.");
      setIsLoadingRoute(false);
    }
  };

  const clearRoute = () => {
    if (map.current && routingControl.current) {
      map.current.removeControl(routingControl.current);
      routingControl.current = null;
    }
    setRouteInfo(null);
  };

  const openDirections = (gym: Gym) => {
    if (!gym.latitude || !gym.longitude) return;

    // Use address if available, otherwise use coordinates
    const destination = gym.address
      ? encodeURIComponent(`${gym.address}, ${gym.city}`)
      : `${gym.latitude},${gym.longitude}`;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, "_blank");
  };

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleGymSelect = (gym: Gym) => {
    setSelectedGym(gym);
    clearRoute();

    // Center map on selected gym
    if (map.current && gym.latitude && gym.longitude) {
      map.current.setView([gym.latitude, gym.longitude], 15);

      // Open the marker popup
      const marker = markers.current.find((m) => {
        const latlng = m.getLatLng();
        return latlng.lat === gym.latitude && latlng.lng === gym.longitude;
      });

      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-row items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Map className="w-5 h-5" />
              Gyms Map View
            </CardTitle>
            <CardDescription>
              {gymStats.active} active • {gymStats.inactive} inactive •{" "}
              {gymStats.total} total gyms
            </CardDescription>
          </div>
          <Button
            variant={isExpanded ? "secondary" : "default"}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide Map" : "Show Map"}
          </Button>
        </div>

        {/* Search Bar - Only show when expanded */}
        {isExpanded && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search gyms by name, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={getUserLocation}
              disabled={isGettingLocation}
              className="gap-2 shrink-0"
            >
              {isGettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {userLocation ? "Update Location" : "Get My Location"}
            </Button>
          </div>
        )}

        {/* Search Results Counter */}
        {isExpanded && searchQuery && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Found {activeGyms.length} active gym
              {activeGyms.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {activeGyms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Map className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">
                {searchQuery
                  ? "No gyms found matching your search"
                  : "No active gym locations available"}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Add active gyms with valid coordinates to see them on the map"}
              </p>
            </div>
          ) : (
            <div className="relative">
              <div
                ref={mapContainer}
                className="w-full h-[500px] rounded-lg overflow-hidden z-0"
              />

              {/* Legend */}
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg z-[1000]">
                <p className="text-sm font-medium mb-2">Legend</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Active Gym</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Your Location</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Gym Info */}
              {selectedGym && (
                <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg z-[1000] max-w-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {selectedGym.name}
                        </h3>
                        <Badge variant="default">Active</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
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
                          <div className="flex flex-wrap gap-1 mb-3">
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

                      {/* Route Information */}
                      {routeInfo && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg mb-3">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Route className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                                {routeInfo.distance}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                                {routeInfo.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => calculateRoute(selectedGym)}
                          disabled={isLoadingRoute || !userLocation}
                        >
                          {isLoadingRoute ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <Navigation className="w-4 h-4" />
                              {userLocation
                                ? "Show Directions"
                                : "Set Location First"}
                            </>
                          )}
                        </Button>
                        {routeInfo && (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={clearRoute}
                          >
                            <X className="w-4 h-4" />
                            Clear
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => openDirections(selectedGym)}
                        >
                          <MapPin className="w-4 h-4" />
                          Google Maps
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedGym(null);
                        clearRoute();
                      }}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inactive or gyms without location */}
          {inactiveOrNoLocation.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Inactive or gyms without location ({inactiveOrNoLocation.length}
                )
              </p>
              <div className="flex flex-wrap gap-2">
                {inactiveOrNoLocation.map((gym) => (
                  <Badge
                    key={gym.id}
                    variant={gym.is_active ? "outline" : "secondary"}
                  >
                    {gym.name} - {gym.city}
                    {!gym.is_active && " (Inactive)"}
                    {(!gym.latitude || !gym.longitude) && " (No location)"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access Gym List - shown when search is active */}
          {searchQuery && activeGyms.length > 0 && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">
                Quick Access - Click to view on map
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {activeGyms.map((gym) => (
                  <button
                    key={gym.id}
                    onClick={() => handleGymSelect(gym)}
                    className={`p-3 text-left rounded-lg border transition-all hover:border-primary hover:bg-primary/5 ${
                      selectedGym?.id === gym.id
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="font-medium text-sm">{gym.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {gym.city}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
<style>{`
        /* ============================================
           GYMS MAP VIEW RESPONSIVE STYLES
           ============================================ */

        /* Mobile First - Base Styles (320px+) */
        @media (max-width: 640px) {
          /* Header layout adjustments */
          .flex.flex-row.items-center.justify-between {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem;
          }

          .flex.flex-row.items-center.justify-between > button {
            width: 100%;
          }

          /* Search bar full width */
          .flex.gap-2 {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }

          .flex.gap-2 > .relative.flex-1 {
            width: 100% !important;
          }

          .flex.gap-2 > button {
            width: 100% !important;
          }

          /* Map height adjustment for mobile */
          [class*="h-"][class*="500px"] {
            height: 350px !important;
          }

          /* Legend positioning for mobile */
          .absolute.top-4.left-4 {
            top: 0.5rem !important;
            left: 0.5rem !important;
            padding: 0.5rem !important;
            font-size: 0.75rem !important;
          }

          .absolute.top-4.left-4 p {
            font-size: 0.75rem !important;
            margin-bottom: 0.25rem !important;
          }

          .absolute.top-4.left-4 .space-y-1 {
            gap: 0.25rem !important;
          }

          .absolute.top-4.left-4 .text-sm {
            font-size: 0.7rem !important;
          }

          /* Selected gym info card - mobile */
          .absolute.bottom-4.left-4.right-4 {
            bottom: 0.5rem !important;
            left: 0.5rem !important;
            right: 0.5rem !important;
            padding: 0.75rem !important;
            max-width: 100% !important;
          }

          .absolute.bottom-4.left-4.right-4 h3 {
            font-size: 1rem !important;
          }

          /* Grid in selected gym card */
          .grid.grid-cols-1.md\\:grid-cols-2 {
            grid-template-columns: 1fr !important;
          }

          /* Action buttons in gym card */
          .absolute.bottom-4.left-4.right-4 .flex.gap-2 {
            flex-direction: column !important;
          }

          .absolute.bottom-4.left-4.right-4 .flex.gap-2 button {
            width: 100% !important;
          }

          .absolute.bottom-4.left-4.right-4 .flex.gap-2 button.flex-1 {
            flex: none !important;
          }

          /* Close button positioning */
          .absolute.bottom-4.left-4.right-4 .flex.items-start.justify-between {
            flex-direction: column !important;
            gap: 0.5rem;
          }

          .absolute.bottom-4.left-4.right-4 .flex.items-start.justify-between > button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
          }

          /* Route info styling */
          .p-3.bg-emerald-50 {
            padding: 0.5rem !important;
          }

          .p-3.bg-emerald-50 .flex.items-center.gap-4 {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }

          /* Quick access grid */
          .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
          }

          /* Empty state */
          .p-8.text-center {
            padding: 2rem 1rem !important;
          }

          .p-8.text-center svg {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }

          .p-8.text-center .text-lg {
            font-size: 1rem !important;
          }

          /* Inactive gyms section */
          .mt-4.p-4.bg-muted\\/50 {
            padding: 0.75rem !important;
          }

          .mt-4.p-4.bg-muted\\/30 {
            padding: 0.75rem !important;
          }

          /* Badge wrapping */
          .flex.flex-wrap.gap-1,
          .flex.flex-wrap.gap-2 {
            gap: 0.375rem !important;
          }

          /* Services badges in selected gym */
          .absolute.bottom-4.left-4.right-4 .flex.flex-wrap.gap-1 {
            max-width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          /* Search results badge */
          .mt-2 {
            margin-top: 0.5rem !important;
          }
        }

        /* Small tablets (641px - 768px) */
        @media (min-width: 641px) and (max-width: 768px) {
          /* Map height */
          [class*="h-"][class*="500px"] {
            height: 400px !important;
          }

          /* Selected gym card */
          .absolute.bottom-4.left-4.right-4 {
            max-width: calc(100% - 1rem) !important;
          }

          /* Grid adjustments */
          .grid.grid-cols-1.md\\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          /* Legend */
          .absolute.top-4.left-4 {
            font-size: 0.875rem !important;
          }
        }

        /* Tablets (769px - 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          /* Map height */
          [class*="h-"][class*="500px"] {
            height: 450px !important;
          }

          /* Selected gym card */
          .absolute.bottom-4.left-4.right-4 {
            max-width: 90% !important;
          }

          /* Grid for quick access */
          .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Landscape mobile devices */
        @media (max-height: 500px) and (orientation: landscape) {
          /* Reduce map height in landscape */
          [class*="h-"][class*="500px"] {
            height: 250px !important;
          }

          /* Reduce selected gym card height */
          .absolute.bottom-4.left-4.right-4 {
            bottom: 0.25rem !important;
            padding: 0.5rem !important;
          }

          .absolute.bottom-4.left-4.right-4 h3 {
            font-size: 0.875rem !important;
          }

          .absolute.bottom-4.left-4.right-4 .text-sm {
            font-size: 0.75rem !important;
          }

          /* Hide legend in landscape */
          .absolute.top-4.left-4 {
            display: none !important;
          }

          /* Compact route info */
          .p-3.bg-emerald-50 .flex.items-center.gap-4 {
            gap: 1rem !important;
          }
        }

        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
          /* Minimum touch target sizes */
          button:not([class*="icon"]) {
            min-height: 44px !important;
          }

          button[class*="size-icon"] {
            min-width: 44px !important;
            min-height: 44px !important;
          }

          /* Easier tap targets for gym quick access */
          .grid button {
            padding: 0.75rem !important;
            min-height: 48px !important;
          }

          /* Increase tap area for close buttons */
          .absolute.bottom-4.left-4.right-4 > .flex > button {
            min-width: 44px !important;
            min-height: 44px !important;
          }
        }

        /* Leaflet map responsive fixes */
        .leaflet-container {
          font-family: inherit;
          touch-action: pan-x pan-y;
          z-index: 0 !important;
        }

        @media (max-width: 640px) {
          /* Adjust Leaflet controls for mobile */
          .leaflet-control-zoom {
            margin-right: 5px !important;
            margin-top: 5px !important;
          }

          .leaflet-control-zoom a {
            width: 28px !important;
            height: 28px !important;
            line-height: 28px !important;
            font-size: 16px !important;
          }

          /* Popup adjustments */
          .leaflet-popup-content-wrapper {
            max-width: 250px !important;
            padding: 8px !important;
          }

          .leaflet-popup-content {
            margin: 8px !important;
          }

          /* Routing machine controls */
          .leaflet-routing-container {
            display: none !important;
          }

          /* Custom marker sizing */
          .custom-gym-marker svg,
          .user-location-marker svg {
            width: 32px !important;
            height: 32px !important;
          }
        }

        /* Z-index management for overlays */
        .z-\\[1000\\] {
          z-index: 1000 !important;
        }

        .z-0 {
          z-index: 0 !important;
        }

        /* Ensure info card is above map */
        .absolute.bottom-4.left-4.right-4 {
          z-index: 1001 !important;
        }

        /* Legend above map but below info card */
        .absolute.top-4.left-4 {
          z-index: 1000 !important;
        }

        /* Scrolling improvements */
        .overflow-hidden {
          -webkit-overflow-scrolling: touch;
        }

        /* Badge responsiveness */
        @media (max-width: 640px) {
          .text-xs {
            font-size: 0.65rem !important;
            padding: 0.125rem 0.375rem !important;
          }
        }

        /* Card description stats */
        @media (max-width: 640px) {
          .flex.items-center.gap-2.mb-2 {
            flex-wrap: wrap;
          }

          .flex.items-center.gap-2.mb-2 > .font-semibold {
            width: 100%;
            margin-bottom: 0.25rem;
          }
        }

        /* Improve scrolling performance */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
        }

        /* Loading state improvements */
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Dark mode adjustments for map overlays */
        @media (prefers-color-scheme: dark) {
          .leaflet-container {
            background: #1a1a1a;
          }

          .leaflet-popup-content-wrapper {
            background: #262626 !important;
            color: #e5e5e5 !important;
          }

          .leaflet-popup-tip {
            background: #262626 !important;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .animate-spin {
            animation: none !important;
          }
        }

        /* Safe area for notched devices */
        @supports (padding: max(0px)) {
          .absolute.bottom-4.left-4.right-4 {
            padding-left: max(1rem, env(safe-area-inset-left)) !important;
            padding-right: max(1rem, env(safe-area-inset-right)) !important;
            padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
          }

          .absolute.top-4.left-4 {
            padding-top: max(0.75rem, env(safe-area-inset-top)) !important;
          }
        }

        /* Prevent text selection on interactive elements */
        .custom-gym-marker,
        .user-location-marker {
          user-select: none;
          -webkit-user-select: none;
        }

        /* Smooth transitions for state changes */
        button,
        .border {
          transition: all 0.2s ease-in-out;
        }

        /* Focus styles for accessibility */
        button:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>;
