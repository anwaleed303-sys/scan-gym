import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/texarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../Integrations/client";
import { Salad, Plus, Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number | null;
  calories_per_day: number | null;
  meal_count: number | null;
  features: string[] | null;
  is_active: boolean | null;
  created_at: string;
}

interface DietPlanManagementProps {
  dietPlans: DietPlan[];
  onRefresh: () => void;
}

export const DietPlanManagement = ({
  dietPlans,
  onRefresh,
}: DietPlanManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);
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
    description: "",
    price: "",
    duration_days: "30",
    calories_per_day: "",
    meal_count: "3",
    features: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_days: "30",
      calories_per_day: "",
      meal_count: "3",
      features: "",
      is_active: true,
    });
    setEditingPlan(null);
    setShowForm(false);
  };

  const handleEdit = (plan: DietPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      duration_days: plan.duration_days?.toString() || "30",
      calories_per_day: plan.calories_per_day?.toString() || "",
      meal_count: plan.meal_count?.toString() || "3",
      features: plan.features?.join(", ") || "",
      is_active: plan.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        name: formData.name,
        description: formData.description || null,
        price: parseInt(formData.price),
        duration_days: formData.duration_days
          ? parseInt(formData.duration_days)
          : null,
        calories_per_day: formData.calories_per_day
          ? parseInt(formData.calories_per_day)
          : null,
        meal_count: formData.meal_count ? parseInt(formData.meal_count) : null,
        features: formData.features
          ? formData.features
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean)
          : [],
        is_active: formData.is_active,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from("diet_plans")
          .update(planData)
          .eq("id", editingPlan.id);

        if (error) throw error;
        toast({ title: "Diet plan updated successfully" });
      } else {
        const { error } = await supabase.from("diet_plans").insert(planData);

        if (error) throw error;
        toast({ title: "Diet plan added successfully" });
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
        .from("diet_plans")
        .delete()
        .eq("id", deleteDialog.id);
      if (error) throw error;
      toast({ title: "Diet plan deleted", duration: 3000 });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Salad className="w-5 h-5" />
            Diet Plan Management
          </CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Diet Plan
          </Button>
        </CardHeader>
        <CardContent>
          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">
                    {editingPlan ? "Edit Diet Plan" : "Add New Diet Plan"}
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
                      placeholder="e.g., Weight Loss Plan"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the plan..."
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
                      placeholder="0 for free plans"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration (days)</Label>
                      <Input
                        type="number"
                        value={formData.duration_days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration_days: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Meals per day</Label>
                      <Input
                        type="number"
                        value={formData.meal_count}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            meal_count: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Calories per day</Label>
                    <Input
                      type="number"
                      value={formData.calories_per_day}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          calories_per_day: e.target.value,
                        })
                      }
                      placeholder="e.g., 1500"
                    />
                  </div>
                  <div>
                    <Label>Features (comma-separated)</Label>
                    <Input
                      value={formData.features}
                      onChange={(e) =>
                        setFormData({ ...formData, features: e.target.value })
                      }
                      placeholder="High protein, Low carb, Easy to follow"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                      className="data-[state=checked]:bg-orange-500 [&>span]:data-[state=checked]:bg-white"
                    />
                    <Label>Active (visible to customers)</Label>
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
                      {loading ? "Saving..." : editingPlan ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Diet Plans List */}
          {dietPlans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No diet plans added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {dietPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-xl">
                      🥗
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            plan.is_active
                              ? "bg-primary/20 text-primary"
                              : "bg-muted-foreground/20 text-muted-foreground"
                          }`}
                        >
                          {plan.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.duration_days} days • {plan.meal_count} meals/day
                        {plan.calories_per_day &&
                          ` • ${plan.calories_per_day} cal/day`}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {plan.price === 0
                          ? "FREE"
                          : `PKR ${plan.price.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(plan)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setDeleteDialog({ open: true, id: plan.id })
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
            Are you sure you want to delete this plan? This action cannot be
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
    </>
  );
};
<style>{`
        /* ============================================
           DIET PLAN MANAGEMENT RESPONSIVE STYLES
           ============================================ */

        /* Mobile First - Base Styles (320px+) */
        @media (max-width: 640px) {
          /* Card header stacking */
          .flex.flex-row.items-center.justify-between {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem;
          }

          .flex.flex-row.items-center.justify-between > button {
            width: 100%;
          }

          /* Form modal adjustments */
          .fixed.inset-0 .max-w-md {
            max-width: calc(100% - 1rem) !important;
            margin: 0 0.5rem;
          }

          .max-h-\\[90vh\\] {
            max-height: 85vh !important;
          }

          /* Form container padding */
          .fixed.inset-0 .bg-card.border {
            padding: 1rem !important;
          }

          /* Form title */
          .font-display.text-xl {
            font-size: 1.125rem !important;
          }

          /* Form inputs spacing */
          .space-y-4 {
            gap: 0.75rem !important;
          }

          /* Input fields */
          input[type="number"],
          input[type="text"],
          textarea {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }

          /* Textarea height */
          textarea {
            min-height: 80px !important;
          }

          /* Grid layout - stack on mobile */
          .grid.grid-cols-2 {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }

          /* Form buttons */
          .flex.gap-2.pt-4 {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }

          .flex.gap-2.pt-4 button {
            width: 100% !important;
            flex: none !important;
          }

          /* Diet plan cards */
          .flex.items-center.justify-between.p-4 {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem;
            padding: 1rem !important;
          }

          /* Plan info section */
          .flex.items-center.gap-3 {
            width: 100%;
            flex-wrap: wrap;
          }

          /* Plan icon */
          .w-12.h-12 {
            width: 3rem !important;
            height: 3rem !important;
            font-size: 1.25rem !important;
            flex-shrink: 0;
          }

          /* Plan details */
          .flex.items-center.gap-3 > div {
            flex: 1;
            min-width: 0;
          }

          /* Plan name and status */
          .flex.items-center.gap-2 {
            flex-wrap: wrap;
            gap: 0.5rem !important;
          }

          /* Status badge */
          .text-xs.px-2.py-0\\.5.rounded-full {
            font-size: 0.7rem !important;
            padding: 0.125rem 0.5rem !important;
            white-space: nowrap;
          }

          /* Plan details text */
          .text-sm.text-muted-foreground {
            font-size: 0.8125rem !important;
            word-break: break-word;
            line-height: 1.4;
          }

          /* Price text */
          .text-sm.font-medium.text-primary {
            font-size: 0.875rem !important;
            margin-top: 0.25rem;
          }

          /* Action buttons container */
          .flex.items-center.gap-2:has(button[size="icon"]) {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }

          /* Action buttons */
          button[size="icon"] {
            min-width: 40px !important;
            min-height: 40px !important;
          }

          /* Empty state message */
          .text-muted-foreground.text-center.py-8 {
            padding: 2rem 1rem !important;
            font-size: 0.9rem;
          }

          /* Delete dialog */
          .sm\\:max-w-md {
            max-width: calc(100% - 2rem) !important;
            margin: 0 1rem;
          }

          .flex.justify-end.gap-3.pt-4 {
            flex-direction: column-reverse !important;
            gap: 0.5rem !important;
          }

          .flex.justify-end.gap-3.pt-4 button {
            width: 100%;
          }

          /* Switch and label */
          .flex.items-center.gap-2:has(input[role="switch"]) {
            gap: 0.75rem !important;
            flex-wrap: wrap;
          }

          /* Label text sizing */
          label {
            font-size: 0.9375rem !important;
          }

          /* Placeholder text */
          ::placeholder {
            font-size: 0.875rem !important;
          }
        }

        /* Small tablets (641px - 768px) */
        @media (min-width: 641px) and (max-width: 768px) {
          /* Form modal */
          .fixed.inset-0 .max-w-md {
            max-width: 90% !important;
          }

          /* Diet plan cards */
          .flex.items-center.justify-between.p-4 {
            padding: 1.25rem !important;
          }

          /* Icon size */
          .w-12.h-12 {
            width: 3.5rem !important;
            height: 3.5rem !important;
          }

          /* Font sizes */
          .font-medium,
          .text-sm {
            font-size: 0.925rem !important;
          }

          /* Keep 2-column grid on small tablets */
          .grid.grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Tablets (769px - 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          /* Form modal */
          .fixed.inset-0 .max-w-md {
            max-width: 500px !important;
          }

          /* Diet plan cards spacing */
          .space-y-3 {
            gap: 0.875rem !important;
          }
        }

        /* Landscape mobile devices */
        @media (max-height: 500px) and (orientation: landscape) {
          /* Form modal height */
          .max-h-\\[90vh\\] {
            max-height: 95vh !important;
          }

          /* Reduce form spacing */
          .space-y-4 {
            gap: 0.5rem !important;
          }

          /* Form container padding */
          .fixed.inset-0 .bg-card.border {
            padding: 0.75rem !important;
          }

          /* Title size */
          .font-display.text-xl {
            font-size: 1rem !important;
          }

          /* Button padding */
          .flex.gap-2.pt-4 {
            padding-top: 0.75rem !important;
          }

          /* Textarea height */
          textarea {
            min-height: 60px !important;
          }

          /* Grid spacing */
          .grid.grid-cols-2 {
            gap: 0.5rem !important;
          }
        }

        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
          /* Minimum touch targets */
          button,
          input,
          textarea {
            min-height: 44px !important;
          }

          button[size="icon"] {
            min-width: 44px !important;
            min-height: 44px !important;
          }

          button[size="sm"] {
            min-height: 40px !important;
            padding: 0.5rem 1rem !important;
          }

          /* Increase spacing for easier tapping */
          .flex.items-center.gap-2 {
            gap: 0.75rem !important;
          }

          .flex.items-center.gap-3 {
            gap: 1rem !important;
          }

          /* Close button size */
          .text-muted-foreground.hover\\:text-foreground {
            min-width: 44px !important;
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }

        /* Improve scrolling on iOS */
        .overflow-y-auto,
        [class*="overflow-y-auto"] {
          -webkit-overflow-scrolling: touch;
        }

        /* Backdrop blur performance */
        .backdrop-blur-sm {
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
        }

        /* Safe area for notched devices */
        @supports (padding: max(0px)) {
          .fixed.inset-0 > div {
            padding-left: max(1rem, env(safe-area-inset-left)) !important;
            padding-right: max(1rem, env(safe-area-inset-right)) !important;
            padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
          }

          @media (max-width: 640px) {
            .bg-card.border-border {
              margin-left: env(safe-area-inset-left) !important;
              margin-right: env(safe-area-inset-right) !important;
            }
          }
        }

        /* Prevent horizontal scroll */
        .space-y-3 {
          overflow-x: hidden;
        }

        /* Card responsiveness */
        @media (max-width: 640px) {
          .bg-card.border-border {
            border-radius: 0.75rem !important;
          }

          /* Card content padding */
          [class*="CardContent"] {
            padding: 1rem !important;
          }

          /* Card header padding */
          [class*="CardHeader"] {
            padding: 1rem !important;
          }
        }

        /* Dark mode optimizations */
        @media (prefers-color-scheme: dark) {
          /* Form modal shadow */
          .fixed.inset-0 .shadow-xl {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5),
                        0 10px 10px -5px rgba(0, 0, 0, 0.4) !important;
          }

          /* Backdrop */
          .bg-background\\/80 {
            background-color: rgba(0, 0, 0, 0.85) !important;
          }

          /* Input backgrounds */
          input,
          textarea {
            background-color: hsl(var(--input)) !important;
          }
        }

        /* Light mode optimizations */
        @media (prefers-color-scheme: light) {
          /* Form modal shadow */
          .fixed.inset-0 .shadow-xl {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                        0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }

          /* Backdrop */
          .bg-background\\/80 {
            background-color: rgba(255, 255, 255, 0.85) !important;
          }
        }

        /* Number input styling */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
          appearance: textfield;
        }

        /* Better number input for mobile */
        @media (max-width: 640px) {
          input[type="number"] {
            -webkit-appearance: none;
            appearance: none;
          }
        }

        /* Improve form field spacing */
        @media (max-width: 640px) {
          .space-y-4 > div {
            margin-bottom: 0.75rem !important;
          }

          .space-y-4 > div:last-child {
            margin-bottom: 0 !important;
          }
        }

        /* Status badge responsive sizing */
        @media (max-width: 480px) {
          .text-xs.px-2.py-0\\.5.rounded-full {
            font-size: 0.65rem !important;
            padding: 0.1rem 0.4rem !important;
          }
        }

        /* Emoji sizing */
        .text-xl {
          line-height: 1 !important;
        }

        @media (max-width: 640px) {
          .text-xl {
            font-size: 1.125rem !important;
          }
        }

        /* Accessibility - Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .border,
          .border-border {
            border-width: 2px !important;
          }

          button {
            border: 2px solid currentColor !important;
          }

          input,
          textarea {
            border: 2px solid currentColor !important;
          }
        }

        /* Focus visible styles for keyboard navigation */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid hsl(var(--primary)) !important;
          outline-offset: 2px !important;
        }

        /* Improve click/tap feedback */
        button:active {
          transform: scale(0.98);
        }

        @media (hover: none) {
          button:active {
            transform: scale(0.95);
          }
        }

        /* Print styles */
        @media print {
          button {
            display: none !important;
          }

          .fixed.inset-0 {
            display: none !important;
          }

          .space-y-3 > div {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .bg-muted {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        /* Better text wrapping for plan details */
        @media (max-width: 640px) {
          .text-sm.text-muted-foreground {
            overflow-wrap: break-word;
            word-wrap: break-word;
            hyphens: auto;
          }
        }

        /* Improve modal close button positioning */
        @media (max-width: 640px) {
          .flex.items-center.justify-between.mb-6 {
            margin-bottom: 1rem !important;
          }

          .flex.items-center.justify-between.mb-6 button {
            padding: 0.5rem !important;
          }
        }

        /* Grid fallback for older browsers */
        @supports not (display: grid) {
          .grid {
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}</style>;
