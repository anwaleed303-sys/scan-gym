import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../Integrations/client";
import {
  Plus,
  Trash2,
  Building2,
  User,
  Loader2,
  MapPin,
  Clock,
  Copy,
  Check,
  Mail,
  Phone,
} from "lucide-react";

interface Gym {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  services?: string[] | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean | null;
}

interface GymPartner {
  id: string;
  user_id: string;
  gym_id: string;
  created_at: string;
  gym: Gym | null;
  profile: {
    full_name: string | null;
  } | null;
  email?: string | null;
}

interface PartnerManagementProps {
  partners: GymPartner[];
  gyms: Gym[];
  onRefresh: () => Promise<void>;
}

interface CreatedCredentials {
  email: string;
  password: string;
  gymName: string;
  partnerName: string;
}

export const PartnerManagement = ({
  partners,
  gyms,
  onRefresh,
}: PartnerManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] =
    useState<CreatedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedGymId, setSelectedGymId] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
  };
  // Add this at the top of your component, inside the PartnerManagement function
  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (session?.user) {
        console.log("Current user ID:", session.user.id);
        console.log("User email:", session.user.email);

        // Check roles
        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id);

        console.log("User roles:", roles);
        console.log("Roles error:", error);
      } else {
        console.log("No user session found");
      }
    };

    checkAuthStatus();
  }, []);
  const copyAllCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Partner Login Credentials for ${createdCredentials.gymName}

Name: ${createdCredentials.partnerName}
Email: ${createdCredentials.email}
Password: ${createdCredentials.password}

Login URL: ${window.location.origin}/partner-login`;
    await navigator.clipboard.writeText(text);
    toast({
      title: "All credentials copied!",
      description: "You can now send these to the gym partner",
    });
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGymId) {
      toast({
        title: "Error",
        description: "Please select a gym.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setCreating(true);
    const selectedGym = gyms.find((g) => g.id === selectedGymId);

    try {
      // Check authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Session check:", { session, sessionError });

      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        throw new Error(
          "You are not authenticated. Please log out and log back in."
        );
      }

      console.log("Session valid, calling edge function...");
      console.log("Calling edge function with:", {
        email,
        fullName,
        gymId: selectedGymId,
      });

      const response = await supabase.functions.invoke("create-partner", {
        body: {
          email,
          password,
          fullName,
          gymId: selectedGymId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log("Full response:", response);

      if (response.error) {
        let errorMessage = response.error.message;

        if (response.error.context) {
          try {
            const clone = response.error.context.clone();
            const text = await clone.text();
            console.log("Error response text:", text);

            if (text) {
              const errorData = JSON.parse(text);
              console.log("Parsed error:", errorData);
              errorMessage = errorData.error || errorMessage;
            }
          } catch (e) {
            console.log("Could not parse error response");
          }
        }

        throw new Error(errorMessage);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data?.success) {
        throw new Error("Unexpected response from server");
      }

      setCreatedCredentials({
        email,
        password,
        gymName: selectedGym?.name || "Unknown Gym",
        partnerName: fullName,
      });

      setIsDialogOpen(false);
      setIsCredentialsDialogOpen(true);

      setEmail("");
      setPassword("");
      setFullName("");
      setSelectedGymId("");
      await onRefresh();

      toast({
        title: "Partner Created",
        description:
          "Don't forget to share the login credentials with the partner!",
      });
    } catch (error: any) {
      console.error("Create partner error:", error);
      toast({
        title: "Error creating partner",
        description:
          error.message ||
          "Failed to create partner. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePartner = async () => {
    if (!deleteDialog.id) return;

    try {
      await supabase.from("gym_partners").delete().eq("id", deleteDialog.id);

      await supabase.from("user_roles").delete().eq("user_id", deleteDialog.id);

      toast({
        title: "Partner Removed",
        description: "The partner has been removed successfully.",
      });

      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Error removing partner",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    return time.substring(0, 5);
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display">Gym Partners</CardTitle>
            <CardDescription>
              Manage partner accounts and gym assignments
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Create New Partner
                </DialogTitle>
                <DialogDescription>
                  Create a partner account and assign it to a gym. Save the
                  credentials to send to the partner.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePartner} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerEmail">Email</Label>
                  <Input
                    id="partnerEmail"
                    type="email"
                    placeholder="partner@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerPassword">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="partnerPassword"
                      type="text"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-input border-border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePassword}
                      className="shrink-0"
                    >
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password will be shown after creation for you to share
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gym">Assign to Gym</Label>
                  <Select
                    value={selectedGymId}
                    onValueChange={setSelectedGymId}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select a gym" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {gyms
                        .filter((g) => g.is_active !== false)
                        .map((gym) => (
                          <SelectItem key={gym.id} value={gym.id}>
                            <div className="flex flex-col">
                              <span>{gym.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {gym.city}
                                {gym.address ? ` • ${gym.address}` : ""}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGymId && (
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-sm font-medium mb-2">
                      Selected Gym Details:
                    </p>
                    {(() => {
                      const gym = gyms.find((g) => g.id === selectedGymId);
                      if (!gym) return null;
                      return (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {gym.city}
                              {gym.address ? `, ${gym.address}` : ""}
                            </span>
                          </div>
                          {(gym.opening_time || gym.closing_time) && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatTime(gym.opening_time || null)} -{" "}
                                {formatTime(gym.closing_time || null)}
                              </span>
                            </div>
                          )}
                          {gym.services && gym.services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {gym.services.slice(0, 3).map((service, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {service}
                                </Badge>
                              ))}
                              {gym.services.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{gym.services.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Partner Account"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No partners yet. Add your first partner above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">
                            {partner.profile?.full_name || "Unknown User"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            <span className="font-medium text-foreground">
                              {partner.gym?.name || "Unassigned"}
                            </span>
                          </div>
                        </div>

                        {partner.gym && (
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {partner.gym.city}
                                {partner.gym.address
                                  ? `, ${partner.gym.address}`
                                  : ""}
                              </span>
                            </div>
                            {(partner.gym.opening_time ||
                              partner.gym.closing_time) && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatTime(partner.gym.opening_time || null)}{" "}
                                  -{" "}
                                  {formatTime(partner.gym.closing_time || null)}
                                </span>
                              </div>
                            )}
                            {partner.gym.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                <span>{partner.gym.phone}</span>
                              </div>
                            )}
                            {partner.gym.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span>{partner.gym.email}</span>
                              </div>
                            )}
                            {partner.gym.services &&
                              partner.gym.services.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {partner.gym.services
                                    .slice(0, 4)
                                    .map((service, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {service}
                                      </Badge>
                                    ))}
                                  {partner.gym.services.length > 4 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{partner.gym.services.length - 4}
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </div>
                        )}

                        {partner.gym?.is_active === false && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive Gym
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setDeleteDialog({ open: true, id: partner.id })
                      }
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials Dialog */}
      <Dialog
        open={isCredentialsDialogOpen}
        onOpenChange={setIsCredentialsDialogOpen}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">
              Partner Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Copy and send these credentials to the gym partner. They will need
              this to log in.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-secondary/50 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Partner Name
                    </p>
                    <p className="font-medium">
                      {createdCredentials.partnerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Gym</p>
                    <p className="font-medium">{createdCredentials.gymName}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-mono text-sm">
                        {createdCredentials.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(createdCredentials.email, "Email")
                      }
                    >
                      {copiedField === "Email" ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Password</p>
                    <p className="font-mono text-sm">
                      {createdCredentials.password}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(createdCredentials.password, "Password")
                    }
                  >
                    {copiedField === "Password" ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Login URL</p>
                    <p className="font-mono text-sm break-all">
                      {window.location.origin}/partner-login
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/partner-login`,
                        "Login URL"
                      )
                    }
                  >
                    {copiedField === "Login URL" ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button onClick={copyAllCredentials} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy All Credentials
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Make sure to save these credentials - the password cannot be
                retrieved later!
              </p>
            </div>
          )}
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
            Are you sure you want to delete this partner? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setDeleting(deleteDialog.id);
                await handleDeletePartner();
                setDeleteDialog({ open: false, id: null });
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
