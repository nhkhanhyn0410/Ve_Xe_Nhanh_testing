import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Row, Col } from 'antd';
import {
  ShopOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Bus } from 'lucide-react';
import useOperatorAuthStore from '../../store/operatorAuthStore';
import { operatorAuth } from '../../services/operatorApi';

const OperatorRegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useOperatorAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = values;

      const response = await operatorAuth.register(registerData);

      // Response structure: { status, message, data: { operator, accessToken, refreshToken } }
      if (response.status === 'success') {
        const { operator, accessToken } = response.data;

        // Auto login after successful registration
        login({ ...operator, role: 'operator' }, accessToken);

        message.success('Đăng ký thành công! Tài khoản của bạn đang chờ xét duyệt.');
        navigate('/operator/dashboard');
      }
    } catch (error) {
      message.error(error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-3xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Bus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vé xe nhanh</h1>
          <p className="text-gray-600">Đăng ký làm đối tác nhà xe</p>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Đăng Ký Nhà Xe
          </h2>

          <Form
            form={form}
            name="operator-register"
            onFinish={onFinish}
            layout="vertical"
            requiredMark="optional"
            size="large"
          >
            <Row gutter={16}>
              {/* Company Information */}
              <Col xs={24}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Thông tin công ty
                  </h3>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên công ty"
                  name="companyName"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên công ty!' },
                    { min: 3, message: 'Tên công ty phải có ít nhất 3 ký tự' },
                  ]}
                >
                  <Input
                    prefix={<ShopOutlined className="text-gray-400" />}
                    placeholder="VD: Công ty TNHH Vận tải ABC"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Email công ty"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="email@congty.com"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: 'Số điện thoại phải có 10-11 chữ số!',
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="0901234567"
                  />
                </Form.Item>
              </Col>

              {/* Business Documents */}
              <Col xs={24}>
                <div className="mb-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Giấy tờ kinh doanh
                  </h3>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Giấy phép kinh doanh"
                  name="businessLicense"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số giấy phép kinh doanh!' },
                  ]}
                >
                  <Input
                    prefix={<SafetyCertificateOutlined className="text-gray-400" />}
                    placeholder="Số giấy phép kinh doanh"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Mã số thuế"
                  name="taxCode"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã số thuế!' },
                    {
                      pattern: /^[0-9]{10}(-[0-9]{3})?$/,
                      message: 'Mã số thuế không hợp lệ!',
                    },
                  ]}
                >
                  <Input
                    prefix={<BankOutlined className="text-gray-400" />}
                    placeholder="0123456789"
                  />
                </Form.Item>
              </Col>

              {/* Account Security */}
              <Col xs={24}>
                <div className="mb-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Bảo mật tài khoản
                  </h3>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
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
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập lại mật khẩu"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Submit Button */}
            <Form.Item className="mt-6 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
              >
                Đăng Ký
              </Button>
            </Form.Item>

            {/* Login Link */}
            <div className="text-center text-gray-600 mt-4">
              Đã có tài khoản?{' '}
              <Link
                to="/operator/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Đăng nhập ngay
              </Link>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Tài khoản của bạn sẽ được quản trị viên xét duyệt trong
                vòng 24-48 giờ. Bạn sẽ nhận được thông báo qua email sau khi tài khoản được
                phê duyệt.
              </p>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default OperatorRegisterPage;
