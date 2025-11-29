import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Radio, Typography, Space, message, Statistic } from 'antd';
import { MailOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { requestOTP, verifyOTP } from '../services/guestApi';

const { Text, Title } = Typography;
const { Countdown } = Statistic;

const GuestOTPModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify OTP
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [devOTP, setDevOTP] = useState(null); // For development

  useEffect(() => {
    if (!open) {
      // Reset when modal closes
      setStep(1);
      setIdentifier('');
      setOtpExpiry(null);
      setDevOTP(null);
      form.resetFields();
    }
  }, [open]);

  const handleRequestOTP = async (values) => {
    try {
      setLoading(true);
      const { identifier: id, type: verificationType, name } = values;

      const response = await requestOTP(id, verificationType);

      if (response.success) {
        setIdentifier(id);
        setType(verificationType);
        setStep(2);
        setOtpExpiry(Date.now() + response.data.expiresIn * 1000);

        // Store name for later use
        form.setFieldsValue({ name });

        // For development - show OTP in console
        if (response.data.otp) {
          setDevOTP(response.data.otp);
          console.log('Development OTP:', response.data.otp);
        }

        message.success(response.message);
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      message.error(error || 'Không thể gửi mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (values) => {
    try {
      setLoading(true);
      const { otp, name } = values;

      const response = await verifyOTP(identifier, otp, type, name);

      if (response.success && response.data) {
        // Store guest session token
        localStorage.setItem('guest-token', response.data.sessionToken);

        message.success(response.message);

        // Pass guest data to parent
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Close modal
        if (onCancel) {
          onCancel();
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      message.error(error || 'Mã OTP không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await requestOTP(identifier, type);

      if (response.success) {
        setOtpExpiry(Date.now() + response.data.expiresIn * 1000);

        if (response.data.otp) {
          setDevOTP(response.data.otp);
          console.log('Development OTP:', response.data.otp);
        }

        message.success('Đã gửi lại mã OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      message.error(error || 'Không thể gửi lại mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setIdentifier('');
    setOtpExpiry(null);
    setDevOTP(null);
  };

  return (
    <Modal
      title={step === 1 ? 'Đặt vé không cần đăng ký' : 'Xác thực OTP'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      {step === 1 ? (
        /* Step 1: Request OTP */
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRequestOTP}
          initialValues={{ type: 'email' }}
        >
          <div className="mb-4 bg-blue-50 p-4 rounded">
            <Text className="text-sm text-blue-800">
              💡 Đặt vé nhanh chóng không cần tạo tài khoản. Chỉ cần xác thực email hoặc số điện thoại.
            </Text>
          </div>

          <Form.Item name="name" label="Họ và tên (tùy chọn)">
            <Input
              size="large"
              placeholder="Nguyễn Văn A"
              prefix={<SafetyOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item name="type" label="Phương thức xác thực">
            <Radio.Group onChange={(e) => setType(e.target.value)}>
              <Radio value="email">Email</Radio>
              <Radio value="phone">Số điện thoại</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="identifier"
            label={type === 'email' ? 'Email' : 'Số điện thoại'}
            rules={[
              { required: true, message: `Vui lòng nhập ${type === 'email' ? 'email' : 'số điện thoại'}` },
              type === 'email'
                ? { type: 'email', message: 'Email không hợp lệ' }
                : { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input
              size="large"
              placeholder={type === 'email' ? 'email@example.com' : '0123456789'}
              prefix={
                type === 'email' ? (
                  <MailOutlined className="text-gray-400" />
                ) : (
                  <PhoneOutlined className="text-gray-400" />
                )
              }
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Gửi mã OTP
          </Button>
        </Form>
      ) : (
        /* Step 2: Verify OTP */
        <Form form={form} layout="vertical" onFinish={handleVerifyOTP}>
          <div className="mb-4 bg-green-50 p-4 rounded">
            <Text className="text-sm text-green-800">
              Mã OTP đã được gửi đến <strong>{identifier}</strong>
            </Text>
          </div>

          {devOTP && (
            <div className="mb-4 bg-yellow-50 p-4 rounded border border-yellow-200">
              <Text className="text-sm text-yellow-800">
                🔧 <strong>Development Mode:</strong> Mã OTP của bạn là: <strong className="text-lg">{devOTP}</strong>
              </Text>
            </div>
          )}

          <Form.Item
            name="otp"
            label="Mã OTP"
            rules={[
              { required: true, message: 'Vui lòng nhập mã OTP' },
              { pattern: /^[0-9]{6}$/, message: 'Mã OTP phải có 6 chữ số' },
            ]}
          >
            <Input
              size="large"
              placeholder="Nhập mã OTP 6 chữ số"
              maxLength={6}
              prefix={<SafetyOutlined className="text-gray-400" />}
            />
          </Form.Item>

          {otpExpiry && (
            <div className="mb-4 text-center">
              <Text className="text-sm text-gray-500">Mã OTP hết hạn sau:</Text>
              <div className="mt-2">
                <Countdown
                  value={otpExpiry}
                  format="mm:ss"
                  onFinish={() => message.warning('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.')}
                />
              </div>
            </div>
          )}

          <Space direction="vertical" className="w-full">
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Xác thực
            </Button>

            <div className="flex justify-between">
              <Button type="link" onClick={handleBack}>
                Quay lại
              </Button>
              <Button type="link" onClick={handleResendOTP} loading={loading}>
                Gửi lại mã OTP
              </Button>
            </div>
          </Space>
        </Form>
      )}
    </Modal>
  );
};

export default GuestOTPModal;
