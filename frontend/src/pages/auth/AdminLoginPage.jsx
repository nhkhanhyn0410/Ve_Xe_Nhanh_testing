import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <SafetyOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vé xe nhanh Admin</h1>
          <p className="text-gray-600">System Administration Portal</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
            </div>
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Admin Login
            </h2>
            <p className="text-center text-gray-500 text-sm mt-2">
              Vui lòng đăng nhập để truy cập hệ thống quản trị
            </p>
          </div>

          <Form
            name="admin-login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="admin@vexenhanh.com"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 rounded-lg font-semibold text-base shadow-lg"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </Button>
            </Form.Item>
          </Form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <SafetyOutlined className="text-amber-600 text-lg mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Chú ý bảo mật
                </p>
                <p className="text-xs text-amber-700">
                  Chỉ dành cho quản trị viên hệ thống. Mọi hoạt động đều được ghi log.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            ← Về trang chủ
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          . All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
