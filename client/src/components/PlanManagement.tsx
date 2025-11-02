import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Edit, Check, X } from "lucide-react";
import type { Plan } from "@shared/schema";

export default function PlanManagement() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ razorpayLink: "" });

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/admin/plans'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, razorpayLink }: { id: string; razorpayLink: string }) => {
      const response = await apiRequest('PUT', `/api/admin/plans/${id}`, { razorpayLink });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      toast({ title: "Plan updated successfully" });
      setEditingId(null);
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditForm({ razorpayLink: plan.razorpayLink });
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({ id, razorpayLink: editForm.razorpayLink });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ razorpayLink: "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold" data-testid="heading-plans">Plan Management</h2>
        <p className="text-muted-foreground mt-2">
          Manage Razorpay payment links for subscription plans
        </p>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'} - ₹{plan.price}
                </CardDescription>
              </div>
              {editingId !== plan.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                  data-testid={`button-edit-plan-${plan.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingId === plan.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="razorpayLink">Razorpay Payment Link</Label>
                    <Input
                      id="razorpayLink"
                      type="url"
                      placeholder="https://razorpay.me/@yourbusiness"
                      value={editForm.razorpayLink}
                      onChange={(e) => setEditForm({ razorpayLink: e.target.value })}
                      data-testid={`input-razorpay-link-${plan.id}`}
                    />
                    <p className="text-sm text-muted-foreground">
                      Create a payment link in your Razorpay dashboard and paste it here
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave(plan.id)}
                      disabled={updateMutation.isPending}
                      data-testid={`button-save-plan-${plan.id}`}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                      data-testid={`button-cancel-edit-${plan.id}`}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Current Razorpay Link</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={plan.razorpayLink}
                      readOnly
                      className="font-mono text-sm"
                      data-testid={`text-razorpay-link-${plan.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(plan.razorpayLink);
                        toast({ title: "Link copied to clipboard" });
                      }}
                      data-testid={`button-copy-link-${plan.id}`}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Log in to your Razorpay Dashboard</p>
          <p>2. Create a payment link for each plan with the exact amount</p>
          <p>3. Copy the payment link URL and paste it in the corresponding plan above</p>
          <p>4. Users will be redirected to Razorpay to complete payment</p>
          <p className="text-muted-foreground pt-2">
            Note: After successful payment, users need to inform you to manually create their account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
