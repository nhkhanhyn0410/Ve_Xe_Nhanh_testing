import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Steps,
  Typography,
  Space,
  Divider,
  Select,
  message,
  Spin,
  Alert,
  Radio,
  Badge,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
  TagOutlined,
  SafetyOutlined,
  WalletOutlined,
  BankOutlined,
  DollarOutlined,
  QrcodeOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  holdSeats,
  validateVoucher,
  createPayment,
} from '../services/bookingApi';
import useBookingStore from '../store/bookingStore';
import useAuthStore from '../store/authStore';
import GuestOTPModal from '../components/GuestOTPModal';
import CustomerLayout from '../components/layouts/CustomerLayout';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

// Payment methods configuration
const PAYMENT_METHODS = [
  {
    code: 'cash',
    name: 'Thanh toán khi lên xe',
    description: 'Thanh toán tiền mặt cho tài xế khi lên xe',
    icon: <DollarOutlined />,
    color: '#52c41a',
    enabled: true,
  },
  {
    code: 'vnpay',
    name: 'VNPay',
    description: 'Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)',
    icon: <CreditCardOutlined />,
    color: '#1890ff',
    enabled: true,
  },
  {
    code: 'momo',
    name: 'Ví MoMo',
    description: 'Thanh toán qua ví điện tử MoMo',
    icon: <MobileOutlined />,
    color: '#d4237a',
    enabled: false,
    comingSoon: true,
  },
  {
    code: 'zalopay',
    name: 'ZaloPay',
    description: 'Thanh toán qua ví điện tử ZaloPay',
    icon: <WalletOutlined />,
    color: '#0068ff',
    enabled: false,
    comingSoon: true,
  },
  {
    code: 'banking',
    name: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản qua Internet Banking hoặc QR Code',
    icon: <BankOutlined />,
    color: '#722ed1',
    enabled: false,
    comingSoon: true,
  },
  {
    code: 'paypal',
    name: 'PayPal',
    description: 'Thanh toán quốc tế qua PayPal',
    icon: <QrcodeOutlined />,
    color: '#0070ba',
    enabled: false,
    comingSoon: true,
  },
];

const PassengerInfoPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const {
    selectedTrip,
    selectedSeats,
    pickupPoint,
    dropoffPoint,
    setContactInfo,
    setCurrentBooking,
    setSessionId,
    setExpiresAt,
    voucherCode,
    setVoucherCode,
    setAppliedVoucher,
    appliedVoucher,
  } = useBookingStore();

  // Get current user for logged-in bookings
  const { user } = useAuthStore();

  // Debug: Log user on mount
  useEffect(() => {
    console.log('=== PassengerInfoPage User Debug ===');
    console.log('User object:', user);
    console.log('User ID (_id):', user?._id);
    console.log('User ID (id):', user?.id);
    console.log('Is authenticated:', !!user);
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [voucherValidating, setVoucherValidating] = useState(false);
  const [showGuestOTPModal, setShowGuestOTPModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState(null);

  useEffect(() => {
    // Debug logging
    const tripId = selectedTrip?.id || selectedTrip?._id;
    console.log('PassengerInfoPage - Booking state:', {
      selectedTrip,
      selectedSeats,
      pickupPoint,
      dropoffPoint,
      hasTrip: !!selectedTrip,
      tripId: tripId,
      hasTripId: !!tripId,
      seatsCount: selectedSeats?.length || 0,
    });

    // Validate booking state
    if (!selectedTrip || selectedSeats.length === 0 || !pickupPoint || !dropoffPoint) {
      toast.error('Thông tin đặt vé không hợp lệ');
      navigate('/');
      return;
    }
  }, []);

  const handleValidateVoucher = async () => {
    if (!voucherCode || !voucherCode.trim()) {
      return;
    }

    try {
      setVoucherValidating(true);
      const totalAmount = getSeatPrice() * selectedSeats.length;
      const tripId = selectedTrip?.id || selectedTrip?._id;

      const response = await validateVoucher(voucherCode, {
        tripId: tripId,
        totalAmount,
      });

      if (response.status === 'success' && response.data) {
        setAppliedVoucher(response.data);
        message.success(`Áp dụng voucher thành công! Giảm ${formatPrice(response.data.discountAmount)}`);
      }
    } catch (error) {
      console.error('Validate voucher error:', error);
      message.error(error || 'Mã voucher không hợp lệ');
      setAppliedVoucher(null);
    } finally {
      setVoucherValidating(false);
    }
  };

  const handleGuestOTPSuccess = (guestSessionData) => {
    setIsGuest(true);
    setGuestData(guestSessionData.guest);

    // Pre-fill form with guest data if available
    if (guestSessionData.guest) {
      form.setFieldsValue({
        name: guestSessionData.guest.name || '',
        email: guestSessionData.guest.email || '',
        phone: guestSessionData.guest.phone || '',
      });
    }

    message.success('Xác thực thành công! Bạn có thể tiếp tục đặt vé.');
  };

  const handlePassengerInfoSubmit = async (values) => {
    try {
      setLoading(true);

      // Get tripId (support both 'id' and '_id' fields)
      const tripId = selectedTrip?.id || selectedTrip?._id;

      // Validate booking state before submitting
      if (!selectedTrip || !tripId) {
        toast.error('Thông tin chuyến xe không hợp lệ. Vui lòng chọn lại chuyến xe.');
        navigate('/');
        return;
      }

      if (!selectedSeats || selectedSeats.length === 0) {
        toast.error('Vui lòng chọn ghế trước khi tiếp tục.');
        navigate(`/trip/${tripId}`);
        return;
      }

      if (!pickupPoint || !dropoffPoint) {
        toast.error('Vui lòng chọn điểm đón và trả khách.');
        navigate(`/trip/${tripId}`);
        return;
      }

      // Store contact info
      setContactInfo({
        name: values.name,
        phone: values.phone,
        email: values.email,
      });

      // Prepare passenger data for each seat
      const passengers = selectedSeats.map((seat, index) => ({
        seatNumber: seat.seatNumber,
        passengerName: values[`passenger_${index}_name`] || values.name,
        passengerPhone: values[`passenger_${index}_phone`] || values.phone,
        passengerEmail: values[`passenger_${index}_email`] || values.email,
      }));

      // Hold seats
      const holdData = {
        tripId: tripId,
        seats: passengers,
        contactInfo: {
          name: values.name,
          phone: values.phone,
          email: values.email,
        },
        pickupPoint: pickupPoint,
        dropoffPoint: dropoffPoint,
        voucherCode: appliedVoucher ? voucherCode : undefined,
        // Include customerId if user is logged in
        customerId: user?._id || user?.id || undefined,
      };

      console.log('Hold seats request:', holdData);
      console.log('User logged in:', !!user, 'User ID:', user?._id || user?.id);

      const holdResponse = await holdSeats(holdData);

      console.log('Hold seats response:', holdResponse);

      if (holdResponse.status === 'success' && holdResponse.data) {
        console.log('Setting current booking:', holdResponse.data.booking);
        console.log('Lock info:', holdResponse.data.lockInfo);

        setCurrentBooking(holdResponse.data.booking);
        setSessionId(holdResponse.data.lockInfo.sessionId);
        setExpiresAt(holdResponse.data.lockInfo.expiresAt);

        message.success('Giữ chỗ thành công! Vui lòng hoàn tất thanh toán trong 15 phút');

        console.log('Changing step to 1 (payment)');
        setCurrentStep(1);
      } else {
        console.error('Hold seats response invalid:', holdResponse);
        toast.error('Phản hồi từ server không hợp lệ');
      }
    } catch (error) {
      console.error('Hold seats error:', error);

      // Check if error is about seat already taken
      if (error && typeof error === 'string' && error.includes('đang được người khác chọn')) {
        const tripId = selectedTrip?.id || selectedTrip?._id;

        // Parse the failed seat numbers from error message
        // Error format: "Ghế A1, A2 đang được người khác chọn"
        const match = error.match(/Ghế\s+([A-Z0-9,\s]+)\s+đang được/);
        if (match) {
          const failedSeatsStr = match[1];
          const failedSeats = failedSeatsStr.split(',').map(s => s.trim());

          // Remove the failed seats from selectedSeats
          const { removeSeat } = useBookingStore.getState();
          failedSeats.forEach(seatNumber => {
            removeSeat(seatNumber);
          });

          console.log('Removed failed seats:', failedSeats);
        }

        toast.error(`${error}. Vui lòng chọn ghế khác.`, {
          duration: 5000,
        });

        // Navigate back to trip detail page to select different seats
        setTimeout(() => {
          navigate(`/trip/${tripId}`);
        }, 2000);
      } else {
        toast.error(error || 'Có lỗi xảy ra khi giữ chỗ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const { currentBooking } = useBookingStore.getState();

      console.log('handlePayment - currentBooking:', currentBooking);

      if (!currentBooking) {
        toast.error('Không tìm thấy thông tin booking');
        return;
      }

      // Support both 'id' and '_id' fields
      const bookingId = currentBooking.id || currentBooking._id;
      if (!bookingId) {
        toast.error('Thông tin booking không hợp lệ');
        console.error('Booking ID not found:', currentBooking);
        return;
      }

      // Create payment
      const paymentData = {
        bookingId: bookingId,
        paymentMethod: selectedPaymentMethod,
        amount: currentBooking.finalPrice,
        locale: 'vn',
        // Include customerId if user is logged in
        customerId: user?._id || user?.id || undefined,
      };

      console.log('Creating payment with data:', paymentData);
      console.log('User logged in:', !!user, 'User ID:', user?._id || user?.id);

      const paymentResponse = await createPayment(paymentData);

      console.log('Payment response:', paymentResponse);

      // Support both response formats: {status: 'success', data: ...} and {success: true, data: ...}
      const isSuccess = (paymentResponse.status === 'success' || paymentResponse.success === true) && paymentResponse.data;

      if (isSuccess) {
        const { payment, paymentUrl } = paymentResponse.data;
        const bookingCode = payment?.bookingId?.bookingCode || currentBooking.bookingCode;

        console.log('Payment created successfully:', { payment, paymentUrl, bookingCode });

        // Handle different payment methods
        if (selectedPaymentMethod === 'cash') {
          // For cash payment, go directly to success page
          message.success('Đặt vé thành công! Vui lòng thanh toán khi lên xe.');
          setTimeout(() => {
            navigate(`/booking/success?bookingCode=${bookingCode}`);
          }, 1000);
        } else if (selectedPaymentMethod === 'vnpay') {
          // For VNPay, redirect to payment gateway
          if (paymentUrl) {
            console.log('Redirecting to VNPay:', paymentUrl);
            window.location.href = paymentUrl;
          } else {
            console.error('VNPay URL not found');
            toast.error('Không thể tạo link thanh toán VNPay');
            navigate(`/booking/failure?message=Không thể tạo link thanh toán`);
          }
        } else {
          // Other payment methods (not implemented yet)
          toast.error('Phương thức thanh toán chưa được hỗ trợ');
        }
      } else {
        console.error('Payment response invalid:', paymentResponse);
        toast.error('Phản hồi thanh toán không hợp lệ');
        navigate(`/booking/failure?message=Phản hồi thanh toán không hợp lệ`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error || 'Có lỗi xảy ra khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getSeatPrice = () => {
    // Try multiple price fields in order of preference
    return selectedTrip?.pricing?.finalPrice || selectedTrip?.finalPrice || selectedTrip?.pricing?.basePrice || 0;
  };

  const calculateTotal = () => {
    if (!selectedTrip || selectedSeats.length === 0) return 0;
    const baseTotal = getSeatPrice() * selectedSeats.length;
    const voucherDiscount = appliedVoucher?.discountAmount || 0;
    return Math.max(0, baseTotal - voucherDiscount);
  };

  if (!selectedTrip) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Đang tải thông tin chuyến xe..." />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Steps */}
        <Card className="mb-6">
          <Steps current={currentStep}>
            <Step title="Thông tin hành khách" icon={<UserOutlined />} />
            <Step title="Thanh toán" icon={<CreditCardOutlined />} />
          </Steps>
        </Card>

        {currentStep === 0 ? (
          /* Step 1: Passenger Information */
          <Card title="Thông tin hành khách">
            <Form
              form={form}
              layout="vertical"
              onFinish={handlePassengerInfoSubmit}
            >
              {/* Guest Booking Alert */}
              {!isGuest && (
                <Alert
                  message="Đặt vé không cần đăng ký"
                  description={
                    <div>
                      <Text>Bạn có thể đặt vé nhanh chóng mà không cần tạo tài khoản. Chỉ cần xác thực email hoặc số điện thoại.</Text>
                      <div className="mt-2">
                        <Button
                          type="link"
                          icon={<SafetyOutlined />}
                          onClick={() => setShowGuestOTPModal(true)}
                        >
                          Đặt vé với OTP
                        </Button>
                      </div>
                    </div>
                  }
                  type="info"
                  showIcon
                  className="mb-4"
                />
              )}

              {isGuest && guestData && (
                <Alert
                  message="Đã xác thực OTP"
                  description={`Bạn đang đặt vé với ${guestData.email || guestData.phone}`}
                  type="success"
                  showIcon
                  closable
                  className="mb-4"
                />
              )}

              {/* Contact Information */}
              <Title level={5}>Thông tin liên hệ</Title>
              <div className="bg-gray-50 p-4 rounded mb-6">
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                  ]}
                >
                  <Input size="large" prefix={<PhoneOutlined />} placeholder="0123456789" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input size="large" prefix={<MailOutlined />} placeholder="email@example.com" />
                </Form.Item>
              </div>

              {/* Passenger Details for each seat */}
              <Title level={5}>Thông tin hành khách ({selectedSeats.length} ghế)</Title>
              <div className="bg-blue-50 p-4 rounded mb-4">
                <Text className="text-sm text-gray-600">
                  Thông tin liên hệ sẽ được sử dụng mặc định cho tất cả ghế. Bạn có thể cập nhật riêng cho từng ghế nếu cần.
                </Text>
              </div>

              {/* Voucher */}
              <Title level={5}>Mã giảm giá</Title>
              <div className="bg-gray-50 p-4 rounded mb-6">
                <Space.Compact className="w-full">
                  <Input
                    size="large"
                    prefix={<TagOutlined />}
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    size="large"
                    type="primary"
                    onClick={handleValidateVoucher}
                    loading={voucherValidating}
                  >
                    Áp dụng
                  </Button>
                </Space.Compact>
                {appliedVoucher && (
                  <div className="mt-2 text-green-600">
                    ✓ Giảm {formatPrice(appliedVoucher.discountAmount)}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <Card className="mb-6 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Giá vé ({selectedSeats.length} ghế)</Text>
                    <Text strong className="text-blue-600">
                      {selectedSeats.length > 0 ? formatPrice(getSeatPrice()) : '0đ'} x {selectedSeats.length}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600">Tổng giá vé</Text>
                    <Text>{formatPrice(getSeatPrice() * selectedSeats.length)}</Text>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <Text>Giảm giá voucher</Text>
                      <Text>-{formatPrice(appliedVoucher.discountAmount)}</Text>
                    </div>
                  )}
                  <Divider className="my-2" />
                  <div className="flex justify-between">
                    <Text strong className="text-lg">Tổng thanh toán</Text>
                    <Text strong className="text-lg text-blue-600">
                      {formatPrice(calculateTotal())}
                    </Text>
                  </div>
                </div>
              </Card>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Tiếp tục thanh toán
              </Button>
            </Form>
          </Card>
        ) : (
          /* Step 2: Payment */
          <Card
            title={
              <div className="flex items-center gap-2">
                <WalletOutlined className="text-xl" />
                <span>Phương thức thanh toán</span>
              </div>
            }
          >
            <div className="mb-6">
              <Text strong className="text-base">Chọn phương thức thanh toán</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {PAYMENT_METHODS.map(method => (
                  <Card
                    key={method.code}
                    className={`cursor-pointer transition-all ${
                      selectedPaymentMethod === method.code
                        ? 'border-2 shadow-md'
                        : 'hover:shadow-sm'
                    } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      borderColor: selectedPaymentMethod === method.code ? method.color : undefined,
                    }}
                    onClick={() => method.enabled && setSelectedPaymentMethod(method.code)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="text-3xl p-2 rounded-lg"
                        style={{
                          color: method.color,
                          backgroundColor: `${method.color}15`,
                        }}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Text strong className="text-base">{method.name}</Text>
                          {method.comingSoon && (
                            <Badge
                              count="Sắp ra mắt"
                              style={{ backgroundColor: '#faad14' }}
                            />
                          )}
                          {method.enabled && selectedPaymentMethod === method.code && (
                            <Badge
                              count="✓"
                              style={{ backgroundColor: method.color }}
                            />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Info Alert */}
            {selectedPaymentMethod === 'vnpay' && (
              <Alert
                message="Thanh toán VNPay"
                description="Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch. Hỗ trợ thanh toán qua thẻ ATM, Visa, MasterCard và JCB."
                type="info"
                showIcon
                icon={<CreditCardOutlined />}
                className="mb-6"
              />
            )}

            {selectedPaymentMethod === 'cash' && (
              <Alert
                message="Thanh toán khi lên xe"
                description="Vui lòng chuẩn bị tiền mặt và thanh toán cho tài xế khi lên xe. Vé của bạn đã được giữ chỗ."
                type="success"
                showIcon
                icon={<DollarOutlined />}
                className="mb-6"
              />
            )}

            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text className="text-gray-600">Tổng tiền vé</Text>
                  <Text strong>{formatPrice(getSeatPrice() * selectedSeats.length)}</Text>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between items-center text-green-600">
                    <div className="flex items-center gap-2">
                      <TagOutlined />
                      <Text className="text-green-600">Giảm giá voucher</Text>
                    </div>
                    <Text strong className="text-green-600">-{formatPrice(appliedVoucher.discountAmount)}</Text>
                  </div>
                )}
                <Divider className="my-2" />
                <div className="flex justify-between items-center">
                  <Text strong className="text-lg">Tổng thanh toán</Text>
                  <Text strong className="text-2xl text-blue-600">
                    {formatPrice(calculateTotal())}
                  </Text>
                </div>
              </div>
            </Card>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handlePayment}
              icon={selectedPaymentMethod === 'cash' ? <DollarOutlined /> : <CreditCardOutlined />}
              disabled={!selectedPaymentMethod}
            >
              {selectedPaymentMethod === 'cash' ? 'Xác nhận đặt vé' : 'Tiến hành thanh toán'}
            </Button>

            <div className="text-center mt-4 text-gray-500 text-sm">
              <SafetyOutlined /> Giao dịch được bảo mật và an toàn
            </div>
          </Card>
        )}
      </div>

      {/* Guest OTP Modal */}
      <GuestOTPModal
        open={showGuestOTPModal}
        onCancel={() => setShowGuestOTPModal(false)}
        onSuccess={handleGuestOTPSuccess}
      />
      </div>
    </CustomerLayout>
  );
};

export default PassengerInfoPage;
