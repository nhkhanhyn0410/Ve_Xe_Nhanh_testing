import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import useAuthStore from '../../store/authStore';
import customerApi from '../../services/customerApi';

const CustomerLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Transform email to identifier for backend
      const loginData = {
        identifier: values.email,
        password: values.password,
      };

      const response = await customerApi.login(loginData);

      // Response structure: { status, message, data: { user, accessToken, refreshToken } }
      if (response.status === 'success') {
        const { user, accessToken } = response.data;

        // Set user as customer role
        login({ ...user, role: 'customer' }, accessToken);

        message.success('Đăng nhập thành công!');

        // Redirect to previous page or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      message.error(error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    message.info('Tính năng đăng nhập Google đang được phát triển');
  };

  const handleFacebookLogin = async () => {
    message.info('Tính năng đăng nhập Facebook đang được phát triển');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-3xl">🚌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">QuikRide</h1>
          <p className="text-gray-600">Đăng nhập để đặt vé và quản lý chuyến đi</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Đăng Nhập
          </h2>

          <Form
            name="customer-login"
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
                placeholder="example@email.com"
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
              />
            </Form.Item>

            <div className="text-right mb-4">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-blue-600 hover:bg-blue-700 h-10"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>Hoặc đăng nhập với</Divider>

          <div className="grid grid-cols-2 gap-4">
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              className="h-10"
            >
              Google
            </Button>
            <Button
              icon={<FacebookOutlined />}
              onClick={handleFacebookLogin}
              className="h-10"
            >
              Facebook
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Về trang chủ
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2024 QuikRide. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
