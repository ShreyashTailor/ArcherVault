import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, Check, X, Loader2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PaymentSettings, PaymentRequest } from "@shared/schema";

export default function PaymentManagement() {
  const { toast } = useToast();
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; request: PaymentRequest | null }>({ open: false, request: null });
  const [password, setPassword] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const { data: settings } = useQuery<PaymentSettings>({
    queryKey: ['/api/admin/payment-settings'],
  });

  const { data: paymentRequests = [] } = useQuery<PaymentRequest[]>({
    queryKey: ['/api/admin/payment-requests'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { upiQrCodeUrl?: string; supportEmail: string }) => {
      const response = await apiRequest('PUT', '/api/admin/payment-settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      toast({ title: "Settings updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, password, validUntil }: { id: string; password: string; validUntil: string }) => {
      const response = await apiRequest('POST', `/api/admin/payment-requests/${id}/approve`, { password, validUntil });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-requests'] });
      setApproveDialog({ open: false, request: null });
      setPassword("");
      setValidUntil("");
      toast({ 
        title: "Payment approved", 
        description: `User created: ${data.user.username}. Please send credentials to user email.` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/admin/payment-requests/${id}/reject`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-requests'] });
      toast({ title: "Payment request rejected" });
    },
    onError: (error: any) => {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    },
  });

  const handleQrUpload = async () => {
    if (!qrImage) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', qrImage);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      updateSettingsMutation.mutate({
        upiQrCodeUrl: data.url,
        supportEmail: supportEmail || settings?.supportEmail || 'support@aviationstudyportal.com',
      });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateSupportEmail = () => {
    if (!supportEmail) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }

    updateSettingsMutation.mutate({
      upiQrCodeUrl: settings?.upiQrCodeUrl,
      supportEmail,
    });
  };

  const handleApprove = (request: PaymentRequest) => {
    // Calculate valid until date (duration months from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + request.durationMonths);
    const calculatedValidUntil = endDate.toISOString().split('T')[0];
    
    setValidUntil(calculatedValidUntil);
    setApproveDialog({ open: true, request });
  };

  const submitApproval = () => {
    if (!approveDialog.request || !password || !validUntil) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    approveMutation.mutate({
      id: approveDialog.request.id,
      password,
      validUntil,
    });
  };

  const pendingRequests = paymentRequests.filter(r => r.status === 'pending');
  const processedRequests = paymentRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings" data-testid="tab-payment-settings">
            Payment Settings
          </TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-payment-requests">
            Payment Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>UPI QR Code</CardTitle>
              <CardDescription>
                Upload QR code for students to make payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings?.upiQrCodeUrl && (
                <div className="flex justify-center bg-muted p-4 rounded-md">
                  <img
                    src={settings.upiQrCodeUrl}
                    alt="Current QR Code"
                    className="max-w-full h-auto rounded-md"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="qr-image">Upload New QR Code</Label>
                <Input
                  id="qr-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrImage(e.target.files?.[0] || null)}
                  data-testid="input-qr-code"
                />
              </div>

              <Button
                onClick={handleQrUpload}
                disabled={!qrImage || isUploading}
                data-testid="button-upload-qr"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload QR Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Email</CardTitle>
              <CardDescription>
                Email address shown to students for support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current: {settings?.supportEmail}
              </p>
              <div className="space-y-2">
                <Label htmlFor="support-email">New Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder={settings?.supportEmail}
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  data-testid="input-support-email"
                />
              </div>

              <Button
                onClick={handleUpdateSupportEmail}
                disabled={!supportEmail}
                data-testid="button-update-email"
              >
                Update Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
                <CardDescription>
                  Review and approve payment submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="border-primary/20">
                    <CardContent className="pt-6 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Username:</span> {request.username}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {request.email}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {request.durationMonths} months
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> ₹{request.totalAmount}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Submitted:</span> {new Date(request.submittedAt).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <a
                          href={request.transactionImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          View Transaction Screenshot
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(request)}
                          size="sm"
                          data-testid={`button-approve-${request.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectMutation.mutate(request.id)}
                          variant="destructive"
                          size="sm"
                          data-testid={`button-reject-${request.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {processedRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {processedRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1 text-sm">
                      <div><span className="font-medium">{request.username}</span> ({request.email})</div>
                      <div className="text-muted-foreground">
                        {request.durationMonths} months - ₹{request.totalAmount}
                      </div>
                    </div>
                    <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {paymentRequests.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No payment requests yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment Request</DialogTitle>
            <DialogDescription>
              Create user account for {approveDialog.request?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="text"
                placeholder="Enter password for user"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-approve-password"
              />
              <p className="text-xs text-muted-foreground">
                This password will be sent to the user's email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid-until">Valid Until</Label>
              <Input
                id="valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                data-testid="input-approve-valid-until"
              />
              <p className="text-xs text-muted-foreground">
                Access expires on this date
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialog({ open: false, request: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              disabled={!password || !validUntil || approveMutation.isPending}
              data-testid="button-confirm-approve"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
