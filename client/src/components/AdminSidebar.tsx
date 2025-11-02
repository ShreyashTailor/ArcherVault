import { Users, BookOpen, FileText, Settings, LogOut, CreditCard, Megaphone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onHome?: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, onLogout, onHome }: AdminSidebarProps) {
  const tabs = [
    { id: 'plans', label: 'Plans', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'updates', label: 'Updates', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-sidebar-foreground">Archer</h1>
          <ThemeToggle />
        </div>
        <p className="text-sm text-muted-foreground">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => onTabChange(tab.id)}
              data-testid={`button-tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        {onHome && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={onHome}
            data-testid="button-home"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Button>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
