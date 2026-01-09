import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/texarea";
import {
  Plus,
  Search,
  CreditCard,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { supabase } from "../../Integrations/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PaymentTrackingProps {
  gymIds: string[];
  gyms: { id: string; name: string }[];
}

interface MemberPayment {
  id: string;
  member_id: string;
  gym_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_type: string;
  notes: string | null;
  created_at: string;
  member?: {
    name: string;
    email: string | null;
  };
  gym?: {
    name: string;
  };
}

interface GymMember {
  id: string;
  name: string;
  gym_id: string;
}

const PaymentTracking = ({ gymIds, gyms }: PaymentTrackingProps) => {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGym, setSelectedGym] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPayment, setEditingPayment] = useState<MemberPayment | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [formData, setFormData] = useState({
    member_id: "",
    gym_id: gyms[0]?.id || "",
    amount: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "cash",
    payment_type: "membership",
    notes: "",
  });

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("member_payments")
        .select(
          `
          *,
          member:gym_members!member_id(name, email),
          gym:gyms!gym_id(name)
        `
        )
        .in("gym_id", gymIds)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("gym_members")
        .select("id, name, gym_id")
        .in("gym_id", gymIds)
        .eq("status", "active");

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    if (gymIds.length > 0) {
      fetchPayments();
      fetchMembers();
    }
  }, [gymIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.member_id || !formData.amount) {
      toast({
        title: "Error",
        description: "Please select a member and enter an amount",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const paymentData = {
        member_id: formData.member_id,
        gym_id: formData.gym_id,
        amount: parseInt(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        payment_type: formData.payment_type,
        notes: formData.notes || null,
      };

      if (editingPayment) {
        const { error } = await supabase
          .from("member_payments")
          .update(paymentData)
          .eq("id", editingPayment.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Payment updated successfully",
          duration: 3000,
        });
      } else {
        const { error } = await supabase
          .from("member_payments")
          .insert(paymentData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Payment recorded successfully",
          duration: 3000,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPayments();
      fetchMembers();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: "Error",
        description: "Failed to save payment",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const { error } = await supabase
        .from("member_payments")
        .delete()
        .eq("id", deleteDialog.id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Payment deleted successfully",
        duration: 3000,
      });
      fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: "",
      gym_id: gyms[0]?.id || "",
      amount: "",
      payment_date: format(new Date(), "yyyy-MM-dd"),
      payment_method: "cash",
      payment_type: "membership",
      notes: "",
    });
    setEditingPayment(null);
  };

  const openEditDialog = (payment: MemberPayment) => {
    setEditingPayment(payment);
    setFormData({
      member_id: payment.member_id,
      gym_id: payment.gym_id,
      amount: payment.amount.toString(),
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      payment_type: payment.payment_type,
      notes: payment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.member?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGym = selectedGym === "all" || payment.gym_id === selectedGym;
    return matchesSearch && matchesGym;
  });

  // Calculate summary stats
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonthPayments = payments.filter((p) => {
    const paymentDate = new Date(p.payment_date);
    const now = new Date();
    return (
      paymentDate.getMonth() === now.getMonth() &&
      paymentDate.getFullYear() === now.getFullYear()
    );
  });
  const thisMonthTotal = thisMonthPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const membersForSelectedGym = formData.gym_id
    ? members.filter((m) => m.gym_id === formData.gym_id)
    : members;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {totalReceived.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {thisMonthTotal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {thisMonthPayments.length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
            <Calendar className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {payments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recorded payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with filters and add button */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment History
            </CardTitle>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  resetForm();
                } else {
                  fetchMembers(); // ✅ Only fetch when dialog opens
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPayment ? "Edit Payment" : "Record New Payment"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {gyms.length > 1 && (
                    <div className="space-y-2">
                      <Label>Gym</Label>
                      <Select
                        value={formData.gym_id}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            gym_id: value,
                            member_id: "",
                          });
                        }}
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
                    <Label>Member *</Label>
                    <Select
                      value={formData.member_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, member_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {membersForSelectedGym.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount (Rs.) *</Label>
                      <Input
                        type="number"
                        className="number-orange"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        placeholder="Enter amount"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={formData.payment_date}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              payment_date: e.target.value,
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) =>
                          setFormData({ ...formData, payment_method: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem value="jazzcash">JazzCash</SelectItem>
                          <SelectItem value="easypaisa">Easypaisa</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <Select
                        value={formData.payment_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, payment_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="membership">Membership</SelectItem>
                          <SelectItem value="personal_training">
                            Personal Training
                          </SelectItem>
                          <SelectItem value="diet_plan">Diet Plan</SelectItem>
                          <SelectItem value="locker">Locker</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Optional notes"
                      rows={2}
                    />
                  </div>

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
                          {editingPayment ? "Updating..." : "Adding..."}
                        </>
                      ) : editingPayment ? (
                        "Record Payment"
                      ) : (
                        "Record Payment"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {gyms.length > 1 && (
              <Select value={selectedGym} onValueChange={setSelectedGym}>
                <SelectTrigger className="w-full sm:w-48">
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

          {/* Payments Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  {gyms.length > 1 && <TableHead>Gym</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={gyms.length > 1 ? 7 : 6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.member?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        Rs. {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.payment_date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_method.replace("_", " ")}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_type.replace("_", " ")}
                      </TableCell>
                      {gyms.length > 1 && (
                        <TableCell>{payment.gym?.name || "N/A"}</TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(payment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setDeleteDialog({ open: true, id: payment.id })
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
      </Card>
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
            Are you sure you want to delete this payment? This action cannot be
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
    </div>
  );
};

export default PaymentTracking;
