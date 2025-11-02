import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Update } from "@shared/schema";
import { Megaphone, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

export default function UpdatesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: updates = [], isLoading } = useQuery<Update[]>({
    queryKey: ["/api/admin/updates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return apiRequest("POST", "/api/admin/updates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/updates"] });
      setTitle("");
      setContent("");
      toast({
        title: "Update Created",
        description: "New announcement has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create update.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/updates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/updates"] });
      toast({
        title: "Update Deleted",
        description: "Announcement has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete update.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      createMutation.mutate({ title, content });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Post New Update
          </CardTitle>
          <CardDescription>
            Create announcements that will be displayed on the landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-title">Title</Label>
              <Input
                id="update-title"
                type="text"
                placeholder="e.g., New Content Added"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-update-title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-content">Content</Label>
              <Textarea
                id="update-content"
                placeholder="Write your announcement here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                data-testid="input-update-content"
                rows={4}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending || !title || !content}
              data-testid="button-create-update"
            >
              {createMutation.isPending ? "Posting..." : "Post Update"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Published Updates
          </CardTitle>
          <CardDescription>
            Manage existing announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading updates...</p>
          ) : updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates posted yet.</p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <Card key={update.id} data-testid={`update-${update.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-lg" data-testid={`text-update-title-${update.id}`}>
                          {update.title}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-update-content-${update.id}`}>
                          {update.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Posted: {format(new Date(update.createdAt), "PPP")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(update.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-update-${update.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
