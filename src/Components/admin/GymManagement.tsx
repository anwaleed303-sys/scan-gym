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
  MoreVertical,
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
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

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
  gym_type: "pro" | "standard" | null;
  image_url: string | null;
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

  const { toast } = useToast();

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [imageDialog, setImageDialog] = useState<{
    open: boolean;
    gym: Gym | null;
  }>({
    open: false,
    gym: null,
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const provider = useRef(new OpenStreetMapProvider());
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
    latitude: 31.5204, // Center of Pakistan (Lahore)
    longitude: 74.3587,
    opening_time: "06:00",
    closing_time: "22:00",
    services: [] as string[],
    phone: "",
    email: "",
    description: "",
    is_active: true,
    gym_type: "standard" as "pro" | "standard",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  useEffect(() => {
    if (isDialogOpen && mapContainer.current && !map.current) {
      setTimeout(() => {
        // initializeMap();
      }, 100);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
        userMarker.current = null;
      }
    };
  }, [isDialogOpen]);
  useEffect(() => {
    if (map.current && marker.current && editingGym && isDialogOpen) {
      // Update marker position when editing gym
      marker.current.setLatLng([formData.latitude, formData.longitude]);
      map.current.setView([formData.latitude, formData.longitude], 15);
    }
  }, [editingGym, isDialogOpen, formData.latitude, formData.longitude]);

  const searchLocation = async () => {
    if (!formData.address.trim()) {
      toast({
        title: "Missing address",
        description: "Please enter the exact Google Maps address or Plus Code",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSearchingLocation(true);
    try {
      // Construct full search query with address and city
      const searchQuery = formData.address.includes(formData.city)
        ? formData.address
        : `${formData.address}, ${formData.city}, Pakistan`;

      console.log("Searching for:", searchQuery);

      const results = await provider.current.search({ query: searchQuery });

      if (results.length > 0) {
        const { y: lat, x: lng, label } = results[0];

        console.log("Found location:", { lat, lng, label });

        // Validate coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error("Invalid coordinates received");
        }

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        if (map.current && marker.current) {
          marker.current.setLatLng([lat, lng]);
          map.current.setView([lat, lng], 17);

          marker.current.setPopupContent(
            `<strong>${formData.name || "Gym Location"}</strong><br/>${
              formData.address
            }<br/><small>${lat.toFixed(6)}, ${lng.toFixed(6)}</small>`
          );
          marker.current.openPopup();
        }

        toast({
          title: "Location found!",
          description: `${label || searchQuery}`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Location not found",
          description:
            "Please verify the address is correct. Try using Google Maps Plus Code (e.g., F47G+XR6)",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "Could not search location",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSearchingLocation(false);
    }
  };
  // const initializeMap = () => {
  //   if (!mapContainer.current || map.current) return;

  //   map.current = L.map(mapContainer.current).setView(
  //     [formData.latitude, formData.longitude],
  //     editingGym ? 15 : 6
  //   );
  // };
  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      address: "",
      latitude: 31.5204,
      longitude: 74.3587,
      opening_time: "06:00",
      closing_time: "22:00",
      services: [],
      phone: "",
      email: "",
      description: "",
      is_active: true,
      gym_type: "standard",
      image_url: "",
    });
    setEditingGym(null);
    setImageFile(null);
    setImagePreview("");
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
      latitude: gym.latitude || 31.5204,
      longitude: gym.longitude || 74.3587,
      opening_time: gym.opening_time?.slice(0, 5) || "06:00",
      closing_time: gym.closing_time?.slice(0, 5) || "22:00",
      services: gym.services || [],
      phone: gym.phone || "",
      email: gym.email || "",
      description: gym.description || "",
      is_active: gym.is_active ?? true,
      gym_type: gym.gym_type || "standard",
      image_url: gym.image_url || "",
    });
    setImagePreview(gym.image_url || "");
    setImageFile(null);
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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `gym-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gyms")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("gyms").getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Image upload failed",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }
  };

  const generateQRCode = () => {
    return `GYM-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
  };

  const handleSubmit = async () => {
    if (!formData.address.trim()) {
      toast({
        title: "Missing address",
        description: "Please enter the exact Google Maps address or Plus Code",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    // Check if coordinates are valid
    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Missing location",
        description:
          "Please click 'Find Exact Location on Map' to set coordinates",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
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
        gym_type: formData.gym_type,
        image_url: imageUrl || null,
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
                {" "}
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gyms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No gyms added yet. Click "Add Gym" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                gyms.map((gym) => (
                  <TableRow key={gym.id}>
                    <TableCell>
                      <div
                        className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setImageDialog({ open: true, gym })}
                      >
                        {gym.image_url ? (
                          <img
                            src={gym.image_url}
                            alt={gym.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Dumbbell className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
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
                    <TableCell>
                      <Badge
                        variant={
                          gym.gym_type === "pro" ? "default" : "secondary"
                        }
                      >
                        {gym.gym_type === "pro" ? "Pro" : "Standard"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[100px]"
                        >
                          <div
                            className="flex items-center justify-around p-2 gap-2"
                            style={
                              {
                                // backgroundColor: " hsl(25",
                              }
                            }
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(gym)}
                              className="h-8 w-8"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteDialog({ open: true, id: gym.id })
                              }
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

          <div className="grid grid-cols-1 ">
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
                <Label htmlFor="address">
                  Google Plus Code / Full Address *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="e.g., F47G+XR6, Bhai Wala, Faisalabad"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the exact Google Maps Plus Code or registered address
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gym_type">Gym Type *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={
                      formData.gym_type === "standard" ? "default" : "outline"
                    }
                    className="justify-center gap-2"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, gym_type: "standard" }))
                    }
                  >
                    <Dumbbell className="w-4 h-4" />
                    Standard
                  </Button>
                  <Button
                    type="button"
                    variant={
                      formData.gym_type === "pro" ? "default" : "outline"
                    }
                    className="justify-center gap-2"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, gym_type: "pro" }))
                    }
                  >
                    <Dumbbell className="w-4 h-4" />
                    Pro
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Gym Image</Label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Gym preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, image_url: "" }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload an image (max 5MB). Supported: JPG, PNG, WebP
                  </p>
                </div>
              </div>
              {/* <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={searchLocation}
                  disabled={isSearchingLocation || !formData.address}
                >
                  <MapPin className="w-4 h-4" />
                  {isSearchingLocation
                    ? "Searching Google Maps..."
                    : "Find Exact Location on Map"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Click to locate the exact Google-registered address on map
                </p>
              </div> */}

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
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading
                    ? "Saving..."
                    : editingGym
                    ? "Update Gym"
                    : "Add Gym"}
                </Button>
              </div>
            </div>

            {/* Map Section */}
            {/* <div className="space-y-4">
              <div className="space-y-2">
                <Label>Location on Map</Label>
                <p className="text-sm text-muted-foreground">
                  Click on the map or drag the marker to set location
                </p>
              </div>

              <div
                ref={mapContainer}
                className="w-full h-[400px] rounded-lg border overflow-hidden z-0"
              />

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
            </div> */}
          </div>
        </DialogContent>

        {/* Image Preview Dialog */}
        <Dialog
          open={imageDialog.open}
          onOpenChange={(open) => setImageDialog({ open, gym: null })}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{imageDialog.gym?.name}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{imageDialog.gym?.city}</span>
                    {imageDialog.gym?.address && (
                      <span className="text-muted-foreground">
                        - {imageDialog.gym.address}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(imageDialog.gym?.opening_time || null)} -{" "}
                      {formatTime(imageDialog.gym?.closing_time || null)}
                    </span>
                  </div>
                  {imageDialog.gym?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{imageDialog.gym.phone}</span>
                    </div>
                  )}
                  {imageDialog.gym?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{imageDialog.gym.email}</span>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {imageDialog.gym?.image_url ? (
                <img
                  src={imageDialog.gym.image_url}
                  alt={imageDialog.gym.name}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {imageDialog.gym?.description && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {imageDialog.gym.description}
                </p>
              )}
              {imageDialog.gym?.services &&
                imageDialog.gym.services.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Services:</p>
                    <div className="flex gap-2 flex-wrap">
                      {imageDialog.gym.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {AVAILABLE_SERVICES.find((s) => s.id === service)
                            ?.label || service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
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
<style>{`
        /* ============================================
           GYM MANAGEMENT RESPONSIVE STYLES
           ============================================ */

        /* Mobile First - Base Styles (320px+) */
        @media (max-width: 640px) {
          /* Dialog adjustments */
          [class*="max-w-4xl"] {
            max-width: 100% !important;
            margin: 0 0.5rem !important;
          }

          [class*="max-h-"][class*="90vh"] {
            max-height: 100vh !important;
          }

          /* Grid layouts to single column on mobile */
          .grid.grid-cols-2 {
            grid-template-columns: 1fr !important;
          }

          .grid.lg\\:grid-cols-2 {
            grid-template-columns: 1fr !important;
          }

          /* Table responsiveness - card layout */
          .rounded-md.border table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .rounded-md.border thead {
            display: none;
          }

          .rounded-md.border tbody {
            display: block;
          }

          .rounded-md.border tr {
            display: block;
            margin-bottom: 1rem;
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            padding: 0.75rem;
            background: hsl(var(--card));
          }

          .rounded-md.border td {
            display: block;
            text-align: left !important;
            padding: 0.5rem 0 !important;
            border: none !important;
            position: relative;
            padding-left: 45% !important;
            min-height: 2rem;
          }

          .rounded-md.border td::before {
            content: attr(data-label);
            position: absolute;
            left: 0;
            width: 40%;
            padding-right: 10px;
            white-space: nowrap;
            font-weight: 600;
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
          }

          /* Labels for mobile table */
         /* Labels for mobile table */
.rounded-md.border tbody tr td:nth-child(1)::before {
  content: "Image";
}

.rounded-md.border tbody tr td:nth-child(2)::before {
  content: "Name";
}

.rounded-md.border tbody tr td:nth-child(3)::before {
  content: "Location";
}

.rounded-md.border tbody tr td:nth-child(4)::before {
  content: "Hours";
}

.rounded-md.border tbody tr td:nth-child(5)::before {
  content: "Services";
}

.rounded-md.border tbody tr td:nth-child(6)::before {
  content: "Status";
}

.rounded-md.border tbody tr td:nth-child(7)::before {
  content: "Type";
}

.rounded-md.border tbody tr td:nth-child(8)::before {
  content: "";
}
         .rounded-md.border tbody tr td:nth-child(6)::before {
  content: "Type";
}

.rounded-md.border tbody tr td:nth-child(7)::before {
  content: "";
}

          .rounded-md.border td:last-child {
            padding-left: 0 !important;
            text-align: right !important;
          }

          /* Map container */
          [class*="h-"][class*="400px"] {
            height: 250px !important;
          }

          /* Card header stacking */
          .flex.flex-row.items-center.justify-between {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem;
          }

          .flex.flex-row.items-center.justify-between > button {
            width: 100%;
          }

          /* Service buttons grid */
          .space-y-2 .grid.grid-cols-2 button {
            font-size: 0.8rem;
            padding: 0.5rem 0.25rem;
          }

          /* Dialog buttons */
          .flex.justify-end.gap-3 {
            flex-direction: column-reverse !important;
          }

          .flex.justify-end.gap-3 button {
            width: 100%;
          }

          /* Input adjustments */
          input[type="time"] {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }

          /* Truncate long text */
          .truncate.max-w-\\[150px\\] {
            max-width: 100px !important;
          }

          /* Badge container */
          .flex.gap-1.flex-wrap {
            max-width: 100% !important;
          }

          /* Action buttons container */
          .flex.justify-end.gap-2 {
            justify-content: flex-start !important;
            gap: 0.5rem !important;
          }
        }

        /* Small tablets (641px - 768px) */
        @media (min-width: 641px) and (max-width: 768px) {
          [class*="max-w-4xl"] {
            max-width: 95% !important;
          }

          .grid.lg\\:grid-cols-2 {
            grid-template-columns: 1fr !important;
          }

          [class*="h-"][class*="400px"] {
            height: 300px !important;
          }

          table {
            font-size: 0.875rem;
          }

          td, th {
            padding: 0.5rem !important;
          }

          .truncate.max-w-\\[150px\\] {
            max-width: 120px !important;
          }
        }

        /* Tablets (769px - 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          [class*="max-w-4xl"] {
            max-width: 90% !important;
          }

          [class*="h-"][class*="400px"] {
            height: 350px !important;
          }

          table {
            font-size: 0.9rem;
          }
        }

        /* Landscape mobile devices */
        @media (max-height: 500px) and (orientation: landscape) {
          [class*="max-h-"][class*="90vh"] {
            max-height: 95vh !important;
          }

          [class*="overflow-y-auto"] {
            overflow-y: scroll !important;
          }

          [class*="h-"][class*="400px"] {
            height: 200px !important;
          }

          .space-y-4 {
            gap: 0.5rem !important;
          }
        }

        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
          button:not([class*="icon"]),
          input:not([type="time"]),
          textarea {
            min-height: 44px !important; /* Touch target size */
          }

          button[class*="size-icon"] {
            min-width: 44px !important;
            min-height: 44px !important;
          }
        }

        /* Leaflet map responsive fixes */
        .leaflet-container {
          font-family: inherit;
          touch-action: pan-x pan-y;
        }

        @media (max-width: 640px) {
          .leaflet-container {
            height: 100% !important;
          }

          .leaflet-control-zoom {
            margin-right: 5px !important;
            margin-top: 5px !important;
          }

          .leaflet-popup-content-wrapper {
            max-width: 200px;
          }
        }

        /* Prevent horizontal scroll */
        body {
          overflow-x: hidden;
        }

        /* Improve scrolling on iOS */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
        }

        /* Safe area for notched devices */
        @supports (padding: max(0px)) {
          [class*="DialogContent"],
          [class*="Card"] {
            padding-left: max(1rem, env(safe-area-inset-left)) !important;
            padding-right: max(1rem, env(safe-area-inset-right)) !important;
          }
        }

        /* Fix for time input calendar icon visibility in dark mode */
        @media (prefers-color-scheme: dark) {
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>;
