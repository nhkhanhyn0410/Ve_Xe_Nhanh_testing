import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  CrownOutlined,
  DashboardOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import useAdminAuthStore from '../../store/adminAuthStore';
import { adminAuth } from '../../services/adminApi';

const AdminLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuthStore();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await adminAuth.login(values);

      // Response structure: { status, message, data: { user, accessToken, refreshToken } }
      if (response.status === 'success') {
        const { user, accessToken } = response.data;

        // Login with user data (role is already set by backend)
        login(user, accessToken);

        message.success('Đăng nhập thành công!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      message.error(error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-indigo-600/80 to-purple-800/90"></div>

        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <CrownOutlined className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white bg-gradient-to-r from-white via-purple-100 to-indigo-100 bg-clip-text text-transparent">
                  Vé xe nhanh
                </h1>
                <p className="text-white/80 text-sm">Quản trị hệ thống</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border-0 rounded-3xl overflow-hidden">
            {/* Card Header - Compact */}
            <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 -mx-6 -mt-6 mb-4 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SafetyOutlined className="text-lg text-white" />
                  <h2 className="text-xl font-bold text-white mb-0">Admin Login</h2>
                </div>
                {/* Feature badges inline */}
                <div className="flex gap-2">
                  {[
                    { icon: <DashboardOutlined />, text: 'Dashboard' },
                    { icon: <ControlOutlined />, text: 'Control' },
                    { icon: <SafetyOutlined />, text: 'Secure' }
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
                name="admin-login"
                onFinish={onFinish}
                layout="vertical"
                size="middle"
                autoComplete="off"
              >
                <Form.Item
                  name="email"
                  label={<span className="text-xs font-semibold text-gray-700">Email</span>}
                  rules={[
                    { required: true, message: 'Nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                  className="mb-3"
                >
                  <Input
                    prefix={<MailOutlined className="text-purple-500" />}
                    placeholder="admin@vexenhanh.com"
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-all"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-xs font-semibold text-gray-700">Mật khẩu</span>}
                  rules={[{ required: true, message: 'Nhập mật khẩu!' }]}
                  className="mb-4"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-purple-500" />}
                    placeholder="Nhập mật khẩu"
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-all"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    icon={<CrownOutlined />}
                    className="h-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <SafetyOutlined className="text-amber-600 text-sm mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-800 font-medium mb-1">Chú ý bảo mật</p>
                    <p className="text-xs text-amber-700">
                      Chỉ dành cho quản trị viên. Mọi hoạt động đều được ghi log.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="flex items-center justify-center pt-4 border-t border-gray-200 mt-4">
                <Link to="/" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                  ← Về trang chủ
                </Link>
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

export default AdminLoginPage;
