import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Dumbbell,
  Users,
  Wifi,
  Car,
  Navigation,
  Loader2,
} from "lucide-react";
import { useGeolocation } from "../hooks/useGeolocation";
import { toast } from "sonner";

const gyms = [
  {
    id: 1,
    name: "Iron Fitness",
    city: "Lahore",
    area: "Gulberg",
    rating: 4.8,
    reviews: 245,
    timing: "6 AM - 11 PM",
    facilities: ["Cardio", "Weights", "CrossFit", "Parking"],
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    verified: true,
  },
  {
    id: 2,
    name: "Power Zone Gym",
    city: "Karachi",
    area: "DHA",
    rating: 4.6,
    reviews: 189,
    timing: "5 AM - 10 PM",
    facilities: ["Cardio", "Weights", "Swimming", "Wifi"],
    image:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
    verified: true,
  },
  {
    id: 3,
    name: "FitHub",
    city: "Islamabad",
    area: "F-7",
    rating: 4.9,
    reviews: 312,
    timing: "6 AM - 12 AM",
    facilities: ["Cardio", "Weights", "Yoga", "Sauna"],
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop",
    verified: true,
  },
  {
    id: 4,
    name: "Muscle Factory",
    city: "Lahore",
    area: "Johar Town",
    rating: 4.5,
    reviews: 156,
    timing: "6 AM - 11 PM",
    facilities: ["Cardio", "Weights", "Parking"],
    image:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&h=300&fit=crop",
    verified: true,
  },
  {
    id: 5,
    name: "Elite Fitness Club",
    city: "Faisalabad",
    area: "D Ground",
    rating: 4.7,
    reviews: 98,
    timing: "5 AM - 11 PM",
    facilities: ["Cardio", "Weights", "CrossFit", "Wifi"],
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    verified: true,
  },
  {
    id: 6,
    name: "Gym Nation",
    city: "Rawalpindi",
    area: "Saddar",
    rating: 4.4,
    reviews: 134,
    timing: "6 AM - 10 PM",
    facilities: ["Cardio", "Weights", "Boxing"],
    image:
      "https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=400&h=300&fit=crop",
    verified: true,
  },
];

const cities = [
  "All Cities",
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Rawalpindi",
  "Multan",
];

const facilityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Cardio: Dumbbell,
  Weights: Dumbbell,
  CrossFit: Users,
  Wifi: Wifi,
  Parking: Car,
};

const FindGyms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [locationRequested, setLocationRequested] = useState(false);
  const {
    loading: locationLoading,
    error: locationError,
    coordinates,
    requestLocation,
  } = useGeolocation();

  const handleUseLocation = () => {
    requestLocation();
    setLocationRequested(true);
    toast.info("Requesting your location...");
  };

  // Show location status
  if (coordinates && !locationError && locationRequested) {
    toast.success("Location found! Showing nearby gyms.", {
      id: "location-success",
    });
  }
  if (locationError && locationRequested) {
    toast.error(locationError, { id: "location-error" });
  }

  const filteredGyms = gyms.filter((gym) => {
    const matchesSearch =
      gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity =
      selectedCity === "All Cities" || gym.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  // Only show gyms if user has provided location
  const showGyms = coordinates !== null;

  return (
    <>
      <Helmet>
        <title>Find Gyms Near You - ScanGym Pakistan</title>
        <meta
          name="description"
          content="Discover 500+ partner gyms across Pakistan. Search by city, area, or gym name. Access any gym with your ScanGym subscription."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-20">
          {/* Hero */}
          <section className="py-12 md:py-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-10">
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Find <span className="text-gradient">Partner Gyms</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Discover gyms near you and access them instantly with your
                  ScanGym subscription.
                </p>
              </div>

              {/* Search & Filters */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Search gyms or areas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-card border-border"
                      />
                    </div>
                    <Button
                      onClick={handleUseLocation}
                      disabled={locationLoading}
                      variant={coordinates ? "default" : "outline"}
                      className="h-12 gap-2 min-w-[160px]"
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Locating...
                        </>
                      ) : coordinates ? (
                        <>
                          <Navigation className="w-4 h-4" />
                          Location Active
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          Use My Location
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Location Status */}
                  {coordinates && (
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                      <MapPin className="w-4 h-4" />
                      <span>Showing gyms near your location</span>
                    </div>
                  )}

                  <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 justify-center">
                    {cities.slice(0, 5).map((city) => (
                      <Button
                        key={city}
                        variant={selectedCity === city ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCity(city)}
                        className="whitespace-nowrap"
                      >
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gym Grid */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              {!showGyms ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Navigation className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Enable Location to Find Gyms
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Share your location to discover partner gyms near you.
                  </p>
                  <Button
                    onClick={handleUseLocation}
                    disabled={locationLoading}
                    className="gap-2"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        Use My Location
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-muted-foreground">
                      Showing{" "}
                      <span className="text-foreground font-semibold">
                        {filteredGyms.length}
                      </span>{" "}
                      gyms near you
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGyms.map((gym) => (
                      <div
                        key={gym.id}
                        className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-card"
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={gym.image}
                            alt={gym.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {gym.verified && (
                            <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                                {gym.name}
                              </h3>
                              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {gym.area}, {gym.city}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-primary fill-primary" />
                              <span className="font-semibold text-foreground">
                                {gym.rating}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                ({gym.reviews})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                            <Clock className="w-4 h-4" />
                            <span>{gym.timing}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {gym.facilities.slice(0, 4).map((facility) => (
                              <span
                                key={facility}
                                className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md"
                              >
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredGyms.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        No gyms found matching your search.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FindGyms;
