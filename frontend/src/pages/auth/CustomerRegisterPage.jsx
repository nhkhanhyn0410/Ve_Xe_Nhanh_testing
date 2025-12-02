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

      <div className="relative flex items-center justify-center min-h-screen p-4 py-6">
        <div className="w-full max-w-4xl">
          {/* Logo and Title - Compact */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                <ThunderboltOutlined className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent">
                  Vé xe nhanh
                </h1>
                <p className="text-white/80 text-sm">Tạo tài khoản để bắt đầu đặt vé</p>
              </div>
            </div>
          </div>

          {/* Register Card */}
          <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border-0 rounded-3xl overflow-hidden">
            {/* Card Header - Compact */}
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 -mx-6 -mt-6 mb-4 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-lg text-white" />
                  <h2 className="text-xl font-bold text-white mb-0">Đăng Ký</h2>
                </div>
                {/* Feature badges inline */}
                <div className="flex gap-2">
                  {[
                    { icon: <ThunderboltOutlined />, text: 'Nhanh' },
                    { icon: <SafetyOutlined />, text: 'An toàn' },
                    { icon: <GiftOutlined />, text: 'Ưu đãi' }
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
                name="customer-register"
                onFinish={onFinish}
                layout="vertical"
                size="middle"
                autoComplete="off"
              >
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="name"
                    label={<span className="text-xs font-semibold text-gray-700">Họ và tên</span>}
                    rules={[
                      { required: true, message: 'Nhập họ tên!' },
                      { min: 2, message: 'Tối thiểu 2 ký tự!' },
                    ]}
                    className="mb-3"
                  >
                    <Input
                      prefix={<UserOutlined className="text-red-500" />}
                      placeholder="Nguyễn Văn A"
                      className="h-10 rounded-lg border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all"
                    />
                  </Form.Item>

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
                      prefix={<MailOutlined className="text-red-500" />}
                      placeholder="example@email.com"
                      className="h-10 rounded-lg border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all"
                    />
                  </Form.Item>
                </div>

                {/* Row 2: Phone & Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="phoneNumber"
                    label={<span className="text-xs font-semibold text-gray-700">Số điện thoại</span>}
                    rules={[
                      { required: true, message: 'Nhập SĐT!' },
                      { pattern: /^[0-9]{10}$/, message: 'SĐT phải 10 chữ số!' }
                    ]}
                    className="mb-3"
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-red-500" />}
                      placeholder="0912345678"
                      className="h-10 rounded-lg border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={<span className="text-xs font-semibold text-gray-700">Mật khẩu</span>}
                    rules={[
                      { required: true, message: 'Nhập mật khẩu!' },
                      { min: 6, message: 'Tối thiểu 6 ký tự!' },
                      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Có chữ thường, HOA và số!' }
                    ]}
                    hasFeedback
                    className="mb-3"
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-red-500" />}
                      placeholder="Password123"
                      className="h-10 rounded-lg border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all"
                    />
                  </Form.Item>
                </div>

                {/* Row 3: Confirm Password */}
                <Form.Item
                  name="confirmPassword"
                  label={<span className="text-xs font-semibold text-gray-700">Xác nhận mật khẩu</span>}
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                      },
                    }),
                  ]}
                  className="mb-3"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-red-500" />}
                    placeholder="Nhập lại mật khẩu"
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all"
                  />
                </Form.Item>

                {/* Submit Button & Social Login */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<ThunderboltOutlined />}
                    className="h-10 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? 'Đăng ký...' : 'Đăng Ký'}
                  </Button>

                  <Button
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleRegister}
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all"
                  >
                    Google
                  </Button>

                  <Button
                    icon={<FacebookOutlined />}
                    onClick={handleFacebookRegister}
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    Facebook
                  </Button>
                </div>
              </Form>

              {/* Footer Links */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  ← Trang chủ
                </Link>
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-red-600 hover:text-red-700 font-bold">
                    Đăng nhập
                  </Link>
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

export default CustomerRegisterPage;
