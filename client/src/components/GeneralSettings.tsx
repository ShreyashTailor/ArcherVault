import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";
import { Mail } from "lucide-react";

export default function GeneralSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [supportEmail, setSupportEmail] = useState("");

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/admin/settings"],
  });

  useEffect(() => {
    if (settings?.supportEmail) {
      setSupportEmail(settings.supportEmail);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("PUT", "/api/admin/settings", { supportEmail: email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Support email has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supportEmail) {
      updateMutation.mutate(supportEmail);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          General Settings
        </CardTitle>
        <CardDescription>
          Manage support email displayed on the landing page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              placeholder={settings?.supportEmail || "support@archer.com"}
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              data-testid="input-support-email"
              required
            />
            <p className="text-sm text-muted-foreground">
              Current: {settings?.supportEmail || "support@archer.com"}
            </p>
          </div>
          <Button
            type="submit"
            disabled={updateMutation.isPending || !supportEmail}
            data-testid="button-update-settings"
          >
            {updateMutation.isPending ? "Updating..." : "Update Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
