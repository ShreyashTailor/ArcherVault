import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CheckCircle2, Upload, Loader2 } from "lucide-react";
import type { PaymentSettings } from "@shared/schema";

interface RegistrationPortalProps {
  onBack: () => void;
}

export default function RegistrationPortal({ onBack }: RegistrationPortalProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [durationMonths, setDurationMonths] = useState(1);
  const [transactionImage, setTransactionImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: settings } = useQuery<PaymentSettings>({
    queryKey: ['/api/payment-settings'],
  });

  const totalAmount = durationMonths * 500;

  const submitMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; durationMonths: number; transactionImageUrl: string }) => {
      const response = await apiRequest('POST', '/api/payment-requests', data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/payment-proof-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      return data.url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !transactionImage) {
      toast({
        title: "Missing information",
        description: "Please fill all fields and upload transaction proof",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrl = await handleImageUpload(transactionImage);
      
      submitMutation.mutate({
        username,
        email,
        durationMonths,
        transactionImageUrl: imageUrl,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Received!</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for your payment submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-sm">
                You will receive your login credentials via email within <strong>24 hours</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                (Please note: During busy periods, confirmation may take longer)
              </p>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Order Details:</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Email:</span> {email}</p>
                <p><span className="text-muted-foreground">Duration:</span> {durationMonths} month{durationMonths > 1 ? 's' : ''}</p>
                <p><span className="text-muted-foreground">Amount:</span> ₹{totalAmount}</p>
              </div>
            </div>

            {settings?.supportEmail && (
              <div className="bg-primary/10 p-4 rounded-md">
                <p className="text-sm font-medium mb-1">Need Help?</p>
                <p className="text-sm text-muted-foreground">
                  For any issues or if you made a mistake, contact us at:
                </p>
                <a 
                  href={`mailto:${settings.supportEmail}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {settings.supportEmail}
                </a>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={onBack}
              data-testid="button-back-to-home"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Get Your Archer Access Key</CardTitle>
              <CardDescription>
                Complete payment and receive your DGCA study portal login credentials via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    data-testid="input-username"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be your login username
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    data-testid="input-email"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Credentials will be sent to this email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={durationMonths.toString()}
                    onValueChange={(value) => setDurationMonths(parseInt(value))}
                  >
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((months) => (
                        <SelectItem key={months} value={months.toString()}>
                          {months} month{months > 1 ? 's' : ''} - ₹{months * 500}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-primary/10 p-4 rounded-md">
                  <p className="font-medium">Total Amount</p>
                  <p className="text-3xl font-bold text-primary">₹{totalAmount}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction-image">Transaction Screenshot</Label>
                  <Input
                    id="transaction-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTransactionImage(e.target.files?.[0] || null)}
                    data-testid="input-transaction-image"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a clear screenshot of your UPI payment
                  </p>
                  {transactionImage && (
                    <p className="text-sm text-green-600">
                      ✓ File selected: {transactionImage.name}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUploading || submitMutation.isPending}
                  data-testid="button-submit-payment"
                >
                  {isUploading || submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Payment Proof
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payment QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
              <CardDescription>
                Scan QR code and complete payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Step 1: Make Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code below using any UPI app (Google Pay, PhonePe, Paytm, etc.)
                </p>
              </div>

              {settings?.upiQrCodeUrl ? (
                <div className="flex justify-center bg-muted p-4 rounded-md">
                  <img
                    src={settings.upiQrCodeUrl}
                    alt="UPI QR Code"
                    className="max-w-full h-auto rounded-md"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              ) : (
                <div className="bg-muted p-8 rounded-md text-center text-muted-foreground">
                  QR Code will appear here
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">Step 2: Take Screenshot</h3>
                <p className="text-sm text-muted-foreground">
                  After successful payment, take a clear screenshot showing the transaction details
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Step 3: Upload & Submit</h3>
                <p className="text-sm text-muted-foreground">
                  Fill the form and upload your payment screenshot
                </p>
              </div>

              {settings?.supportEmail && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-1">Support Contact</p>
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {settings.supportEmail}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact us if you face any issues
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
