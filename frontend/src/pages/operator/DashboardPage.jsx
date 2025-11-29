import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  message,
  Select,
  Table,
  Progress,
  Tag,
} from 'antd';
import {
  CarOutlined,
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import dayjs from 'dayjs';
import api from '../../services/api';
import useOperatorAuthStore from '../../store/operatorAuthStore';

const { Option } = Select;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const { operator: user } = useOperatorAuthStore();

  useEffect(() => {
    loadDashboardStats();
  }, [period]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/operators/dashboard/stats?period=${period}`);

      console.log('📊 Dashboard response:', {
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      if (response.success) {
        setStats(response.data);
        console.log('Stats loaded:', {
          revenue: response.data.revenue,
          bookings: response.data.bookings,
          trips: response.data.trips,
          hasTrends: !!response.data.trends
        });
      } else {
        console.error(' Response not successful:', response);
      }
    } catch (error) {
      message.error(error || 'Không thể tải thống kê dashboard');
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Format trend data for charts
  const formatTrendData = (trends) => {
    if (!trends || !trends.bookings) return [];

    return trends.bookings.map((item) => ({
      name: getPeriodLabel(item.period),
      'Số đơn': item.count,
      'Doanh thu': item.revenue / 1000000, // Convert to millions
    }));
  };

  // Get period label
  const getPeriodLabel = (periodValue) => {
    if (period === 'day') {
      return `${periodValue}h`;
    } else if (period === 'year') {
      return `T${periodValue}`;
    } else {
      return `${periodValue}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  const chartData = formatTrendData(stats.trends);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Tổng Quan
          </h1>
          <p className="text-gray-600 mt-1">
            Xin chào, <strong>{user?.companyName}</strong>!
          </p>
        </div>

        <Select
          value={period}
          onChange={setPeriod}
          style={{ width: 150 }}
          size="large"
        >
          <Option value="day">Hôm nay</Option>
          <Option value="week">Tuần này</Option>
          <Option value="month">Tháng này</Option>
          <Option value="year">Năm này</Option>
        </Select>
      </div>

      {/* Revenue Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <DollarOutlined className="mr-2" />
          Doanh Thu
        </h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Doanh Thu"
                value={stats.revenue.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => formatCurrency(value)}
              />
              <div className="mt-2">
                {stats.revenue.revenueGrowth >= 0 ? (
                  <span className="text-green-600 text-sm flex items-center">
                    <RiseOutlined className="mr-1" />
                    +{stats.revenue.revenueGrowth}% so với kỳ trước
                  </span>
                ) : (
                  <span className="text-red-600 text-sm flex items-center">
                    <FallOutlined className="mr-1" />
                    {stats.revenue.revenueGrowth}% so với kỳ trước
                  </span>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Số Giao Dịch"
                value={stats.revenue.totalTransactions}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Giá Trị TB/Đơn"
                value={stats.revenue.averageOrderValue}
                valueStyle={{ color: '#13c2c2' }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Số Vé Đã Bán"
                value={stats.tickets.used + stats.tickets.valid}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={12}>
          <Card title="Xu Hướng Doanh Thu">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'Doanh thu'
                      ? [`${value.toFixed(2)}M VNĐ`, name]
                      : [value, name]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="Doanh thu"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Bookings Chart */}
        <Col xs={24} lg={12}>
          <Card title="Xu Hướng Đặt Vé">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Số đơn" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Booking Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <ShoppingCartOutlined className="mr-2" />
          Đặt Vé
        </h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Đơn"
                value={stats.bookings.total}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã Xác Nhận"
                value={stats.bookings.confirmed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đang Chờ"
                value={stats.bookings.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tỷ Lệ Hủy"
                value={stats.bookings.cancellationRate}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{
                  color: stats.bookings.cancellationRate > 10 ? '#ff4d4f' : '#52c41a',
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Trip Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <CarOutlined className="mr-2" />
          Chuyến Xe
        </h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Chuyến"
                value={stats.trips.total}
                prefix={<CarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã Hoàn Thành"
                value={stats.trips.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đang Diễn Ra"
                value={stats.trips.ongoing}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="text-gray-600 mb-2 text-sm">Tỷ Lệ Lấp Đầy</div>
              <Progress
                percent={Math.round(stats.trips.occupancyRate)}
                status={
                  stats.trips.occupancyRate >= 80
                    ? 'success'
                    : stats.trips.occupancyRate >= 50
                    ? 'normal'
                    : 'exception'
                }
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div className="mt-2 text-sm text-gray-600">
                {stats.trips.totalBooked} / {stats.trips.totalSeats} ghế
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Upcoming Trips */}
      {stats.upcomingTrips && stats.upcomingTrips.length > 0 && (
        <Card title="Chuyến Xe Sắp Khởi Hành">
          <Table
            dataSource={stats.upcomingTrips}
            rowKey="_id"
            pagination={false}
            columns={[
              {
                title: 'Tuyến Đường',
                dataIndex: ['routeId', 'routeName'],
                key: 'route',
              },
              {
                title: 'Xe',
                dataIndex: ['busId', 'busNumber'],
                key: 'bus',
                render: (busNumber, record) => (
                  <span>
                    {busNumber} ({record.busId?.busType})
                  </span>
                ),
              },
              {
                title: 'Giờ Đi',
                dataIndex: 'departureTime',
                key: 'departureTime',
                render: (time) => dayjs(time).format('DD/MM/YYYY HH:mm'),
              },
              {
                title: 'Ghế',
                key: 'seats',
                render: (_, record) => (
                  <span>
                    {record.bookedSeats?.length || 0} / {record.totalSeats}
                  </span>
                ),
              },
              {
                title: 'Lấp Đầy',
                key: 'occupancy',
                render: (_, record) => {
                  const rate = record.totalSeats > 0
                    ? Math.round((record.bookedSeats?.length || 0) / record.totalSeats * 100)
                    : 0;
                  return (
                    <Progress
                      percent={rate}
                      size="small"
                      status={rate >= 80 ? 'success' : 'normal'}
                    />
                  );
                },
              },
              {
                title: 'Trạng Thái',
                dataIndex: 'status',
                key: 'status',
                render: (status) => {
                  const colors = {
                    scheduled: 'blue',
                    ongoing: 'green',
                    completed: 'default',
                    cancelled: 'red',
                  };
                  const labels = {
                    scheduled: 'Sắp đi',
                    ongoing: 'Đang diễn ra',
                    completed: 'Hoàn thành',
                    cancelled: 'Đã hủy',
                  };
                  return <Tag color={colors[status]}>{labels[status]}</Tag>;
                },
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
