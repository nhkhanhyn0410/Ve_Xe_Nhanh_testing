import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  message,
  DatePicker,
  Button,
  Table,
  Tag,
  Select,
  Space,
  Divider,
  Empty,
} from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';
import { reportsApi, downloadFile } from '../../services/reportApi';
import useOperatorAuthStore from '../../store/operatorAuthStore';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState({ excel: false, pdf: false });
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const { operator: user } = useOperatorAuthStore();

  useEffect(() => {
    loadReport();
  }, [dateRange, selectedRoute]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };

      if (selectedRoute) {
        params.routeId = selectedRoute;
      }

      const response = await reportsApi.getRevenueReport(params);

      if (response.success) {
        setReportData(response.data);

        // Extract unique routes from revenueByRoute for filter dropdown
        if (response.data.revenueByRoute) {
          const uniqueRoutes = response.data.revenueByRoute.map(route => ({
            id: route.routeId,
            name: route.routeName,
          }));
          setRoutes(uniqueRoutes);
        }
      }
    } catch (error) {
      message.error('Không thể tải báo cáo doanh thu');
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting({ ...exporting, excel: true });
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };

      if (selectedRoute) {
        params.routeId = selectedRoute;
      }

      const blob = await reportsApi.exportToExcel(params);
      const filename = `revenue-report-${params.startDate}-to-${params.endDate}.xlsx`;
      downloadFile(blob, filename);
      message.success('Xuất Excel thành công');
    } catch (error) {
      message.error('Không thể xuất Excel');
      console.error('Error exporting Excel:', error);
    } finally {
      setExporting({ ...exporting, excel: false });
    }
  };

  const handleExportPDF = async () => {
    setExporting({ ...exporting, pdf: true });
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };

      if (selectedRoute) {
        params.routeId = selectedRoute;
      }

      const blob = await reportsApi.exportToPDF(params);
      const filename = `revenue-report-${params.startDate}-to-${params.endDate}.pdf`;
      downloadFile(blob, filename);
      message.success('Xuất PDF thành công');
    } catch (error) {
      message.error('Không thể xuất PDF');
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting({ ...exporting, pdf: false });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return dayjs(dateStr).format('DD/MM/YYYY');
  };

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  const summary = reportData?.summary || {};
  const revenueByRoute = reportData?.revenueByRoute || [];
  const topRoutes = reportData?.topRoutes || [];
  const revenueTrend = reportData?.revenueTrend || [];
  const cancellationReport = reportData?.cancellationReport || {};
  const growthMetrics = reportData?.growthMetrics || {};

  // Format trend data for chart
  const trendChartData = revenueTrend.map((item) => ({
    date: formatDate(item.date),
    'Doanh thu': item.revenue,
    'Số đơn': item.bookings,
  }));

  // Format route data for chart
  const routeChartData = revenueByRoute.slice(0, 10).map((route) => ({
    name: route.routeName.length > 20
      ? route.routeName.substring(0, 20) + '...'
      : route.routeName,
    'Doanh thu': route.totalRevenue,
    'Số vé': route.ticketCount,
  }));

  // Top routes table columns
  const topRoutesColumns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 70,
      render: (_, __, index) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        return (
          <span style={{ color: colors[index] || '#666', fontWeight: 'bold' }}>
            #{index + 1}
          </span>
        );
      },
    },
    {
      title: 'Tuyến Đường',
      dataIndex: 'routeName',
      key: 'routeName',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Số Vé',
      dataIndex: 'ticketCount',
      key: 'ticketCount',
      align: 'right',
      render: (count) => (count || 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Doanh Thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (revenue) => formatCurrency(revenue || 0),
    },
    {
      title: 'Giá TB/Vé',
      dataIndex: 'averagePrice',
      key: 'averagePrice',
      align: 'right',
      render: (price) => formatCurrency(price || 0),
    },
    {
      title: 'Tỷ Lệ Hủy',
      dataIndex: 'cancellationRate',
      key: 'cancellationRate',
      align: 'right',
      render: (rate) => {
        const safeRate = rate || 0;
        return (
          <Tag color={safeRate > 15 ? 'red' : safeRate > 10 ? 'orange' : 'green'}>
            {safeRate.toFixed(1)}%
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Báo Cáo Doanh Thu
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích và theo dõi hiệu suất kinh doanh
          </p>
        </div>

        <Space wrap>
          <Select
            placeholder="Tất cả tuyến"
            allowClear
            style={{ width: 200 }}
            onChange={setSelectedRoute}
            value={selectedRoute}
          >
            {routes.map((route) => (
              <Option key={route.id} value={route.id}>
                {route.name}
              </Option>
            ))}
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            style={{ width: 280 }}
            presets={[
              { label: '7 ngày qua', value: [dayjs().subtract(7, 'days'), dayjs()] },
              { label: '30 ngày qua', value: [dayjs().subtract(30, 'days'), dayjs()] },
              { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs()] },
              { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
            ]}
          />

          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={exporting.excel}
            type="primary"
            style={{ backgroundColor: '#52c41a' }}
          >
            Xuất Excel
          </Button>

          <Button
            icon={<FilePdfOutlined />}
            onClick={handleExportPDF}
            loading={exporting.pdf}
            type="primary"
            danger
          >
            Xuất PDF
          </Button>
        </Space>
      </div>

      {/* Summary Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BarChartOutlined className="mr-2" />
          Tổng Quan
        </h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Doanh Thu"
                value={summary.totalRevenue || 0}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => formatCurrency(value)}
              />
              {growthMetrics.revenueGrowth !== undefined && (
                <div className="mt-2">
                  {growthMetrics.revenueGrowth >= 0 ? (
                    <span className="text-green-600 text-sm flex items-center">
                      <RiseOutlined className="mr-1" />
                      +{growthMetrics.revenueGrowth.toFixed(1)}% so với kỳ trước
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm flex items-center">
                      <FallOutlined className="mr-1" />
                      {growthMetrics.revenueGrowth.toFixed(1)}% so với kỳ trước
                    </span>
                  )}
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Số Giao Dịch"
                value={summary.totalBookings || 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              {growthMetrics.bookingsGrowth !== undefined && (
                <div className="mt-2">
                  {growthMetrics.bookingsGrowth >= 0 ? (
                    <span className="text-green-600 text-sm flex items-center">
                      <RiseOutlined className="mr-1" />
                      +{growthMetrics.bookingsGrowth.toFixed(1)}% so với kỳ trước
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm flex items-center">
                      <FallOutlined className="mr-1" />
                      {growthMetrics.bookingsGrowth.toFixed(1)}% so với kỳ trước
                    </span>
                  )}
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Giá Trị TB/Đơn"
                value={summary.averageOrderValue || 0}
                valueStyle={{ color: '#13c2c2' }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tỷ Lệ Hủy"
                value={cancellationReport.cancellationRate || 0}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{
                  color: (cancellationReport.cancellationRate || 0) > 10 ? '#ff4d4f' : '#52c41a',
                }}
              />
              <div className="mt-2 text-sm text-gray-600">
                {cancellationReport.totalCancelled || 0} / {summary.totalBookings || 0} đơn hủy
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Revenue Trend Chart */}
        <Col xs={24} lg={16}>
          <Card title="Xu Hướng Doanh Thu" loading={loading}>
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Doanh thu'
                        ? [formatCurrency(value), name]
                        : [value, name]
                    }
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="Doanh thu"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Số đơn"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>

        {/* Cancellation Stats */}
        <Col xs={24} lg={8}>
          <Card title="Thống Kê Hủy Vé" loading={loading}>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                <div>
                  <div className="text-sm text-gray-600">Tổng Hủy</div>
                  <div className="text-2xl font-bold text-red-600">
                    {cancellationReport.totalCancelled || 0}
                  </div>
                </div>
                <CloseCircleOutlined style={{ fontSize: 40, color: '#ff4d4f' }} />
              </div>

              <Divider />

              <div>
                <div className="text-sm text-gray-600 mb-2">Hủy Theo Tuyến</div>
                {cancellationReport.byRoute && cancellationReport.byRoute.length > 0 ? (
                  <div className="space-y-2">
                    {cancellationReport.byRoute.slice(0, 5).map((route, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate" style={{ maxWidth: '150px' }}>
                          {route.routeName}
                        </span>
                        <span className="font-semibold text-red-600">
                          {route.cancellations}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="Không có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Revenue by Route Chart */}
      {routeChartData.length > 0 && (
        <Card title="Doanh Thu Theo Tuyến (Top 10)" loading={loading}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={routeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === 'Doanh thu'
                    ? [formatCurrency(value), name]
                    : [value, name]
                }
              />
              <Legend />
              <Bar dataKey="Doanh thu" fill="#8884d8" />
              <Bar dataKey="Số vé" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top Routes Table */}
      {topRoutes.length > 0 && (
        <Card
          title={
            <span className="flex items-center">
              <TrophyOutlined className="mr-2" style={{ color: '#FFD700' }} />
              Top Tuyến Đường Có Doanh Thu Cao
            </span>
          }
          loading={loading}
        >
          <Table
            dataSource={topRoutes}
            columns={topRoutesColumns}
            rowKey="routeId"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Period Comparison */}
      {growthMetrics.currentPeriod && (
        <Card title="So Sánh Kỳ" loading={loading}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="p-4 bg-blue-50 rounded">
                <div className="text-sm text-gray-600 mb-2">Kỳ Hiện Tại</div>
                <div className="text-sm text-gray-700 mb-3">
                  {dayjs(growthMetrics.currentPeriod.startDate).format('DD/MM/YYYY')} - {dayjs(growthMetrics.currentPeriod.endDate).format('DD/MM/YYYY')}
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-600">Doanh thu</div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(growthMetrics.currentPeriod.revenue)}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-600">Số đơn</div>
                    <div className="text-lg font-bold text-blue-600">
                      {growthMetrics.currentPeriod.bookings}
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-2">Kỳ Trước</div>
                <div className="text-sm text-gray-700 mb-3">
                  {dayjs(growthMetrics.previousPeriod.startDate).format('DD/MM/YYYY')} - {dayjs(growthMetrics.previousPeriod.endDate).format('DD/MM/YYYY')}
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-600">Doanh thu</div>
                    <div className="text-lg font-bold text-gray-700">
                      {formatCurrency(growthMetrics.previousPeriod.revenue)}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-600">Số đơn</div>
                    <div className="text-lg font-bold text-gray-700">
                      {growthMetrics.previousPeriod.bookings}
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
