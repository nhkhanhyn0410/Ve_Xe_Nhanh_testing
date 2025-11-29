import { Link, useLocation } from 'react-router-dom';
import { Badge, Typography, Tooltip } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  SafetyOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: 'dashboard',
      path: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      description: 'Tổng quan hệ thống',
      badge: null,
    },
    {
      key: 'users',
      path: '/admin/users',
      icon: <UserOutlined />,
      label: 'Người Dùng',
      description: 'Quản lý users',
      badge: null,
    },
    {
      key: 'operators',
      path: '/admin/operators',
      icon: <ShopOutlined />,
      label: 'Nhà Xe',
      description: 'Duyệt & quản lý',
      badge: 3, // Pending approvals
    },
    {
      key: 'complaints',
      path: '/admin/complaints',
      icon: <CustomerServiceOutlined />,
      label: 'Khiếu Nại',
      description: 'Xử lý khiếu nại',
      badge: 5, // New complaints
    },
    {
      key: 'content',
      path: '/admin/content',
      icon: <FileTextOutlined />,
      label: 'Nội Dung',
      description: 'Banners, Blogs, FAQs',
      badge: null,
    },
    {
      key: 'reports',
      path: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Báo Cáo',
      description: 'Thống kê & phân tích',
      badge: null,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"></div>
      </div>

      {/* Logo */}
      <div className="relative p-6 border-b border-slate-700/50">
        <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-all duration-300">
            <SafetyOutlined className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Vé xe nhanh Admin</h1>
            <p className="text-xs text-slate-400">System Administration</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Tooltip
            key={item.key}
            title={item.description}
            placement="right"
            mouseEnterDelay={0.5}
          >
            <Link
              to={item.path}
              className={`
                relative block px-4 py-4 rounded-xl transition-all duration-300 group overflow-hidden
                ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-white shadow-lg border border-primary-500/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-purple-500 rounded-r"></div>
              )}

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <span
                    className={`text-xl transition-all duration-300 group-hover:scale-110 ${
                      isActive(item.path) ? 'text-primary-400' : 'text-slate-400 group-hover:text-primary-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.badge && (
                    <Badge
                      count={item.badge}
                      size="small"
                      className="absolute -top-1 -right-1"
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium transition-colors ${
                    isActive(item.path) ? 'text-white' : 'text-slate-200'
                  }`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-400 opacity-80 truncate">
                    {item.description}
                  </div>
                </div>
              </div>
            </Link>
          </Tooltip>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="relative p-4 border-t border-slate-700/50">
        <div className="space-y-3">
          {/* System Status */}
          <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs text-slate-400 font-medium">System Status</Text>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Text className="text-xs text-green-400 font-medium">Online</Text>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Text className="text-slate-500">Uptime: 99.9%</Text>
              <Text className="text-slate-500">Load: 23%</Text>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Tooltip title="Notifications">
              <button className="flex-1 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-700/30">
                <BellOutlined className="text-slate-400 hover:text-primary-400 transition-colors" />
              </button>
            </Tooltip>
            <Tooltip title="Settings">
              <button className="flex-1 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-700/30">
                <SettingOutlined className="text-slate-400 hover:text-primary-400 transition-colors" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative p-4 border-t border-slate-700/50">
        <Text className="text-xs text-slate-500 text-center block">
           Admin Panel
        </Text>
        <Text className="text-xs text-slate-600 text-center block mt-1">
          Version 2.1.0
        </Text>
      </div>
    </div>
  );
};

export default AdminSidebar;
