import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Dropdown, Avatar, Badge, Typography, Breadcrumb } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  SafetyOutlined,
  DashboardOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import useAdminAuthStore from '../../store/adminAuthStore';

const { Text } = Typography;

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin: user, logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [
      {
        title: (
          <span className="flex items-center gap-1">
            <HomeOutlined />
            Admin
          </span>
        ),
      },
    ];

    if (pathSegments.length > 1) {
      const pageName = pathSegments[1];
      const pageNames = {
        dashboard: 'Dashboard',
        users: 'Quản lý người dùng',
        operators: 'Quản lý nhà xe',
        complaints: 'Khiếu nại',
        content: 'Quản lý nội dung',
        reports: 'Báo cáo',
      };
      
      items.push({
        title: pageNames[pageName] || pageName,
      });
    }

    return items;
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt hệ thống',
      onClick: () => navigate('/admin/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-neutral-200 px-6 py-4 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left Side - Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <SafetyOutlined className="text-white text-lg" />
          </div>
          <div>
            <Breadcrumb
              items={getBreadcrumbItems()}
              className="text-sm"
            />
            <Text className="text-xs text-neutral-500 block mt-1">
              Quản trị hệ thống Vé xe nhanh
            </Text>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Text className="text-green-700 text-xs font-medium">
              Hệ thống hoạt động bình thường
            </Text>
          </div>

          {/* Notifications */}
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined className="text-lg" />}
              className="hover:bg-neutral-100 w-10 h-10 rounded-lg flex items-center justify-center"
            />
          </Badge>

          {/* Settings */}
          <Button
            type="text"
            icon={<SettingOutlined className="text-lg" />}
            onClick={() => navigate('/admin/settings')}
            className="hover:bg-neutral-100 w-10 h-10 rounded-lg flex items-center justify-center"
          />

          {/* User Menu */}
          <Dropdown 
            menu={{ items: menuItems }} 
            placement="bottomRight"
            trigger={['click']}
            overlayClassName="min-w-[200px]"
          >
            <Button
              type="text"
              className="flex items-center space-x-3 hover:bg-neutral-100 h-auto px-3 py-2 rounded-lg transition-all duration-200"
            >
              <Avatar
                size={36}
                icon={<UserOutlined />}
                className="bg-gradient-to-br from-primary-500 to-red-600 shadow-md"
              />
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-neutral-800">
                  {user?.fullName || user?.email || 'Administrator'}
                </div>
                <div className="text-xs text-neutral-500 flex items-center space-x-1">
                  <SafetyOutlined className="text-xs" />
                  <span>Super Admin</span>
                </div>
              </div>
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
