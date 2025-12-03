import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CarOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import useTripManagerAuthStore from '../../store/tripManagerAuthStore';
import api from '../../services/api';

const TripManagerLoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useTripManagerAuthStore();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // Employee login endpoint
      const response = await api.post('/employees/login', {
        employeeCode: values.employeeCode,
        password: values.password,
      });

      if (response.status === 'success') {
        const { token, employee } = response.data;

        // Check if user is trip_manager or driver
        if (employee.role !== 'trip_manager' && employee.role !== 'driver') {
          message.error('Bạn không có quyền truy cập trang này');
          return;
        }

        // Store auth data - login(user, token) not login(token, user)
        login({
          ...employee,
          role: employee.role, // Keep original role (trip_manager or driver)
        }, token);

        message.success('Đăng nhập thành công');
        navigate('/trip-manager/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-600/80 to-blue-800/90"></div>

        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

          <div className="absolute top-32 right-20 w-32 h-32 border border-white/10 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 left-20 w-24 h-24 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-white/5 rounded-lg rotate-12 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4 py-6">
        <div className="w-full max-w-lg">
          {/* Logo and Title - Compact */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <CarOutlined className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                  Vé xe nhanh
                </h1>
                <p className="text-white/80 text-sm">Nhân viên</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border-0 rounded-3xl overflow-hidden">
            {/* Card Header - Compact */}
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 -mx-6 -mt-6 mb-4 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-lg text-white" />
                  <h2 className="text-xl font-bold text-white mb-0">Đăng Nhập</h2>
                </div>
                {/* Feature badges inline */}
                <div className="flex gap-2">
                  {[
                    { icon: <CheckCircleOutlined />, text: 'Soát vé' },
                    { icon: <ClockCircleOutlined />, text: 'Real-time' },
                    { icon: <SafetyOutlined />, text: 'An toàn' }
                  ].map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
                    >
                      <span className="text-white text-xs">{badge.icon}</span>
                      <span className="text-xs font-semibold text-white hidden sm:inline">{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <Form
                form={form}
                name="trip-manager-login"
                onFinish={handleLogin}
                layout="vertical"
                size="middle"
                autoComplete="off"
              >
                <Form.Item
                  name="employeeCode"
                  label={<span className="text-xs font-semibold text-gray-700">Mã nhân viên</span>}
                  rules={[{ required: true, message: 'Nhập mã nhân viên!' }]}
                  className="mb-3"
                >
                  <Input
                    prefix={<UserOutlined className="text-blue-500" />}
                    placeholder="VD: EMP001"
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-all"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-xs font-semibold text-gray-700">Mật khẩu</span>}
                  rules={[{ required: true, message: 'Nhập mật khẩu!' }]}
                  className="mb-4"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-blue-500" />}
                    placeholder="Nhập mật khẩu"
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-all"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    icon={<CarOutlined />}
                    className="h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Footer Links */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  ← Trang chủ
                </Link>
                <p className="text-xs text-gray-500">
                  Liên hệ quản lý để được hỗ trợ
                </p>
              </div>
            </div>
          </Card>

          {/* Footer - Compact */}
          <p className="text-center text-xs text-white/60 mt-3">
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripManagerLoginPage;
