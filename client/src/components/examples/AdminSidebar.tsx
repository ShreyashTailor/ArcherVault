import { useState } from 'react';
import AdminSidebar from '../AdminSidebar';

export default function AdminSidebarExample() {
  const [activeTab, setActiveTab] = useState('users');
  
  return (
    <AdminSidebar
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => console.log('Logout clicked')}
    />
  );
}
