import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Spin } from 'antd';
import {
  CheckOutlined,
  DownloadOutlined,
  HomeOutlined,
  PrinterOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getBookingByCode } from '../services/bookingApi';
import api from '../services/api';
import useBookingStore from '../store/bookingStore';
import useAuthStore from '../store/authStore';
import CustomerShell from '../components/customer/CustomerShell';
import SaffronTicketCard from '../components/customer/SaffronTicketCard';

const BOOKING_STEPS = [
  { key: 'seats', label: 'Chọn ghế' },
  { key: 'passenger', label: 'Thông tin hành khách' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'done', label: 'Hoàn tất' },
];

const BookingStepper = ({ current = 4 }) => (
  <div className="border-b border-vxn-border bg-white px-4 py-4 lg:px-8">
    <ol className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      {BOOKING_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={step.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold ${
                  done || active ? 'bg-vxn-teal-700 text-white' : 'bg-vxn-bg-cloud text-vxn-fg-5'
                }`}
              >
                {done ? <CheckOutlined className="text-[12px]" /> : stepNumber}
              </span>
              <span
                className={`text-sm ${
                  active
                    ? 'font-semibold text-vxn-ink'
                    : done
                      ? 'font-medium text-vxn-fg-2'
                      : 'text-vxn-fg-5'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < BOOKING_STEPS.length - 1 && (
              <span className={`h-px w-10 ${done ? 'bg-vxn-teal-700' : 'bg-vxn-border'}`} />
            )}
          </li>
        );
      })}
    </ol>
  </div>
);

const formatCurrency = (value = 0) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatDateTime = (value) => (value ? dayjs(value).format('HH:mm · DD/MM/YYYY') : '—');

const paymentMethodLabel = (method) => {
  switch (method) {
    case 'vnpay':
      return 'VNPay';
    case 'momo':
      return 'Ví MoMo';
    case 'zalopay':
      return 'ZaloPay';
    case 'cash':
      return 'Tiền mặt';
    default:
      return method ? method.toUpperCase() : '—';
  }
};

const BookingConfirmationPage = () => {
  const { bookingCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetBooking } = useBookingStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const phone = searchParams.get('phone') || user?.phone;
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await getBookingByCode(bookingCode, phone || undefined);
        if ((response.success || response.status === 'success') && response.data) {
          const data = response.data.booking || response.data;
          setBooking(data);
        }
      } catch (error) {
        console.error('Fetch booking error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingCode) {
      fetchBooking();
    } else {
      setLoading(false);
    }

    // Reset the in-progress booking flow once landing here
    resetBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingCode]);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!booking?._id) return;
      try {
        const response = await api.get(`/tickets/booking/${booking._id}`);
        if (response.success && response.data?.ticket) {
          setTicket(response.data.ticket);
        }
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
      }
    };
    fetchTicket();
  }, [booking]);

  if (loading) {
    return (
      <CustomerShell activeKey="buy">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <p className="text-[14px] text-vxn-fg-3">Đang tải thông tin vé...</p>
        </div>
      </CustomerShell>
    );
  }

  if (!booking) {
    return (
      <CustomerShell activeKey="buy">
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-vxn-border bg-white p-8 text-center">
            <h2 className="m-0 text-[20px] font-semibold text-vxn-ink">
              Không tìm thấy thông tin đặt vé
            </h2>
            <p className="mt-2 text-[13px] text-vxn-fg-3">
              Mã đặt vé không tồn tại hoặc đã bị xoá. Vui lòng kiểm tra lại.
            </p>
            <Button type="primary" size="large" className="mt-5" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </CustomerShell>
    );
  }

  let rawSeats = booking?.seats;
  if (!rawSeats || rawSeats.length === 0) {
    rawSeats = booking?.seatNumbers || ticket?.seatNumbers;
  }
  if (!rawSeats || rawSeats.length === 0) {
    rawSeats = ticket?.passengers?.map((p) => p.seatNumber);
  }
  const seats = Array.isArray(rawSeats) ? rawSeats : [];
  const totalPrice = booking?.totalPrice ?? booking?.finalPrice ?? 0;
  const finalPrice = booking?.finalPrice ?? totalPrice;
  const discount = (booking?.discount || 0) + (booking?.voucherDiscount || 0);
  const isPaid = booking?.paymentStatus === 'paid' || booking?.status === 'confirmed';

  return (
    <CustomerShell activeKey="tickets">
      <div className="px-4 py-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {
            <nav className="mb-5 flex items-center gap-1 text-[13px] text-vxn-fg-4">
              <span>Trang chủ</span>
              <span>·</span>
              <span>Hành trình</span>
              <span>·</span>
              <span>Thanh toán</span>
              <span>·</span>
              <span className="text-vxn-fg-2">Vé điện tử</span>
            </nav>
          }

          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="m-0 text-[26px] font-semibold tracking-tight text-vxn-ink">
                Vé điện tử của bạn
              </h1>
              <p className="m-0 mt-1 text-[13px] text-vxn-fg-3">
                Mã đặt vé:{' '}
                <span className="font-mono font-semibold text-vxn-ink">{booking.bookingCode}</span>{' '}
                · Đã gửi đến email{' '}
                <span className="text-vxn-ink">{booking?.contactInfo?.email || ''}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                In vé
              </Button>
              <Button icon={<DownloadOutlined />}>Tải PDF</Button>
              <Button icon={<ShareAltOutlined />}>Chia sẻ</Button>
            </div>
          </div>

          <SaffronTicketCard booking={booking} ticket={ticket} className="mb-6" />

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-vxn-border bg-white p-6">
              <h3 className="m-0 text-[15px] font-semibold text-vxn-ink">Hành khách & Liên hệ</h3>
              <dl className="mt-4 space-y-3 text-[13.5px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-vxn-fg-5">Người đặt</dt>
                  <dd className="font-medium text-vxn-ink">{booking?.contactInfo?.name || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-vxn-fg-5">Điện thoại</dt>
                  <dd className="font-medium text-vxn-ink">{booking?.contactInfo?.phone || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-vxn-fg-5">Email</dt>
                  <dd className="font-medium text-vxn-ink truncate max-w-[60%]">
                    {booking?.contactInfo?.email || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-vxn-fg-5">Ghế đã đặt</dt>
                  <dd className="font-semibold text-[#A8741A]">
                    {seats.map((s) => s.seatNumber || s).join(', ') || '—'}
                  </dd>
                </div>
                {booking?.pickupPoint && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-vxn-fg-5">Điểm đón</dt>
                    <dd className="text-right font-medium text-vxn-ink max-w-[60%]">
                      {booking.pickupPoint.name || booking.pickupPoint.address}
                    </dd>
                  </div>
                )}
                {booking?.dropoffPoint && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-vxn-fg-5">Điểm trả</dt>
                    <dd className="text-right font-medium text-vxn-ink max-w-[60%]">
                      {booking.dropoffPoint.name || booking.dropoffPoint.address}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-vxn-border bg-white p-6">
              <h3 className="m-0 text-[15px] font-semibold text-vxn-ink">Thanh toán</h3>
              <dl className="mt-4 space-y-3 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="text-vxn-fg-5">Phương thức</dt>
                  <dd className="font-medium text-vxn-ink">
                    {paymentMethodLabel(booking?.paymentMethod)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-vxn-fg-5">Trạng thái</dt>
                  <dd className={`font-semibold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-vxn-fg-5">Thời điểm đặt</dt>
                  <dd className="font-medium text-vxn-ink">{formatDateTime(booking?.createdAt)}</dd>
                </div>
                {booking?.paidAt && (
                  <div className="flex justify-between">
                    <dt className="text-vxn-fg-5">Thanh toán lúc</dt>
                    <dd className="font-medium text-vxn-ink">{formatDateTime(booking.paidAt)}</dd>
                  </div>
                )}
                <div className="my-2 h-px bg-vxn-border" />
                <div className="flex justify-between">
                  <dt className="text-vxn-fg-5">Giá vé ({seats.length} ghế)</dt>
                  <dd className="font-medium text-vxn-ink">{formatCurrency(totalPrice)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <dt>Giảm giá</dt>
                    <dd>−{formatCurrency(discount)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5">
                  <span className="text-[14px] font-medium text-vxn-ink">Tổng đã thanh toán</span>
                  <span className="text-[20px] font-bold text-[#A8741A]">
                    {formatCurrency(finalPrice)}
                  </span>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-vxn-border bg-vxn-bg-mist p-5">
            <div className="text-[13.5px] text-vxn-fg-2">
              📱 Vui lòng quét mã QR khi lên xe · Có mặt trước giờ khởi hành{' '}
              <strong>20 phút</strong>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate('/my-tickets')}>Vé của tôi</Button>
              <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
};

export default BookingConfirmationPage;
