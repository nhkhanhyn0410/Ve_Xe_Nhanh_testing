import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, DatePicker } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  DollarOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { adminReports } from '../../services/adminApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  useEffect(() => {
    fetchOverview();
  }, [dateRange]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      };

      const response = await adminReports.getSystemOverview(params);

      if (response.success) {
        setOverview(response.data);
      }
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError(err || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Lỗi"
        description={error}
        showIcon
        className="mb-4"
      />
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tổng Quan Hệ Thống</h1>
          <p className="text-gray-600 mt-1">
            Thống kê và phân tích hoạt động hệ thống
          </p>
        </div>
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          className="w-80"
        />
      </div>

      {overview && (
        <>
          {/* Main Statistics Cards */}
          <Row gutter={[16, 16]}>
            {/* Users */}
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">
                      Tổng Người Dùng
                    </span>
                  }
                  value={overview.overview?.totalUsers || 0}
                  prefix={<UserOutlined className="text-blue-600" />}
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                  formatter={formatNumber}
                />
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Người dùng mới:</span>
                    <span className="font-semibold text-green-600">
                      +{formatNumber(overview.overview?.newUsers || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Đang hoạt động:</span>
                    <span className="font-semibold">
                      {formatNumber(overview.overview?.activeUsers || 0)}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Operators */}
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">Nhà Xe</span>
                  }
                  value={overview.overview?.totalOperators || 0}
                  prefix={<ShopOutlined className="text-purple-600" />}
                  valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                  formatter={formatNumber}
                />
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <CheckCircleOutlined className="text-green-500 mr-1" />
                      Đã duyệt:
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatNumber(overview.overview?.approvedOperators || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Chờ duyệt:</span>
                    <span className="font-semibold text-orange-600">
                      {formatNumber(overview.overview?.pendingOperators || 0)}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Revenue */}
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">Doanh Thu</span>
                  }
                  value={overview.revenue?.totalRevenue || 0}
                  prefix={<DollarOutlined className="text-green-600" />}
                  valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  formatter={(value) => formatCurrency(value).replace('₫', '')}
                  suffix="đ"
                />
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tăng trưởng:</span>
                    <span
                      className={`font-semibold flex items-center ${
                        (overview.growth?.revenueGrowth || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {(overview.growth?.revenueGrowth || 0) >= 0 ? (
                        <RiseOutlined className="mr-1" />
                      ) : (
                        <FallOutlined className="mr-1" />
                      )}
                      {Math.abs(overview.growth?.revenueGrowth || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Giá trị TB:</span>
                    <span className="font-semibold">
                      {formatCurrency(overview.revenue?.averageOrderValue || 0)}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Bookings */}
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">Đặt Vé</span>
                  }
                  value={overview.overview?.totalBookings || 0}
                  prefix={<FileTextOutlined className="text-orange-600" />}
                  valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
                  formatter={formatNumber}
                />
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <CheckCircleOutlined className="text-green-500 mr-1" />
                      Đã thanh toán:
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatNumber(overview.overview?.paidBookings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">
                      <CloseCircleOutlined className="text-red-500 mr-1" />
                      Tỷ lệ hủy:
                    </span>
                    <span className="font-semibold text-red-600">
                      {overview.overview?.cancellationRate || 0}%
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Top Routes and Operators */}
          <Row gutter={[16, 16]}>
            {/* Top Routes */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-lg font-semibold">
                    Top Tuyến Đường
                  </span>
                }
                className="shadow-lg border-0"
              >
                <div className="space-y-3">
                  {overview.topRoutes && overview.topRoutes.length > 0 ? (
                    overview.topRoutes.slice(0, 5).map((route, index) => (
                      <div
                        key={route._id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {route.routeName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {route.totalBookings} đặt vé • {route.totalTickets} vé
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {formatCurrency(route.totalRevenue)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            {/* Top Operators */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-lg font-semibold">
                    Top Nhà Xe
                  </span>
                }
                className="shadow-lg border-0"
              >
                <div className="space-y-3">
                  {overview.topOperators && overview.topOperators.length > 0 ? (
                    overview.topOperators.slice(0, 5).map((operator, index) => (
                      <div
                        key={operator._id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg hover:from-purple-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {operator.companyName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {operator.totalBookings} đặt vé • {operator.totalTickets} vé
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {formatCurrency(operator.totalRevenue)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* System Info */}
          <Card
            title={<span className="text-lg font-semibold">Thông Tin Hệ Thống</span>}
            className="shadow-lg border-0"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(overview.overview?.totalTrips || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tổng Chuyến Xe</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(overview.overview?.completedTrips || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Hoàn Thành</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(overview.revenue?.totalTickets || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Vé Đã Bán</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {(overview.growth?.bookingsGrowth || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tăng Trưởng Đặt Vé</div>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
