import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Steps,
  message,
  Tag,
  Space,
  Modal,
  List,
  Empty,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  QrcodeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  requestTicketLookupOTP,
  verifyTicketLookupOTP,
} from '../services/ticketApi';
import CustomerLayout from '../components/layouts/CustomerLayout';

const { Step } = Steps;

const GuestTicketLookupPage = () => {
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lookupData, setLookupData] = useState({ phone: '', email: '' });
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Step 1: Request OTP (Phone or Email)
  const handleRequestOTP = async (values) => {
    if (!values.phone && !values.email) {
      message.error('Vui lòng nhập số điện thoại hoặc email');
      return;
    }

    setLoading(true);
    try {
      const response = await requestTicketLookupOTP({
        phone: values.phone,
        email: values.email,
      });

      if (response.status === 'success' || response.success) {
        setLookupData(values);
        setCurrentStep(1);
        const method = values.phone ? 'số điện thoại' : 'email';
        message.success(`Mã OTP đã được gửi đến ${method} của bạn`);
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      message.error(error.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and get tickets
  const handleVerifyOTP = async (values) => {
    setLoading(true);
    try {
      const response = await verifyTicketLookupOTP({
        phone: lookupData.phone,
        email: lookupData.email,
        otp: values.otp,
      });

      if (response.status === 'success' || response.success) {
        const ticketList = response.data.tickets || [];
        setTickets(ticketList);
        setCurrentStep(2);

        if (ticketList.length === 0) {
          message.info('Không tìm thấy vé nào');
        } else {
          message.success(`Tìm thấy ${ticketList.length} vé`);
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      message.error(error.response?.data?.message || 'Mã OTP không đúng. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // View ticket details
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  // Reset form
  const handleReset = () => {
    form.resetFields();
    otpForm.resetFields();
    setCurrentStep(0);
    setLookupData({ phone: '', email: '' });
    setTickets([]);
    setSelectedTicket(null);
  };

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      valid: { color: 'success', text: 'Hợp lệ' },
      used: { color: 'default', text: 'Đã sử dụng' },
      cancelled: { color: 'error', text: 'Đã hủy' },
      expired: { color: 'warning', text: 'Hết hạn' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Check if ticket can be cancelled
  const canCancelTicket = (ticket) => {
    if (ticket.status !== 'valid') return false;

    const departureTime = dayjs(ticket.tripInfo?.departureTime);
    const now = dayjs();

    // Can cancel if trip hasn't departed yet
    return now.isBefore(departureTime);
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <SearchOutlined className="mr-2" />
            Tra cứu vé
          </h1>
          <p className="text-gray-600">
            Nhập số điện thoại hoặc email để tra cứu tất cả vé đã đặt
          </p>
        </div>

        {/* Steps */}
        <Card className="mb-6">
          <Steps current={currentStep}>
            <Step title="Nhập thông tin" icon={<SearchOutlined />} />
            <Step title="Xác thực OTP" icon={<SafetyOutlined />} />
            <Step title="Danh sách vé" icon={<QrcodeOutlined />} />
          </Steps>
        </Card>

        {/* Step 1: Enter contact info */}
        {currentStep === 0 && (
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleRequestOTP}
              autoComplete="off"
            >
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
                  placeholder="Nhập số điện thoại đã đặt vé"
                  size="large"
                  maxLength={10}
                />
              </Form.Item>

              <div className="text-center text-gray-500 my-4">HOẶC</div>

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
                  placeholder="Nhập email đã đặt vé"
                  size="large"
                  type="email"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                >
                  Tiếp tục
                </Button>
              </Form.Item>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Chỉ cần nhập số điện thoại HOẶC email bạn đã sử dụng khi đặt vé. Hệ thống sẽ gửi mã OTP và hiển thị tất cả vé của bạn.
                </p>
              </div>
            </Form>
          </Card>
        )}

        {/* Step 2: Verify OTP */}
        {currentStep === 1 && (
          <Card>
            <div className="text-center mb-6">
              <SafetyOutlined className="text-5xl text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Xác thực OTP</h2>
              <p className="text-gray-600">
                Mã OTP đã được gửi đến {lookupData.phone ? `số điện thoại ${lookupData.phone}` : `email ${lookupData.email}`}
              </p>
            </div>

            <Form
              form={otpForm}
              layout="vertical"
              onFinish={handleVerifyOTP}
              autoComplete="off"
            >
              <Form.Item
                label="Mã OTP (6 chữ số)"
                name="otp"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã OTP' },
                  {
                    pattern: /^[0-9]{6}$/,
                    message: 'Mã OTP phải có 6 chữ số',
                  },
                ]}
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="Nhập mã OTP 6 chữ số"
                  size="large"
                  maxLength={6}
                  style={{ letterSpacing: '0.5em', textAlign: 'center' }}
                />
              </Form.Item>

              <Form.Item>
                <Space className="w-full" direction="vertical" size="middle">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                  >
                    Xác nhận
                  </Button>

                  <Button size="large" block onClick={handleReset}>
                    Quay lại
                  </Button>
                </Space>
              </Form.Item>

              <div className="text-center">
                <Button
                  type="link"
                  onClick={() => handleRequestOTP(lookupData)}
                >
                  Gửi lại mã OTP
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* Step 3: Show tickets list */}
        {currentStep === 2 && (
          <Card>
            <div className="text-center mb-6">
              <QrcodeOutlined className="text-5xl text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Danh sách vé của bạn</h2>
              <p className="text-gray-600">
                {lookupData.phone ? `Số điện thoại: ${lookupData.phone}` : `Email: ${lookupData.email}`}
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationCircleOutlined className="text-yellow-600 text-xl mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Muốn hủy vé?</h4>
                  <p className="text-sm text-yellow-700">
                    Vui lòng copy <strong>mã vé</strong> bên dưới và truy cập trang{' '}
                    <a
                      href="/cancel-ticket"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/cancel-ticket');
                      }}
                    >
                      Hủy vé
                    </a>
                    {' '}để tiến hành hủy.
                  </p>
                </div>
              </div>
            </div>

            {tickets.length === 0 ? (
              <Empty description="Không tìm thấy vé" />
            ) : (
              <List
                dataSource={tickets}
                renderItem={(ticket) => (
                  <List.Item>
                    <Card
                      className="w-full hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-semibold text-blue-600">
                              {ticket.ticketCode}
                            </span>
                            {getStatusTag(ticket.status)}
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <EnvironmentOutlined />
                              <span className="font-medium">{ticket.tripInfo?.routeName}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <CalendarOutlined />
                              <span>
                                {dayjs(ticket.tripInfo?.departureTime).format('DD/MM/YYYY HH:mm')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <UserOutlined />
                              <span>
                                {ticket.passengers?.length || 0} hành khách
                                {ticket.passengers?.length > 0 &&
                                  ` - Ghế: ${ticket.passengers.map(p => p.seatNumber).join(', ')}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            type="primary"
                            size="small"
                            icon={<QrcodeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                              setQrModalVisible(true);
                            }}
                          >
                            QR Code
                          </Button>

                          {canCancelTicket(ticket) && (
                            <Button
                              danger
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/tickets/cancel');
                              }}
                            >
                              Hủy vé
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}

            <div className="mt-6 text-center">
              <Button size="large" onClick={handleReset}>
                Tra cứu vé khác
              </Button>
            </div>
          </Card>
        )}

        {/* QR Code Modal */}
        <Modal
          title="Mã QR vé"
          open={qrModalVisible}
          onCancel={() => setQrModalVisible(false)}
          footer={null}
          centered
        >
          {selectedTicket && (
            <div className="text-center">
              <img
                src={selectedTicket.qrCode}
                alt="QR Code"
                className="mx-auto mb-4"
                style={{ maxWidth: 300 }}
              />
              <p className="text-gray-600">
                Vui lòng xuất trình mã QR này khi lên xe
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Mã vé: <strong>{selectedTicket.ticketCode}</strong>
              </p>
              <div className="mt-4">
                <Tag color="blue" className="text-sm">
                  {selectedTicket.tripInfo?.route}
                </Tag>
                <div className="text-gray-600 text-sm mt-2">
                  {dayjs(selectedTicket.tripInfo?.departureTime).format('DD/MM/YYYY HH:mm')}
                </div>
              </div>
            </div>
          )}
        </Modal>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default GuestTicketLookupPage;
