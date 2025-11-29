import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Result, Button, Descriptions, Typography, Space, Tag, Divider, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getBookingByCode } from '../services/bookingApi';
import useBookingStore from '../store/bookingStore';
import CustomerLayout from '../components/layouts/CustomerLayout';

const { Title, Text } = Typography;

const BookingConfirmationPage = () => {
  const { bookingCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetBooking } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Check if coming from payment
    const paymentCode = searchParams.get('paymentCode');
    if (paymentCode) {
      setPaymentStatus('success');
    }

    if (bookingCode) {
      fetchBooking();
    }

    // Reset booking flow
    resetBooking();
  }, [bookingCode]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await getBookingByCode(bookingCode);

      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return dayjs(dateString).format('HH:mm, DD/MM/YYYY');
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ thanh toán' },
      confirmed: { color: 'green', text: 'Đã xác nhận' },
      cancelled: { color: 'red', text: 'Đã hủy' },
      completed: { color: 'blue', text: 'Hoàn thành' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ thanh toán' },
      paid: { color: 'green', text: 'Đã thanh toán' },
      failed: { color: 'red', text: 'Thanh toán thất bại' },
      refunded: { color: 'purple', text: 'Đã hoàn tiền' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Đang tải thông tin đặt vé..." />
        </div>
      </CustomerLayout>
    );
  }

  if (!booking) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card>
            <Result
              status="404"
              title="Không tìm thấy thông tin đặt vé"
              extra={
                <Button type="primary" onClick={() => navigate('/')}>
                  Về trang chủ
                </Button>
              }
            />
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  const isSuccess = booking.status === 'confirmed' || booking.paymentStatus === 'paid';

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success/Failure Message */}
        <Card className="mb-6">
          <Result
            status={isSuccess ? 'success' : 'warning'}
            icon={
              isSuccess ? (
                <CheckCircleOutlined className="text-green-500" />
              ) : (
                <CloseCircleOutlined className="text-orange-500" />
              )
            }
            title={
              isSuccess
                ? 'Đặt vé thành công!'
                : 'Đang chờ thanh toán'
            }
            subTitle={
              isSuccess
                ? `Mã đặt vé của bạn: ${booking.bookingCode}`
                : 'Vui lòng hoàn tất thanh toán để xác nhận vé'
            }
            extra={[
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>,
              <Button key="mybookings" type="primary" onClick={() => navigate('/my-bookings')}>
                Vé của tôi
              </Button>,
            ]}
          />
        </Card>

        {/* Booking Details */}
        <Card title={<Title level={4}>Thông tin đặt vé</Title>} className="mb-6">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã đặt vé">
              <Text strong className="text-lg">{booking.bookingCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái booking">
              {getStatusTag(booking.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán">
              {getPaymentStatusTag(booking.paymentStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="Nhà xe">
              {booking.operatorId?.companyName}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian đặt">
              {formatTime(booking.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Trip Information */}
        {booking.tripId && (
          <Card title={<Title level={4}>Thông tin chuyến xe</Title>} className="mb-6">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Thời gian khởi hành">
                {formatTime(booking.tripId.departureTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian đến">
                {formatTime(booking.tripId.arrivalTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm đón">
                <div>
                  <div><strong>{booking.pickupPoint?.name}</strong></div>
                  <div className="text-sm text-gray-500">{booking.pickupPoint?.address}</div>
                  <div className="text-sm">Thời gian: {dayjs(booking.pickupPoint?.time).format('HH:mm')}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm trả">
                <div>
                  <div><strong>{booking.dropoffPoint?.name}</strong></div>
                  <div className="text-sm text-gray-500">{booking.dropoffPoint?.address}</div>
                  <div className="text-sm">Thời gian: {dayjs(booking.dropoffPoint?.time).format('HH:mm')}</div>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Passenger Information */}
        <Card title={<Title level={4}>Thông tin hành khách</Title>} className="mb-6">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Người đặt">
              <div>
                <div>{booking.contactInfo?.name}</div>
                <div className="text-sm text-gray-500">{booking.contactInfo?.phone}</div>
                <div className="text-sm text-gray-500">{booking.contactInfo?.email}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ghế đã chọn">
              <Space wrap>
                {booking.seats?.map((seat) => (
                  <Tag key={seat.seatNumber} color="blue" className="text-base px-3 py-1">
                    {seat.seatNumber}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Payment Information */}
        <Card title={<Title level={4}>Thông tin thanh toán</Title>}>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Text>Tổng tiền vé ({booking.seats?.length} ghế)</Text>
              <Text>{formatPrice(booking.totalPrice)}</Text>
            </div>
            {booking.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <Text>Giảm giá ({booking.discount}%)</Text>
                <Text>-{formatPrice(booking.totalPrice * booking.discount / 100)}</Text>
              </div>
            )}
            {booking.voucherDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <Text>Giảm giá voucher ({booking.voucherCode})</Text>
                <Text>-{formatPrice(booking.voucherDiscount)}</Text>
              </div>
            )}
            <Divider className="my-2" />
            <div className="flex justify-between">
              <Text strong className="text-xl">Tổng thanh toán</Text>
              <Text strong className="text-xl text-blue-600">
                {formatPrice(booking.finalPrice)}
              </Text>
            </div>
            {booking.paymentMethod && (
              <div className="flex justify-between">
                <Text>Phương thức thanh toán</Text>
                <Text className="uppercase">{booking.paymentMethod}</Text>
              </div>
            )}
            {booking.paidAt && (
              <div className="flex justify-between">
                <Text>Thời gian thanh toán</Text>
                <Text>{formatTime(booking.paidAt)}</Text>
              </div>
            )}
          </div>
        </Card>

        {/* Note */}
        {isSuccess && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-sm text-blue-800">
              📧 Thông tin vé đã được gửi đến email <strong>{booking.contactInfo?.email}</strong>
              <br />
              📱 Vui lòng mang theo mã đặt vé <strong>{booking.bookingCode}</strong> khi lên xe
            </Text>
          </div>
        )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default BookingConfirmationPage;
