import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface UserResponse {
  id: string;
  username: string;
  validUntil: string;
  isAdmin: boolean;
}

export default function UserManagement() {
  const { toast } = useToast();
  const { data: users = [], isLoading } = useQuery<UserResponse[]>({
    queryKey: ['/api/admin/users'],
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const createUserMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; validUntil: string }) => {
      await apiRequest('POST', '/api/admin/users', { ...data, isAdmin: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowAddForm(false);
      setNewUsername("");
      setNewPassword("");
      setValidUntil("");
      toast({ title: "User created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const handleAddUser = () => {
    if (!newUsername || !newPassword || !validUntil) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    createUserMutation.mutate({ username: newUsername, password: newPassword, validUntil });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const isUserExpired = (validUntil: string) => {
    const today = new Date().toISOString().split('T')[0];
    return validUntil < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} data-testid="button-add-user">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                data-testid="input-new-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password"
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                data-testid="input-valid-until"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={handleAddUser} 
              disabled={createUserMutation.isPending}
              data-testid="button-save-user"
            >
              {createUserMutation.isPending ? 'Saving...' : 'Save User'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading users...</div>
        ) : (
          <div className="space-y-3">
            {users.filter(u => !u.isAdmin).map((user) => {
              const expired = isUserExpired(user.validUntil);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                  data-testid={`user-row-${user.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Valid until: {user.validUntil}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={expired ? "destructive" : "secondary"}>
                      {expired ? 'Expired' : 'Active'}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                      data-testid={`button-delete-${user.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {users.filter(u => !u.isAdmin).length === 0 && (
              <div className="text-center text-muted-foreground py-8">No users yet</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
