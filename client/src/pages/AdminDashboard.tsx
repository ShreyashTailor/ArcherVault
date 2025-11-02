import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import UserManagement from "@/components/UserManagement";
import SubjectManagement from "@/components/SubjectManagement";
import ResourceManagement from "@/components/ResourceManagement";
import PlanManagement from "@/components/PlanManagement";
import AdminSettings from "@/components/AdminSettings";
import GeneralSettings from "@/components/GeneralSettings";
import UpdatesManagement from "@/components/UpdatesManagement";

interface AdminDashboardProps {
  onLogout: () => void;
  onHome?: () => void;
}

export default function AdminDashboard({ onLogout, onHome }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('plans');

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onHome={onHome}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {activeTab === 'plans' && <PlanManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'subjects' && <SubjectManagement />}
          {activeTab === 'resources' && <ResourceManagement />}
          {activeTab === 'updates' && <UpdatesManagement />}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Settings</h2>
              <GeneralSettings />
              <AdminSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
