import { useState } from 'react';
import { Form, Input, Button, Card, message, Result, Steps, Modal } from 'antd';
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../services/bookingApi';
import CustomerLayout from '../components/layouts/CustomerLayout';

const { TextArea } = Input;

const CancelTicketPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSearchBooking = async (values) => {
    setLoading(true);
    try {
      // First, verify the booking exists and matches the email/phone
      // For now, we'll go straight to confirmation
      setBookingInfo(values);
      setCurrentStep(1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không tìm thấy mã đặt vé');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    Modal.confirm({
      title: 'Xác nhận hủy vé',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn hủy vé này không?</p>
          <p className="text-gray-600 text-sm mt-2">
            • Tiền sẽ được hoàn lại theo chính sách hủy vé
          </p>
          <p className="text-gray-600 text-sm">
            • Thời gian hoàn tiền: 3-7 ngày làm việc
          </p>
          <p className="text-gray-600 text-sm">
            • Bạn sẽ nhận được email xác nhận hủy vé
          </p>
        </div>
      ),
      okText: 'Xác nhận hủy',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        try {
          const response = await bookingApi.cancelBookingGuest({
            bookingId: bookingInfo.bookingId,
            email: bookingInfo.email,
            phone: bookingInfo.phone,
            reason: bookingInfo.reason,
          });

          if (response.status === 'success') {
            setCancellationSuccess(true);
            setCurrentStep(2);
            message.success('Hủy vé thành công!');
          }
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể hủy vé. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const steps = [
    {
      title: 'Nhập thông tin',
      icon: <SearchOutlined />,
    },
    {
      title: 'Xác nhận hủy vé',
      icon: <ExclamationCircleOutlined />,
    },
    {
      title: 'Hoàn tất',
      icon: cancellationSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
    },
  ];

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Hủy Vé</h1>
            <p className="text-gray-600">
              Nhập thông tin đặt vé của bạn để hủy
            </p>
          </div>

          <Steps current={currentStep} items={steps} className="mb-8" />

          {currentStep === 0 && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearchBooking}
              autoComplete="off"
            >
              <Form.Item
                label="Mã đặt vé"
                name="bookingId"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã đặt vé' },
                  { len: 24, message: 'Mã đặt vé không hợp lệ' },
                ]}
              >
                <Input
                  placeholder="Nhập mã đặt vé (24 ký tự)"
                  size="large"
                  maxLength={24}
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    type: 'email',
                    message: 'Email không hợp lệ',
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email đặt vé"
                  size="large"
                  type="email"
                />
              </Form.Item>

              <div className="text-center text-gray-500 my-4">HOẶC</div>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  {
                    pattern: /^[0-9]{10}$/,
                    message: 'Số điện thoại phải có 10 chữ số',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại đặt vé"
                  size="large"
                  maxLength={10}
                />
              </Form.Item>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Nhập mã đặt vé và email HOẶC số điện thoại mà bạn đã sử dụng khi đặt vé.
                </p>
              </div>

              <Form.Item
                label="Lý do hủy (tùy chọn)"
                name="reason"
              >
                <TextArea
                  placeholder="Nhập lý do hủy vé (nếu có)"
                  rows={3}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  icon={<SearchOutlined />}
                >
                  Tiếp tục
                </Button>
              </Form.Item>

              <div className="text-center mt-4">
                <Button type="link" onClick={() => navigate('/')}>
                  Quay về trang chủ
                </Button>
              </div>
            </Form>
          )}

          {currentStep === 1 && bookingInfo && (
            <div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ExclamationCircleOutlined className="mr-2 text-yellow-600" />
                  Chính sách hoàn tiền khi hủy vé
                </h3>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-green-600">✓ HOÀN 100% TIỀN VÉ</div>
                    <div className="text-sm text-gray-600 mt-1">Nếu hủy vé TRƯỚC 2 GIỜ khởi hành</div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center justify-center">
                      <span className="text-green-500 mr-2 text-xl">✓</span>
                      <span className="text-base">Hủy trước <strong className="text-lg">2 giờ</strong> khởi hành: Hoàn <strong className="text-green-600 text-lg">100%</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">⚠ VẪN HỦY ĐƯỢC - KHÔNG HOÀN TIỀN</div>
                    <div className="text-sm text-gray-700 mt-2">
                      • Hủy trong vòng <strong className="text-orange-600">2 GIỜ</strong> trước giờ khởi hành<br/>
                      • Vé sẽ được hủy và ghế được nhả ra<br/>
                      • <strong className="text-orange-600">KHÔNG được hoàn tiền</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">✗ KHÔNG THỂ HỦY</div>
                    <div className="text-sm text-gray-700 mt-2">
                      • Chuyến xe <strong className="text-red-600">ĐÃ KHỞI HÀNH</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-600 text-center">
                  Tiền hoàn sẽ được chuyển về tài khoản trong 3-7 ngày làm việc
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Thông tin đặt vé:</h4>
                <p className="text-sm text-gray-600">Mã đặt vé: <span className="font-mono">{bookingInfo.bookingId}</span></p>
                {bookingInfo.email && (
                  <p className="text-sm text-gray-600">Email: {bookingInfo.email}</p>
                )}
                {bookingInfo.phone && (
                  <p className="text-sm text-gray-600">Số điện thoại: {bookingInfo.phone}</p>
                )}
                {bookingInfo.reason && (
                  <p className="text-sm text-gray-600">Lý do: {bookingInfo.reason}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  size="large"
                  block
                  onClick={() => {
                    setCurrentStep(0);
                    setBookingInfo(null);
                  }}
                >
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  danger
                  size="large"
                  block
                  loading={loading}
                  onClick={handleCancelBooking}
                >
                  Xác nhận hủy vé
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && cancellationSuccess && (
            <Result
              status="success"
              title="Hủy vé thành công!"
              subTitle="Tiền sẽ được hoàn lại vào tài khoản của bạn trong 3-7 ngày làm việc. Bạn sẽ nhận được email xác nhận."
              extra={[
                <Button type="primary" key="home" onClick={() => navigate('/')}>
                  Về trang chủ
                </Button>,
                <Button
                  key="cancel-another"
                  onClick={() => {
                    setCurrentStep(0);
                    setBookingInfo(null);
                    setCancellationSuccess(false);
                    form.resetFields();
                  }}
                >
                  Hủy vé khác
                </Button>,
              ]}
            />
          )}
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Cần hỗ trợ? Liên hệ hotline: <strong>1900-xxxx</strong></p>
          <p>Email: support@vexenhanh.vn</p>
        </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CancelTicketPage;
