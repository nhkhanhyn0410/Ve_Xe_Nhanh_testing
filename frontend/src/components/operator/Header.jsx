import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Dropdown, Avatar, Badge, Typography, Breadcrumb, Space } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  DashboardOutlined,
  HomeOutlined,
  CarOutlined,
} from '@ant-design/icons';
import useOperatorAuthStore from '../../store/operatorAuthStore';
import { dashboardApi } from '../../services/operatorApi';

const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { operator: user, logout } = useOperatorAuthStore();
  const [stats, setStats] = useState({
    todayTrips: 0,
    todayRevenue: 0,
  });

  // Fetch today's quick stats
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const response = await dashboardApi.getStats({ period: 'day' });
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          setStats({
            todayTrips: data.trips?.total || 0,
            todayRevenue: data.revenue?.totalRevenue || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching quick stats:', error);
        // Keep default values on error
      }
    };

    if (user) {
      fetchQuickStats();
      // Refresh every 5 minutes
      const interval = setInterval(fetchQuickStats, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/operator/login');
  };

  // Format currency for display
  const formatRevenue = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString('vi-VN');
  };

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [
      {
        title: (
          <span className="flex items-center gap-1">
            <HomeOutlined />
            Operator
          </span>
        ),
      },
    ];

    if (pathSegments.length > 1) {
      const pageName = pathSegments[1];
      const pageNames = {
        dashboard: 'Dashboard',
        routes: 'Tuyến đường',
        buses: 'Quản lý xe',
        trips: 'Chuyến xe',
        employees: 'Nhân viên',
        reports: 'Báo cáo',
        vouchers: 'Voucher',
        reviews: 'Đánh giá',
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
      label: 'Thông tin công ty',
      onClick: () => navigate('/operator/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/operator/settings'),
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
            <CarOutlined className="text-white text-lg" />
          </div>
          <div>
            <Breadcrumb
              items={getBreadcrumbItems()}
              className="text-sm"
            />
            <Text className="text-xs text-neutral-500 block mt-1">
              {user?.companyName || 'Nhà xe đối tác'}
            </Text>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <Text className="text-red-700 text-xs font-medium">
                {stats.todayTrips} chuyến hôm nay
              </Text>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Text className="text-green-700 text-xs font-medium">
                Doanh thu: {formatRevenue(stats.todayRevenue)}đ
              </Text>
            </div>
          </div>

          {/* Notifications */}
          <Badge count={2} size="small">
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
            onClick={() => navigate('/operator/settings')}
            className="hover:bg-neutral-100 w-10 h-10 rounded-lg flex items-center justify-center"
          />

          {/* User Menu */}
          <Dropdown 
            menu={{ items: menuItems }} 
            placement="bottomRight"
            trigger={['click']}
            overlayClassName="min-w-[220px]"
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
                  {user?.companyName || 'Nhà xe'}
                </div>
                <div className="text-xs text-neutral-500">
                  {user?.email}
                </div>
              </div>
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
