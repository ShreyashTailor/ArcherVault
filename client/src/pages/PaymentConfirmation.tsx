import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Clock } from "lucide-react";

interface PaymentConfirmationProps {
  onBackToHome: () => void;
}

export default function PaymentConfirmation({ onBackToHome }: PaymentConfirmationProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500" data-testid="icon-success" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl" data-testid="heading-payment-confirmed">
              Payment Confirmed!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Thank you for your purchase
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Check Your Email</h3>
                <p className="text-muted-foreground">
                  You will receive your login credentials via email within <strong>24 hours</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Processing Time</h3>
                <p className="text-muted-foreground">
                  Credential delivery may be delayed during rush periods. We appreciate your patience.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-primary pl-4 py-2">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Please check your spam folder if you don't receive the email in your inbox. 
              Add our email to your contacts to ensure future communications reach you.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={onBackToHome}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
