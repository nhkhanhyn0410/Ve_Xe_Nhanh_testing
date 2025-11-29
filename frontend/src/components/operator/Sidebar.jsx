import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  CarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  BarChartOutlined,
  GiftOutlined,
  CalendarOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

import Icon from "../../components/icon";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: 'dashboard',
      path: '/operator/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'routes',
      path: '/operator/routes',
      icon: <EnvironmentOutlined />,
      label: 'Tuyến Đường',
    },
    {
      key: 'buses',
      path: '/operator/buses',
      icon: <CarOutlined />,
      label: 'Quản Lý Xe',
    },
    {
      key: 'trips',
      path: '/operator/trips',
      icon: <CalendarOutlined />,
      label: 'Chuyến Xe',
    },
    {
      key: 'employees',
      path: '/operator/employees',
      icon: <TeamOutlined />,
      label: 'Nhân Viên',
    },
    {
      key: 'reports',
      path: '/operator/reports',
      icon: <BarChartOutlined />,
      label: 'Báo Cáo',
    },
    {
      key: 'vouchers',
      path: '/operator/vouchers',
      icon: <GiftOutlined />,
      label: 'Voucher',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-full bg-gradient-to-b from-red-900 via-red-800 to-red-900 text-white flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-orange-600/20"></div>
      </div>
      
      {/* Logo */}
      <div className="p-6 border-b border-blue-700/50">
        <Link to="/operator/dashboard" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-b from-red-900 via-red-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <span className="text-2xl"><Icon name="Bus" className="text-white"/></span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Vé xe nhanh</h1>
            <p className="text-xs text-blue-300">Operator Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={`
              relative flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 group overflow-hidden
              ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-white shadow-lg border border-blue-500/30'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {/* Active indicator */}
            {isActive(item.path) && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-r"></div>
            )}

            <span 
              className={`text-xl transition-all duration-300 group-hover:scale-110 ${
                isActive(item.path) ? 'text-cyan-300' : 'text-blue-300 group-hover:text-cyan-300'
              }`}
            >
              {item.icon}
            </span>
            <span className={`font-medium transition-colors ${
              isActive(item.path) ? 'text-white' : 'text-blue-100'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Quick Stats */}
      

      {/* Footer */}
      <div className="relative p-4 border-t border-blue-700/50">
        <p className="text-xs text-blue-300 text-center">
          
        </p>
        <p className="text-xs text-blue-400 text-center mt-1">
          Operator Panel
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
