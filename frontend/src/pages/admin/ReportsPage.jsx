import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Spin,
  Alert,
  Space,
  Button,
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { adminReports } from '../../services/adminApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [chartType, setChartType] = useState('line');

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
      setError(err || 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Tính năng export đang được phát triển...');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const formatShortCurrency = (value) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value;
  };

  // Prepare revenue trend data
  const revenueTrendData =
    overview?.revenueTrend?.map((item) => ({
      date: dayjs(item.date).format('DD/MM'),
      revenue: item.revenue,
      bookings: item.bookings,
      tickets: item.tickets || 0,
    })) || [];

  // Prepare top routes data for bar chart
  const topRoutesData =
    overview?.topRoutes?.slice(0, 10).map((route) => ({
      name: route.routeName || `${route.origin} - ${route.destination}`,
      revenue: route.totalRevenue,
      bookings: route.totalBookings,
      tickets: route.totalTickets,
    })) || [];

  // Prepare top operators data for bar chart
  const topOperatorsData =
    overview?.topOperators?.slice(0, 10).map((operator) => ({
      name: operator.companyName,
      revenue: operator.totalRevenue,
      bookings: operator.totalBookings,
      tickets: operator.totalTickets,
    })) || [];

  // Prepare booking status pie data
  const bookingStatusData = overview
    ? [
        { name: 'Đã Thanh Toán', value: overview.overview?.paidBookings || 0 },
        { name: 'Đã Hủy', value: overview.overview?.cancelledBookings || 0 },
        {
          name: 'Chờ Thanh Toán',
          value:
            (overview.overview?.totalBookings || 0) -
            (overview.overview?.paidBookings || 0) -
            (overview.overview?.cancelledBookings || 0),
        },
      ]
    : [];

  // Prepare operator status pie data
  const operatorStatusData = overview
    ? [
        { name: 'Đã Duyệt', value: overview.overview?.approvedOperators || 0 },
        { name: 'Chờ Duyệt', value: overview.overview?.pendingOperators || 0 },
      ]
    : [];

  const COLORS = ['#52c41a', '#f5222d', '#faad14', '#1890ff', '#722ed1'];

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" tip="Đang tải báo cáo..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Lỗi" description={error} showIcon />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Báo Cáo & Phân Tích
          </h1>
          <p className="text-gray-600 mt-1">
            Thống kê chi tiết và phân tích dữ liệu hệ thống
          </p>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOverview}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất Báo Cáo
          </Button>
        </Space>
      </div>

      {overview && (
        <>
          {/* Key Metrics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md border-0">
                <Statistic
                  title="Tổng Doanh Thu"
                  value={overview.revenue?.totalRevenue || 0}
                  precision={0}
                  valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                  prefix="₫"
                  suffix={
                    <span className="text-sm ml-2">
                      {overview.growth?.revenueGrowth >= 0 ? (
                        <span className="text-green-600">
                          <ArrowUpOutlined />{' '}
                          {overview.growth?.revenueGrowth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-red-600">
                          <ArrowDownOutlined />{' '}
                          {Math.abs(overview.growth?.revenueGrowth).toFixed(1)}%
                        </span>
                      )}
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md border-0">
                <Statistic
                  title="Tổng Đặt Vé"
                  value={overview.overview?.totalBookings || 0}
                  valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                  suffix={
                    <span className="text-sm ml-2">
                      {overview.growth?.bookingsGrowth >= 0 ? (
                        <span className="text-green-600">
                          <ArrowUpOutlined />{' '}
                          {overview.growth?.bookingsGrowth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-red-600">
                          <ArrowDownOutlined />{' '}
                          {Math.abs(overview.growth?.bookingsGrowth).toFixed(1)}%
                        </span>
                      )}
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md border-0">
                <Statistic
                  title="Người Dùng Mới"
                  value={overview.overview?.newUsers || 0}
                  valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                  suffix={
                    <span className="text-sm ml-2">
                      {overview.growth?.usersGrowth >= 0 ? (
                        <span className="text-green-600">
                          <ArrowUpOutlined />{' '}
                          {overview.growth?.usersGrowth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-red-600">
                          <ArrowDownOutlined />{' '}
                          {Math.abs(overview.growth?.usersGrowth).toFixed(1)}%
                        </span>
                      )}
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md border-0">
                <Statistic
                  title="Giá Trị TB/Đơn"
                  value={overview.revenue?.averageOrderValue || 0}
                  precision={0}
                  valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
                  prefix="₫"
                />
              </Card>
            </Col>
          </Row>

          {/* Revenue Trend Chart */}
          <Card
            title={
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  Xu Hướng Doanh Thu & Đặt Vé
                </span>
                <Select
                  value={chartType}
                  onChange={setChartType}
                  style={{ width: 120 }}
                >
                  <Option value="line">Line Chart</Option>
                  <Option value="bar">Bar Chart</Option>
                </Select>
              </div>
            }
            className="shadow-md border-0"
          >
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'line' ? (
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={formatShortCurrency}
                    label={{ value: 'Doanh Thu', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Số Đặt Vé', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return [formatCurrency(value), 'Doanh Thu'];
                      }
                      return [formatNumber(value), name === 'bookings' ? 'Đặt Vé' : 'Vé Bán'];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#52c41a"
                    strokeWidth={3}
                    name="Doanh Thu"
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="Đặt Vé"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={formatShortCurrency}
                    label={{ value: 'Doanh Thu', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Số Đặt Vé', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return [formatCurrency(value), 'Doanh Thu'];
                      }
                      return [formatNumber(value), 'Đặt Vé'];
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#52c41a"
                    name="Doanh Thu"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="bookings"
                    fill="#1890ff"
                    name="Đặt Vé"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Card>

          {/* Charts Row */}
          <Row gutter={[16, 16]}>
            {/* Top Routes Bar Chart */}
            <Col xs={24} lg={12}>
              <Card
                title={<span className="text-lg font-semibold">Top 10 Tuyến Đường</span>}
                className="shadow-md border-0"
              >
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topRoutesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatShortCurrency} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'revenue') {
                          return [formatCurrency(value), 'Doanh Thu'];
                        }
                        return [formatNumber(value), name === 'bookings' ? 'Đặt Vé' : 'Vé'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#1890ff" name="Doanh Thu" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Top Operators Bar Chart */}
            <Col xs={24} lg={12}>
              <Card
                title={<span className="text-lg font-semibold">Top 10 Nhà Xe</span>}
                className="shadow-md border-0"
              >
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topOperatorsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatShortCurrency} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'revenue') {
                          return [formatCurrency(value), 'Doanh Thu'];
                        }
                        return [formatNumber(value), name === 'bookings' ? 'Đặt Vé' : 'Vé'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#722ed1" name="Doanh Thu" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Pie Charts Row */}
          <Row gutter={[16, 16]}>
            {/* Booking Status Pie */}
            <Col xs={24} lg={12}>
              <Card
                title={<span className="text-lg font-semibold">Trạng Thái Đặt Vé</span>}
                className="shadow-md border-0"
              >
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Operator Status Pie */}
            <Col xs={24} lg={12}>
              <Card
                title={<span className="text-lg font-semibold">Trạng Thái Nhà Xe</span>}
                className="shadow-md border-0"
              >
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={operatorStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {operatorStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Summary Stats */}
          <Card
            title={<span className="text-lg font-semibold">Thống Kê Tổng Hợp</span>}
            className="shadow-md border-0"
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatNumber(overview.overview?.totalUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tổng Người Dùng</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {formatNumber(overview.overview?.activeUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Người Dùng Hoạt Động</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatNumber(overview.overview?.totalOperators || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tổng Nhà Xe</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatNumber(overview.revenue?.totalTickets || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tổng Vé Đã Bán</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {overview.overview?.cancellationRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tỷ Lệ Hủy</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600">
                    {formatNumber(overview.overview?.totalTrips || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tổng Chuyến Xe</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-600">
                    {formatNumber(overview.overview?.completedTrips || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Chuyến Hoàn Thành</div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-pink-600">
                    {formatNumber(overview.overview?.paidBookings || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Đặt Vé Thành Công</div>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
