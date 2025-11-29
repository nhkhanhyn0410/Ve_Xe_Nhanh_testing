import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { MailOutlined, LockOutlined, CarOutlined, SafetyOutlined } from '@ant-design/icons';
import useOperatorAuthStore from '../../store/operatorAuthStore';
import { operatorAuth } from '../../services/operatorApi';

const { Title, Text } = Typography;

const OperatorLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useOperatorAuthStore();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await operatorAuth.login(values);

      // Response structure: { status, message, data: { operator, accessToken, refreshToken } }
      if (response.status === 'success') {
        const { operator, accessToken } = response.data;

        // Set user as operator role
        login({ ...operator, role: 'operator' }, accessToken);

        message.success('Đăng nhập thành công!');
        navigate('/operator/dashboard');
      }
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-accent-orange-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-32 left-32 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <CarOutlined className="text-4xl text-white" />
              </div>
              <Title level={1} className="text-white mb-4 text-4xl font-bold">
                Vé xe nhanh
              </Title>
              <Text className="text-primary-100 text-xl leading-relaxed">
                Hệ thống quản lý nhà xe hiện đại và chuyên nghiệp
              </Text>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <SafetyOutlined className="text-xl text-white" />
                </div>
                <div>
                  <Text className="text-white font-semibold block">Quản lý an toàn</Text>
                  <Text className="text-primary-200 text-sm">Theo dõi và quản lý chuyến xe một cách bảo mật</Text>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CarOutlined className="text-xl text-white" />
                </div>
                <div>
                  <Text className="text-white font-semibold block">Dễ dàng sử dụng</Text>
                  <Text className="text-primary-200 text-sm">Giao diện thân thiện, dễ sử dụng cho nhà xe</Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 shadow-lg">
                <CarOutlined className="text-2xl text-white" />
              </div>
              <Title level={2} className="text-neutral-800 mb-2">Vé xe nhanh</Title>
              <Text className="text-neutral-600">Operator Dashboard</Text>
            </div>

            {/* Login Card */}
            <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <Title level={2} className="text-neutral-800 mb-2">
                    Đăng nhập nhà xe
                  </Title>
                  <Text className="text-neutral-600">
                    Truy cập vào hệ thống quản lý của bạn
                  </Text>
                </div>

                <Form
                  name="operator-login"
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                  autoComplete="off"
                >
                  <Form.Item
                    name="email"
                    label={<Text className="text-neutral-700 font-medium">Email</Text>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="text-neutral-400" />}
                      placeholder="operator@example.com"
                      className="h-12 rounded-lg border-neutral-300 hover:border-primary-400 focus:border-primary-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={<Text className="text-neutral-700 font-medium">Mật khẩu</Text>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-neutral-400" />}
                      placeholder="Nhập mật khẩu"
                      className="h-12 rounded-lg border-neutral-300 hover:border-primary-400 focus:border-primary-500"
                    />
                  </Form.Item>

                  <Form.Item className="mb-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      className="h-12 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                  </Form.Item>
                </Form>

                <div className="text-center">
                  <Text className="text-neutral-600">
                    Chưa có tài khoản?{' '}
                    <Link
                      to="/operator/register"
                      className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                    >
                      Đăng ký ngay
                    </Link>
                  </Text>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="text-center mt-8">
              <Text className="text-neutral-500 text-sm">
                © 2024 Vé xe nhanh. All rights reserved.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorLoginPage;
