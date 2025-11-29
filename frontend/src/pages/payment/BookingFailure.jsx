import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CloseCircleOutlined, HomeOutlined, RedoOutlined } from '@ant-design/icons';
import CustomerLayout from '../../components/layouts/CustomerLayout';

const BookingFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Thanh toán thất bại';
  const bookingCode = searchParams.get('bookingCode');

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
        <Result
          status="error"
          title="Đặt vé thất bại"
          subTitle={message}
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<RedoOutlined />}
              onClick={() => navigate('/')}
              size="large"
            >
              Tìm chuyến xe khác
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              size="large"
            >
              Về trang chủ
            </Button>,
          ]}
        />

        {bookingCode && (
          <div className="text-center mt-6 p-4 bg-white rounded-lg shadow">
            <p className="text-gray-600">
              Mã đặt vé: <strong>{bookingCode}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng liên hệ với chúng tôi nếu bạn cần hỗ trợ
            </p>
          </div>
        )}

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Một số lý do gây ra lỗi:
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Thông tin thẻ không chính xác</li>
            <li>• Tài khoản không đủ số dư</li>
            <li>• Đã hết thời gian thanh toán (15 phút)</li>
            <li>• Ngân hàng từ chối giao dịch</li>
            <li>• Kết nối mạng không ổn định</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            Vui lòng thử lại hoặc chọn phương thức thanh toán khác
          </p>
        </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default BookingFailure;
