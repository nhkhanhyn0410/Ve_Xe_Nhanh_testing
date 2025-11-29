import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminDashboardLayout = () => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar - Fixed width */}
      <aside className="w-64 flex-shrink-0">
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
