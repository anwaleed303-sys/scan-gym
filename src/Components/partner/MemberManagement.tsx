import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/texarea";
import { supabase } from "../../Integrations/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";

interface GymMember {
  id: string;
  gym_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  membership_type: string;
  membership_start: string;
  membership_end: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface MemberManagementProps {
  gymIds: string[];
  gyms: { id: string; name: string }[];
}

const MemberManagement = ({ gymIds, gyms }: MemberManagementProps) => {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GymMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGymFilter, setSelectedGymFilter] = useState<string>("all");
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const [formData, setFormData] = useState({
    gym_id: "",
    name: "",
    phone: "",
    email: "",
    membership_type: "monthly",
    membership_start: new Date().toISOString().split("T")[0],
    membership_end: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    fetchMembers();
  }, [gymIds]);

  const fetchMembers = async () => {
    if (gymIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from("gym_members")
        .select("*")
        .in("gym_id", gymIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);

    setFormData({
      gym_id: gyms.length === 1 ? gyms[0].id : "",
      name: "",
      phone: "",
      email: "",
      membership_type: "monthly",
      membership_start: new Date().toISOString().split("T")[0],
      membership_end: defaultEndDate.toISOString().split("T")[0],
      status: "active",
      notes: "",
    });
    setEditingMember(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: GymMember) => {
    setEditingMember(member);
    setFormData({
      gym_id: member.gym_id,
      name: member.name,
      phone: member.phone || "",
      email: member.email || "",
      membership_type: member.membership_type,
      membership_start: member.membership_start,
      membership_end: member.membership_end,
      status: member.status,
      notes: member.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.gym_id || !formData.membership_end) {
      toast({
        title: "Missing fields",
        description: "Please fill in name, gym, and membership end date.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const memberData = {
        gym_id: formData.gym_id,
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        membership_type: formData.membership_type,
        membership_start: formData.membership_start,
        membership_end: formData.membership_end,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (editingMember) {
        const { error } = await supabase
          .from("gym_members")
          .update(memberData)
          .eq("id", editingMember.id);

        if (error) throw error;
        toast({
          title: editingMember
            ? "Member updated successfully"
            : "Member added successfully",
          duration: 3000,
        });
      } else {
        const { error } = await supabase.from("gym_members").insert(memberData);

        if (error) throw error;
        toast({ title: "Member added successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false); // ADD THIS LINE
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const { error } = await supabase
        .from("gym_members")
        .delete()
        .eq("id", deleteDialog.id);

      if (error) throw error;
      toast({
        title: "Member deleted successfully",
        duration: 3000,
      });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGym =
      selectedGymFilter === "all" || member.gym_id === selectedGymFilter;
    return matchesSearch && matchesGym;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGymName = (gymId: string) => {
    return gyms.find((g) => g.id === gymId)?.name || "Unknown";
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Member Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {members.length} total members
            </p>
          </div>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {gyms.length > 1 && (
            <Select
              value={selectedGymFilter}
              onValueChange={setSelectedGymFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by gym" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gyms</SelectItem>
                {gyms.map((gym) => (
                  <SelectItem key={gym.id} value={gym.id}>
                    {gym.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Members Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                {gyms.length > 1 && <TableHead>Gym</TableHead>}
                <TableHead>Membership</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={gyms.length > 1 ? 7 : 6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No members found. Click "Add Member" to add your first
                    member.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {member.phone && <div>{member.phone}</div>}
                        {member.email && (
                          <div className="text-muted-foreground">
                            {member.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {gyms.length > 1 && (
                      <TableCell>{getGymName(member.gym_id)}</TableCell>
                    )}
                    <TableCell className="capitalize">
                      {member.membership_type}
                    </TableCell>
                    <TableCell>
                      {new Date(member.membership_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: member.id })
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {gyms.length > 1 && (
              <div className="space-y-2">
                <Label>Gym *</Label>
                <Select
                  value={formData.gym_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gym_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gym" />
                  </SelectTrigger>
                  <SelectContent>
                    {gyms.map((gym) => (
                      <SelectItem key={gym.id} value={gym.id}>
                        {gym.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Member name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Membership Type</Label>
                <Select
                  value={formData.membership_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, membership_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="day_pass">Day Pass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.membership_start}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        membership_start: e.target.value,
                      }))
                    }
                    className="pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    ref={startDateRef}
                  />
                  <Calendar
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                    onClick={() => startDateRef.current?.showPicker?.()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.membership_end}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        membership_end: e.target.value,
                      }))
                    }
                    className="pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    ref={endDateRef}
                  />
                  <Calendar
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                    onClick={() => endDateRef.current?.showPicker?.()}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes about the member..."
                rows={2}
              />
            </div>

            {/* Buttons - add loading state */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingMember ? "Updating..." : "Adding..."}
                  </>
                ) : editingMember ? (
                  "Update Member"
                ) : (
                  "Add Member"
                )}
              </Button>
            </div>
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
            Are you sure you want to delete this member? This action cannot be
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

export default MemberManagement;
