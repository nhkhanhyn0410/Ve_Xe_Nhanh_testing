import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, GoogleOutlined, FacebookOutlined, ThunderboltOutlined, SafetyOutlined, GiftOutlined } from '@ant-design/icons';
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

        message.success('Đăng ký thành công! Chào mừng bạn đến với Vé xe nhanh.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-orange-900 text-white overflow-hidden relative">
      {/* Animated Background như homepage */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-red-600/80 to-orange-600/90"></div>
        
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-red-400/20 to-orange-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          
          <div className="absolute top-32 right-20 w-32 h-32 border border-white/10 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 left-20 w-24 h-24 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-white/5 rounded-lg rotate-12 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-red-600 rounded-3xl mb-6 shadow-2xl">
              <ThunderboltOutlined className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3 bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent">
              Vé xe nhanh
            </h1>
            <p className="text-white/90 text-lg">Tạo tài khoản để bắt đầu đặt vé</p>
            
            {/* Feature badges */}
            <div className="flex justify-center gap-3 mt-6">
              {[
                { icon: <ThunderboltOutlined />, text: 'Đặt vé nhanh' },
                { icon: <SafetyOutlined />, text: 'An toàn' },
                { icon: <GiftOutlined />, text: 'Ưu đãi' }
              ].map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg"
                >
                  <span className="text-white text-sm">{badge.icon}</span>
                  <span className="text-xs font-semibold tracking-wide text-white">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Register Card */}
          <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border-0 rounded-3xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 -mx-6 -mt-6 mb-6 px-8 py-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <UserOutlined className="text-xl text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-0">
                  Đăng Ký
                </h2>
              </div>
            </div>

            <div className="px-8 pb-8">

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
                  label={<span className="text-sm font-semibold text-gray-700">Họ và tên</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-red-500" />}
                    placeholder="Nguyễn Văn A"
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="text-sm font-semibold text-gray-700">Email</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-red-500" />}
                    placeholder="example@email.com"
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label={<span className="text-sm font-semibold text-gray-700">Số điện thoại</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: 'Số điện thoại phải có 10 chữ số!'
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-red-500" />}
                    placeholder="0912345678"
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-sm font-semibold text-gray-700">Mật khẩu</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ HOA và 1 số!'
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-red-500" />}
                    placeholder="Ví dụ: Password123"
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={<span className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu</span>}
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
                    prefix={<LockOutlined className="text-red-500" />}
                    placeholder="Nhập lại mật khẩu"
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    icon={<ThunderboltOutlined />}
                    className="h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {loading ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}
                  </Button>
                </Form.Item>
              </Form>

              <Divider plain className="text-gray-500">Hoặc đăng ký với</Divider>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  icon={<GoogleOutlined />}
                  onClick={handleGoogleRegister}
                  className="h-12 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
                >
                  Google
                </Button>
                <Button
                  icon={<FacebookOutlined />}
                  onClick={handleFacebookRegister}
                  className="h-12 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  Facebook
                </Button>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/login"
                    className="text-red-600 hover:text-red-700 font-bold"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>

              <div className="text-center mt-4">
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-300"
                >
                  ← Về trang chủ
                </Link>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-white/70 mt-8">
            . All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegisterPage;
