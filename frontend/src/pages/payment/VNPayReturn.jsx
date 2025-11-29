import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';
import CustomerLayout from '../../components/layouts/CustomerLayout';

const VNPayReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    processVNPayReturn();
  }, []);

  const processVNPayReturn = async () => {
    try {
      // Get all VNPay params from URL
      const vnpParams = {};
      for (const [key, value] of searchParams.entries()) {
        vnpParams[key] = value;
      }

      console.log('VNPay return params:', vnpParams);

      // Call backend to process VNPay callback
      const response = await api.get('/payments/vnpay/return', {
        params: vnpParams,
      });

      console.log('VNPay callback response:', response);

      // Support both response formats: {success: true} and {status: 'success'}
      const isSuccess = response.success === true || response.status === 'success';

      if (isSuccess && response.data) {
        setResult({
          success: true,
          message: response.message || 'Thanh toán thành công',
          bookingCode: response.data?.booking?.bookingCode,
          paymentCode: response.data?.payment?.paymentCode,
        });

        // Redirect to success page after 2 seconds
        setTimeout(() => {
          if (response.data?.booking?.bookingCode) {
            const phone = response.data?.booking?.contactInfo?.phone || '';
            const redirectUrl = `/booking/success?bookingCode=${response.data.booking.bookingCode}${phone ? `&phone=${phone}` : ''}`;
            navigate(redirectUrl);
          } else {
            navigate('/booking/success');
          }
        }, 2000);
      } else {
        setResult({
          success: false,
          message: response.message || 'Thanh toán thất bại',
        });
      }
    } catch (error) {
      console.error('Process VNPay return error:', error);
      setResult({
        success: false,
        message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xử lý thanh toán',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p className="mt-4 text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
        <Result
          status={result.success ? 'success' : 'error'}
          title={result.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          subTitle={result.message}
          extra={[
            result.success ? (
              <Button
                type="primary"
                key="view"
                onClick={() => {
                  if (result.bookingCode) {
                    navigate(`/booking/success?bookingCode=${result.bookingCode}`);
                  } else {
                    navigate('/booking/success');
                  }
                }}
              >
                Xem thông tin vé
              </Button>
            ) : (
              <>
                <Button
                  type="primary"
                  key="retry"
                  onClick={() => navigate('/')}
                >
                  Tìm chuyến xe khác
                </Button>
                <Button
                  key="home"
                  onClick={() => navigate('/')}
                >
                  Về trang chủ
                </Button>
              </>
            ),
          ]}
        />
        {result.bookingCode && (
          <div className="text-center mt-4 text-gray-500">
            <p>Mã đặt vé: <strong>{result.bookingCode}</strong></p>
            {result.paymentCode && (
              <p className="text-sm">Mã giao dịch: {result.paymentCode}</p>
            )}
          </div>
        )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default VNPayReturn;
