import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginForm from "@/components/LoginForm";
import UserDashboard from "@/pages/UserDashboard";
import ChapterContent from "@/pages/ChapterContent";
import AdminDashboard from "@/pages/AdminDashboard";
import ResourcesPage from "@/pages/ResourcesPage";

type View = 'login' | 'user-dashboard' | 'chapter-content' | 'admin-dashboard' | 'resources';

interface CurrentUser {
  id: string;
  username: string;
  isAdmin: boolean;
  validUntil: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
          setCurrentView(user.isAdmin ? 'admin-dashboard' : 'user-dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const user = await response.json();
      setCurrentUser(user);
      setCurrentView(user.isAdmin ? 'admin-dashboard' : 'user-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setCurrentView('login');
      setSelectedSubject(null);
    }
  };

  const handleSubjectClick = (subjectId: string, subjectName: string) => {
    setSelectedSubject({ id: subjectId, name: subjectName });
    setCurrentView('chapter-content');
  };

  const handleBackToSubjects = () => {
    setCurrentView('user-dashboard');
    setSelectedSubject(null);
  };

  const handleResourcesClick = () => {
    setCurrentView('resources');
  };

  const handleBackFromResources = () => {
    setCurrentView('user-dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {currentView === 'login' && (
          <LoginForm onLogin={handleLogin} />
        )}

        {currentView === 'user-dashboard' && (
          <UserDashboard
            onSubjectClick={handleSubjectClick}
            onResourcesClick={handleResourcesClick}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'chapter-content' && selectedSubject && (
          <ChapterContent
            subjectId={selectedSubject.id}
            subjectName={selectedSubject.name}
            onBack={handleBackToSubjects}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard onLogout={handleLogout} />
        )}

        {currentView === 'resources' && (
          <ResourcesPage onBack={handleBackFromResources} />
        )}

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
