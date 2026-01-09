import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/texarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../Integrations/client";
import { Dumbbell, Plus, Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  price: number;
  image: string | null;
  bio: string | null;
  experience_years: number | null;
  is_available: boolean | null;
  created_at: string;
}

interface TrainerManagementProps {
  trainers: Trainer[];
  onRefresh: () => void;
}

export const TrainerManagement = ({
  trainers,
  onRefresh,
}: TrainerManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    price: "",
    image: "",
    bio: "",
    experience_years: "",
    is_available: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      specialty: "",
      price: "",
      image: "",
      bio: "",
      experience_years: "",
      is_available: true,
    });
    setEditingTrainer(null);
    setShowForm(false);
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      specialty: trainer.specialty,
      price: trainer.price.toString(),
      image: trainer.image || "",
      bio: trainer.bio || "",
      experience_years: trainer.experience_years?.toString() || "",
      is_available: trainer.is_available ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trainerData = {
        name: formData.name,
        specialty: formData.specialty,
        price: parseInt(formData.price),
        image: formData.image || null,
        bio: formData.bio || null,
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : null,
        is_available: formData.is_available,
      };

      if (editingTrainer) {
        const { error } = await supabase
          .from("trainers")
          .update(trainerData)
          .eq("id", editingTrainer.id);

        if (error) throw error;
        toast({ title: "Trainer updated successfully" });
      } else {
        const { error } = await supabase.from("trainers").insert(trainerData);

        if (error) throw error;
        toast({ title: "Trainer added successfully" });
      }

      resetForm();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const { error } = await supabase
        .from("trainers")
        .delete()
        .eq("id", deleteDialog.id);
      if (error) throw error;
      toast({ title: "Trainer deleted", duration: 3000 });

      onRefresh();
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

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Trainer Management
        </CardTitle>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Trainer
        </Button>
      </CardHeader>
      <CardContent>
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">
                  {editingTrainer ? "Edit Trainer" : "Add New Trainer"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Specialty *</Label>
                  <Input
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    placeholder="e.g., Weight Training, Yoga"
                    required
                  />
                </div>
                <div>
                  <Label>Price (PKR) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Image URL (or emoji)</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="💪 or https://..."
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Brief description..."
                  />
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience_years: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_available: checked })
                    }
                    className="data-[state=checked]:bg-orange-500 [&>span]:data-[state=checked]:bg-white"
                  />
                  <Label>Available for booking</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : editingTrainer ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Trainers List */}
        {trainers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No trainers added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-xl">
                    {trainer.image || "💪"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{trainer.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          trainer.is_available
                            ? "bg-primary/20 text-primary"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {trainer.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trainer.specialty}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      PKR {trainer.price.toLocaleString()}/session
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(trainer)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteDialog({ open: true, id: trainer.id })
                    }
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

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
            Are you sure you want to delete this trainer ? This action cannot be
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
