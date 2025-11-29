import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Result, Button, Descriptions, Tag, Spin, Divider, message, Modal } from 'antd';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  HomeOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  MailOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useBookingStore from '../../store/bookingStore';
import api from '../../services/api';
import CustomerLayout from '../../components/layouts/CustomerLayout';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingCode = searchParams.get('bookingCode');
  const phone = searchParams.get('phone'); // Optional phone for guest lookup

  const { currentBooking, selectedTrip, selectedSeats, pickupPoint, dropoffPoint, contactInfo } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingCode) {
        console.warn('No booking code provided');
        setLoading(false);
        return;
      }

      // If we have a bookingCode, always fetch from API for most up-to-date data
      const phoneParam = phone || contactInfo?.phone || currentBooking?.contactInfo?.phone;

      if (!phoneParam) {
        console.warn('No phone number available for booking lookup');

        // Fallback: try to use currentBooking from store if it matches
        if (currentBooking && currentBooking.bookingCode === bookingCode) {
          console.log('Using currentBooking from store as fallback:', currentBooking);
          setBooking(currentBooking);
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching booking from API:', { bookingCode, phone: phoneParam });

        const response = await api.get(`/bookings/code/${bookingCode}`, {
          params: { phone: phoneParam },
        });

        console.log('API response:', response);

        // Support both response formats
        const isSuccess = response.success === true || response.status === 'success';
        if (isSuccess && response.data) {
          // Extract booking from response (handle nested structure)
          let bookingData = response.data.booking || response.data;

          console.log('Extracted booking data:', bookingData);
          console.log('Payment method:', bookingData.paymentMethod);
          console.log('Payment status:', bookingData.paymentStatus);
          console.log('Trip route:', bookingData.tripId?.routeId);

          setBooking(bookingData);
        } else {
          console.error('API response not successful:', response);

          // Fallback: try store data
          if (currentBooking && currentBooking.bookingCode === bookingCode) {
            console.log('Using currentBooking from store as fallback');
            setBooking(currentBooking);
          }
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);

        // Fallback: try to construct from store data
        if (currentBooking && currentBooking.bookingCode === bookingCode) {
          console.log('Using currentBooking from store after error');
          setBooking(currentBooking);
        } else if (selectedTrip && contactInfo) {
          console.log('Constructing booking from store data after error');
          const seatPrice = selectedTrip?.pricing?.finalPrice || selectedTrip?.finalPrice || selectedTrip?.pricing?.basePrice || 0;
          const finalPrice = seatPrice * (selectedSeats?.length || 0);

          const fallbackBooking = {
            bookingCode,
            tripId: selectedTrip,
            seats: selectedSeats,
            pickupPoint,
            dropoffPoint,
            contactInfo,
            finalPrice,
            paymentMethod: 'unknown',
            paymentStatus: 'unknown',
          };
          setBooking(fallbackBooking);
        }
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingCode, phone]); // Simplified dependencies - only bookingCode and phone

  // Fetch ticket when booking is loaded
  useEffect(() => {
    const fetchTicket = async () => {
      if (!booking || !booking._id) {
        return;
      }

      try {
        setLoadingTicket(true);
        console.log('Fetching ticket for booking:', booking._id);

        // Try to get ticket by booking ID
        const response = await api.get(`/tickets/booking/${booking._id}`);

        if (response.success && response.data?.ticket) {
          console.log('Ticket loaded:', response.data.ticket);
          setTicket(response.data.ticket);
        } else {
          console.log('No ticket found yet, might still be generating...');
        }
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        // Don't show error message as ticket might still be generating
      } finally {
        setLoadingTicket(false);
      }
    };

    fetchTicket();
  }, [booking]);

  const handlePrintTicket = () => {
    window.print();
  };

  const handleResendEmail = async () => {
    if (!ticket || !ticket._id) {
      console.warn('Cannot resend email - ticket not found:', { ticket, hasTicket: !!ticket, hasId: !!ticket?._id });
      message.warning('Vé điện tử đang được tạo, vui lòng đợi trong giây lát rồi thử lại.');
      return;
    }

    try {
      console.log('Resending email for ticket:', ticket._id, ticket.ticketCode);
      message.loading({ content: 'Đang gửi email...', key: 'resend', duration: 0 });

      const response = await api.post(`/tickets/${ticket._id}/resend`);

      console.log('Resend email response:', response);
      message.destroy('resend');

      if (response.success) {
        message.success({
          content: `Đã gửi lại vé đến email: ${booking?.contactInfo?.email || 'của bạn'}`,
          duration: 5,
        });
      } else {
        console.error('Resend failed:', response);
        message.error(response.message || 'Gửi email thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      message.destroy('resend');
      console.error('Resend email error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi email';
      message.error({
        content: `Lỗi: ${errorMessage}. Vui lòng thử lại sau.`,
        duration: 5,
      });
    }
  };

  const handleShowQR = () => {
    if (ticket) {
      setQrModalVisible(true);
    } else {
      message.warning('Vé điện tử đang được tạo, vui lòng đợi trong giây lát...');
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spin size="large" tip="Đang tải thông tin đặt vé..." />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 py-8">
        <div className="max-w-3xl mx-auto">
        <Result
          status="success"
          title="Đặt vé thành công!"
          subTitle={
            booking
              ? `Mã đặt vé của bạn là ${booking.bookingCode}. Vui lòng kiểm tra email để nhận vé điện tử.`
              : 'Vé điện tử đã được gửi đến email của bạn.'
          }
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        />

        {booking && (
          <Card className="mt-6 shadow-lg">
            {/* QR Code Section - Prominent Display */}
            {ticket && ticket.qrCode && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 -m-6 mb-6 p-8 rounded-t-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                    <CheckCircleOutlined className="text-white text-3xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Vé Điện Tử Của Bạn</h2>
                  <p className="text-gray-600 mb-6">
                    Mã vé: <span className="font-mono font-bold text-blue-600">{ticket.ticketCode}</span>
                  </p>

                  {/* QR Code Display */}
                  <div className="inline-block bg-white p-6 rounded-2xl shadow-xl">
                    <img
                      src={ticket.qrCode}
                      alt="QR Code"
                      className="mx-auto"
                      style={{ width: 280, height: 280 }}
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-sm text-gray-600">
                      <QrcodeOutlined className="mr-2" />
                      Xuất trình mã QR này khi lên xe
                    </p>
                    <Button
                      type="link"
                      icon={<QrcodeOutlined />}
                      onClick={handleShowQR}
                      size="large"
                    >
                      Xem toàn màn hình
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!ticket && loadingTicket && (
              <div className="text-center py-8 mb-6">
                <Spin size="large" />
                <p className="mt-4 text-gray-600">Đang tạo vé điện tử...</p>
              </div>
            )}

            {!ticket && !loadingTicket && booking.paymentStatus === 'paid' && (
              <div className="text-center py-8 mb-6 bg-yellow-50 -m-6 mb-6 p-6 rounded-t-lg">
                <MailOutlined className="text-4xl text-yellow-500 mb-4" />
                <p className="text-gray-700">
                  Vé điện tử đang được tạo và sẽ được gửi đến email của bạn trong giây lát.
                </p>
                <Button
                  type="primary"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Làm mới trang
                </Button>
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Thông tin đặt vé</h2>
              <p className="text-gray-500">Mã đặt vé: <strong className="text-blue-600">{booking.bookingCode}</strong></p>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tuyến xe">
                {booking.tripId?.routeId?.origin?.city || booking.tripInfo?.origin?.city || 'N/A'} → {booking.tripId?.routeId?.destination?.city || booking.tripInfo?.destination?.city || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian khởi hành">
                {booking.tripId?.departureTime ? dayjs(booking.tripId.departureTime).format('HH:mm, DD/MM/YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm đón">
                {booking.pickupPoint?.name || booking.tripInfo?.pickupPoint?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm trả">
                {booking.dropoffPoint?.name || booking.tripInfo?.dropoffPoint?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Số ghế">
                <div className="flex gap-2 flex-wrap">
                  {booking.seats && booking.seats.length > 0 ? (
                    booking.seats.map((seat, index) => (
                      <Tag key={seat.seatNumber || index} color="blue">
                        {seat.seatNumber || seat}
                      </Tag>
                    ))
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Hành khách">
                {booking.contactInfo?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {booking.contactInfo?.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {booking.contactInfo?.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                <Tag color={booking.paymentMethod === 'cash' ? 'green' : 'blue'}>
                  {booking.paymentMethod === 'cash' ? 'Tiền mặt khi lên xe' : booking.paymentMethod === 'vnpay' ? 'VNPay' : booking.paymentMethod || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                <Tag color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <strong className="text-xl text-blue-600">
                  {booking.finalPrice ? booking.finalPrice.toLocaleString('vi-VN') : '0'}đ
                </strong>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="flex gap-4 justify-center flex-wrap">
              {ticket && (
                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  onClick={handleShowQR}
                  size="large"
                >
                  Xem mã QR
                </Button>
              )}
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrintTicket}
                size="large"
              >
                In vé
              </Button>
              <Button
                icon={<MailOutlined />}
                onClick={handleResendEmail}
                size="large"
                disabled={!ticket}
              >
                Gửi lại email
              </Button>
              <Button
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                size="large"
              >
                Về trang chủ
              </Button>
            </div>

            {booking.paymentMethod === 'cash' && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-yellow-800">
                  <strong>Lưu ý:</strong> Vui lòng chuẩn bị tiền mặt và thanh toán cho tài xế khi lên xe.
                  Số tiền cần thanh toán: <strong>{booking.finalPrice?.toLocaleString('vi-VN')}đ</strong>
                </p>
              </div>
            )}
          </Card>
        )}

        {/* QR Code Modal - Full Screen View */}
        <Modal
          title="Mã QR Vé Điện Tử"
          open={qrModalVisible}
          onCancel={() => setQrModalVisible(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setQrModalVisible(false)}>
              Đóng
            </Button>
          ]}
          centered
          width={600}
        >
          {ticket && (
            <div className="text-center py-6">
              <div className="bg-white p-8 rounded-xl inline-block border-4 border-blue-500">
                <img
                  src={ticket.qrCode}
                  alt="QR Code"
                  className="mx-auto"
                  style={{ width: 400, height: 400 }}
                />
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-xl font-bold text-gray-800">
                  Mã vé: <span className="text-blue-600">{ticket.ticketCode}</span>
                </p>

                {ticket.tripInfo && (
                  <>
                    <p className="text-gray-700">
                      <strong>Tuyến:</strong> {ticket.tripInfo.routeName}
                    </p>
                    <p className="text-gray-700">
                      <strong>Khởi hành:</strong> {dayjs(ticket.tripInfo.departureTime).format('HH:mm, DD/MM/YYYY')}
                    </p>
                    <p className="text-gray-700">
                      <strong>Ghế:</strong>{' '}
                      {ticket.passengers?.map(p => p.seatNumber).join(', ')}
                    </p>
                  </>
                )}

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-6">
                  <p className="text-sm text-blue-800">
                    <QrcodeOutlined className="mr-2 text-lg" />
                    <strong>Lưu ý:</strong> Vui lòng xuất trình mã QR này khi lên xe
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {!booking && (
          <div className="text-center mt-6">
            <Button type="primary" size="large" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </div>
        )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default BookingSuccess;
