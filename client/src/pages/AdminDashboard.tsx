import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import UserManagement from "@/components/UserManagement";
import SubjectManagement from "@/components/SubjectManagement";
import ResourceManagement from "@/components/ResourceManagement";
import AdminSettings from "@/components/AdminSettings";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'subjects' && <SubjectManagement />}
          {activeTab === 'resources' && <ResourceManagement />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}
