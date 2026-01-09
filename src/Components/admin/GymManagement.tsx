import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/texarea";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../Integrations/client";
import {
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  Save,
  Dumbbell,
  Users,
  Bike,
  Heart,
  Waves,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Switch } from "../ui/switch";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Gym {
  id: string;
  name: string;
  city: string;
  address: string | null;
  qr_code: string;
  latitude: number | null;
  longitude: number | null;
  opening_time: string | null;
  closing_time: string | null;
  services: string[] | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
}

const AVAILABLE_SERVICES = [
  { id: "weights", label: "Weight Training", icon: Dumbbell },
  { id: "cardio", label: "Cardio", icon: Bike },
  { id: "yoga", label: "Yoga", icon: Heart },
  { id: "swimming", label: "Swimming", icon: Waves },
  { id: "personal_training", label: "Personal Training", icon: Users },
  { id: "group_classes", label: "Group Classes", icon: Users },
  { id: "crossfit", label: "CrossFit", icon: Dumbbell },
  { id: "martial_arts", label: "Martial Arts", icon: Heart },
];

interface GymManagementProps {
  gyms: Gym[];
  onRefresh: () => void;
}

export const GymManagement = ({ gyms, onRefresh }: GymManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const { toast } = useToast();

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    latitude: 24.8607,
    longitude: 67.0011,
    opening_time: "06:00",
    closing_time: "22:00",
    services: [] as string[],
    phone: "",
    email: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (isDialogOpen && mapboxToken && mapContainer.current) {
      initializeMap();
    }
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isDialogOpen, mapboxToken]);

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
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [formData.longitude, formData.latitude],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker
    marker.current = new mapboxgl.Marker({ draggable: true, color: "#10b981" })
      .setLngLat([formData.longitude, formData.latitude])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    marker.current.on("dragend", () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        setFormData((prev) => ({
          ...prev,
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        }));
      }
    });

    // Update marker when clicking on map
    map.current.on("click", (e) => {
      marker.current?.setLngLat(e.lngLat);
      setFormData((prev) => ({
        ...prev,
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
      }));
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      address: "",
      latitude: 24.8607,
      longitude: 67.0011,
      opening_time: "06:00",
      closing_time: "22:00",
      services: [],
      phone: "",
      email: "",
      description: "",
      is_active: true,
    });
    setEditingGym(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (gym: Gym) => {
    setEditingGym(gym);
    setFormData({
      name: gym.name,
      city: gym.city,
      address: gym.address || "",
      latitude: gym.latitude || 24.8607,
      longitude: gym.longitude || 67.0011,
      opening_time: gym.opening_time?.slice(0, 5) || "06:00",
      closing_time: gym.closing_time?.slice(0, 5) || "22:00",
      services: gym.services || [],
      phone: gym.phone || "",
      email: gym.email || "",
      description: gym.description || "",
      is_active: gym.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const generateQRCode = () => {
    return `GYM-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.city) {
      toast({
        title: "Missing fields",
        description: "Please fill in at least the name and city.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const gymData = {
        name: formData.name,
        city: formData.city,
        address: formData.address || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        opening_time: formData.opening_time + ":00",
        closing_time: formData.closing_time + ":00",
        services: formData.services,
        phone: formData.phone || null,
        email: formData.email || null,
        description: formData.description || null,
        is_active: formData.is_active,
      };

      if (editingGym) {
        const { error } = await supabase
          .from("gyms")
          .update(gymData)
          .eq("id", editingGym.id);

        if (error) throw error;
        toast({ title: "Gym updated successfully" });
      } else {
        const { error } = await supabase.from("gyms").insert({
          ...gymData,
          qr_code: generateQRCode(),
        });

        if (error) throw error;
        toast({ title: "Gym added successfully", duration: 3000 });
      }

      setIsDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const { error } = await supabase
        .from("gyms")
        .delete()
        .eq("id", deleteDialog.id);
      if (error) throw error;
      toast({ title: "Gym deleted successfully", duration: 3000 });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error deleting gym",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Gym Management</CardTitle>
          <CardDescription>Add, edit, and manage gym locations</CardDescription>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Gym
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gyms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No gyms added yet. Click "Add Gym" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                gyms.map((gym) => (
                  <TableRow key={gym.id}>
                    <TableCell className="font-medium">{gym.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {gym.city}
                        {gym.address && (
                          <span className="text-muted-foreground ml-1 truncate max-w-[150px]">
                            - {gym.address}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {formatTime(gym.opening_time)} -{" "}
                        {formatTime(gym.closing_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {(gym.services || []).slice(0, 2).map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="text-xs"
                          >
                            {AVAILABLE_SERVICES.find((s) => s.id === service)
                              ?.label || service}
                          </Badge>
                        ))}
                        {(gym.services?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(gym.services?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={gym.is_active ? "default" : "secondary"}>
                        {gym.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(gym)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: gym.id })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGym ? "Edit Gym" : "Add New Gym"}</DialogTitle>
            <DialogDescription>
              {editingGym
                ? "Update gym details and location"
                : "Fill in the details and select location on the map"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Gym Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter gym name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening_time">Opening Time</Label>
                  <Input
                    id="opening_time"
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        opening_time: e.target.value,
                      }))
                    }
                    className="pr-15 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing_time">Closing Time</Label>
                  <Input
                    id="closing_time"
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        closing_time: e.target.value,
                      }))
                    }
                    className="pr-15 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Phone number"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Email address"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the gym"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Services</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SERVICES.map((service) => {
                    const Icon = service.icon;
                    const isSelected = formData.services.includes(service.id);
                    return (
                      <Button
                        key={service.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className="justify-start gap-2"
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <Icon className="w-4 h-4" />
                        {service.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Gym is visible and operational
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                  className="data-[state=checked]:bg-orange-500 [&>span]:data-[state=checked]:bg-white"
                />
              </div>
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Location on Map</Label>
                <p className="text-sm text-muted-foreground">
                  Click on the map or drag the marker to set location
                </p>
              </div>

              {mapboxToken ? (
                <div
                  ref={mapContainer}
                  className="w-full h-[400px] rounded-lg border overflow-hidden"
                />
              ) : (
                <div className="w-full h-[400px] rounded-lg border flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    value={formData.latitude.toFixed(6)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    value={formData.longitude.toFixed(6)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : editingGym ? "Update Gym" : "Add Gym"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this gym? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
