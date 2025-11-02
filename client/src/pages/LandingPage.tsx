import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plane, BookOpen, Trophy, Users, Loader2, Megaphone, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Plan, Settings, Update } from "@shared/schema";
import { format } from "date-fns";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const { data: updates = [] } = useQuery<Update[]>({
    queryKey: ['/api/updates'],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary/10 to-background">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-12 w-12 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Archer
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
              Your All-in-One DGCA CPL ATPL Guide
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl">
              Master your DGCA Commercial Pilot License and Airline Transport Pilot License exams with comprehensive video lessons, PDFs, quizzes, and resources
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                size="lg" 
                variant="outline" 
                onClick={onLogin}
                data-testid="button-login"
                className="text-lg px-8"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose Us?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-elevate">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Comprehensive Content</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                DGCA-focused video lessons, PDFs, and interactive quizzes organized by subjects and chapters
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Trophy className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Test Your Knowledge</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice with quizzes and track your progress to excel in DGCA CPL & ATPL exams
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Expert Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access curated study materials, books, and notes specifically for DGCA exams
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Plane className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Career Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Prepare for your CPL/ATPL career with industry-relevant DGCA-aligned content
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Updates Section */}
      {updates.length > 0 && (
        <div className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Megaphone className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Latest Updates
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {updates.slice(0, 6).map((update) => (
              <Card 
                key={update.id} 
                className="hover-elevate"
                data-testid={`update-card-${update.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg" data-testid={`update-title-${update.id}`}>
                    {update.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {format(new Date(update.createdAt), "MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" data-testid={`update-content-${update.id}`}>
                    {update.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Choose Your Plan
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Select the plan that works best for you. All plans include full access to our DGCA CPL ATPL study materials.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`hover-elevate ${plan.durationMonths === 6 ? 'border-primary' : ''}`}
                data-testid={`card-plan-${plan.id}`}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.durationMonths === 6 && (
                    <div className="text-sm font-semibold text-primary">BEST VALUE</div>
                  )}
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <div className="text-sm text-muted-foreground mt-1">
                      ₹{Math.round(plan.price / plan.durationMonths)}/month
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Full access for {plan.durationMonths} {plan.durationMonths === 1 ? 'month' : 'months'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>All subjects covered</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Video lessons & PDFs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Interactive quizzes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Resource library access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Email support</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className="w-full mt-6" 
                    size="lg"
                    onClick={() => window.open(plan.razorpayLink, '_blank')}
                    data-testid={`button-select-plan-${plan.id}`}
                  >
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>After completing payment, you will receive your login credentials via email within 24 hours (may be delayed during rush periods).</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          {settings?.supportEmail && (
            <div className="mb-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <p data-testid="text-support-email">
                For any issues, email us at{' '}
                <a 
                  href={`mailto:${settings.supportEmail}`}
                  className="text-primary hover:underline"
                  data-testid="link-support-email"
                >
                  {settings.supportEmail}
                </a>
              </p>
            </div>
          )}
          <p className="text-muted-foreground">© 2024 Archer - DGCA CPL ATPL Guide. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
