import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import useAuthStore from '../../store/authStore';
import customerApi from '../../services/customerApi';

const CustomerRegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, phoneNumber, name, ...rest } = values;

      // Transform data to match backend expectations
      const registerData = {
        ...rest,
        phone: phoneNumber, // Backend expects 'phone' not 'phoneNumber'
        fullName: name,     // Backend expects 'fullName' not 'name'
      };

      const response = await customerApi.register(registerData);

      // Response structure: { status, message, data: { user, accessToken, refreshToken } }
      if (response.status === 'success') {
        const { user, accessToken } = response.data;

        // Auto login after successful registration
        login({ ...user, role: 'customer' }, accessToken);

        message.success('Đăng ký thành công! Chào mừng bạn đến với QuikRide.');
        navigate('/');
      }
    } catch (error) {
      message.error(error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    message.info('Tính năng đăng ký Google đang được phát triển');
  };

  const handleFacebookRegister = async () => {
    message.info('Tính năng đăng ký Facebook đang được phát triển');
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
          <p className="text-gray-600">Tạo tài khoản để bắt đầu đặt vé</p>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Đăng Ký
          </h2>

          <Form
            form={form}
            name="customer-register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên!' },
                { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Nguyễn Văn A"
              />
            </Form.Item>

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
              name="phoneNumber"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Số điện thoại phải có 10 chữ số!'
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="0912345678"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập lại mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-blue-600 hover:bg-blue-700 h-10"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>Hoặc đăng ký với</Divider>

          <div className="grid grid-cols-2 gap-4">
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleRegister}
              className="h-10"
            >
              Google
            </Button>
            <Button
              icon={<FacebookOutlined />}
              onClick={handleFacebookRegister}
              className="h-10"
            >
              Facebook
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Đăng nhập ngay
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

export default CustomerRegisterPage;
