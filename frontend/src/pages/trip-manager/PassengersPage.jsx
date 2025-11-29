import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Space,
  message,
  Statistic,
  Row,
  Col,
  Progress,
  Select,
  Spin,
} from 'antd';
import {
  TeamOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import tripManagerApi from '../../services/tripManagerApi';
import dayjs from 'dayjs';

const { Option } = Select;

const PassengersPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    boarded: 0,
    notBoarded: 0,
  });

  // Fetch trip details and passengers
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trip details and passengers using trip manager API
      const response = await tripManagerApi.getTripDetails(tripId);
      if (response.success && response.data) {
        if (response.data.trip) {
          setTrip(response.data.trip);
        }

        if (response.data.passengers) {
          const passengersData = response.data.passengers || [];
          setPassengers(passengersData);
          setFilteredPassengers(passengersData);

          // Calculate stats
          const boardedCount = passengersData.filter((p) => p.isUsed || p.isBoarded).length;
          setStats({
            total: passengersData.length,
            boarded: boardedCount,
            notBoarded: passengersData.length - boardedCount,
          });
        }
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      message.error(error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  // Filter passengers
  useEffect(() => {
    let filtered = passengers;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.phone?.includes(searchText) ||
          p.seatNumber?.includes(searchText) ||
          p.ticketCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'boarded') {
        filtered = filtered.filter((p) => p.isUsed || p.isBoarded);
      } else if (statusFilter === 'not-boarded') {
        filtered = filtered.filter((p) => !p.isUsed && !p.isBoarded);
      }
    }

    setFilteredPassengers(filtered);
  }, [searchText, statusFilter, passengers]);

  // Get trip status tag
  const getTripStatusTag = (status) => {
    const statusConfig = {
      scheduled: { color: 'blue', text: 'Chưa bắt đầu' },
      ongoing: { color: 'green', text: 'Đang diễn ra' },
      completed: { color: 'default', text: 'Hoàn thành' },
      cancelled: { color: 'red', text: 'Đã hủy' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'Ghế',
      dataIndex: 'seatNumber',
      key: 'seatNumber',
      width: 80,
      render: (seatNumber) => (
        <Tag color="blue" className="font-semibold">
          {seatNumber}
        </Tag>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => (
        <div>
          <UserOutlined className="mr-1" />
          {name}
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <div>
          <PhoneOutlined className="mr-1" />
          {phone}
        </div>
      ),
    },
    {
      title: 'CMND/CCCD',
      dataIndex: 'idCard',
      key: 'idCard',
      render: (idCard) =>
        idCard ? (
          <div>
            <IdcardOutlined className="mr-1" />
            {idCard}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: 'Mã vé',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (code) => (
        <span className="font-mono text-xs text-gray-600">{code}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isBoarded',
      key: 'isBoarded',
      render: (isBoarded, record) =>
        (isBoarded || record.isUsed) ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã lên xe
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Chưa lên xe
          </Tag>
        ),
    },
  ];

  if (loading && !trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const boardingPercentage =
    stats.total > 0 ? Math.round((stats.boarded / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/trip-manager/dashboard')}
            >
              Quay lại
            </Button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                <TeamOutlined className="mr-2" />
                Danh sách hành khách
              </h1>
              {trip && (
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-gray-600">
                    {trip.route?.routeName} -{' '}
                    {dayjs(trip.departureTime).format('DD/MM/YYYY HH:mm')}
                  </span>
                  {getTripStatusTag(trip.status)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng hành khách"
                value={stats.total}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã lên xe"
                value={stats.boarded}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chưa lên xe"
                value={stats.notBoarded}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="text-gray-600 mb-2">Tỷ lệ lên xe</div>
              <Progress
                percent={boardingPercentage}
                status={boardingPercentage === 100 ? 'success' : 'active'}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <Space className="w-full justify-between" wrap>
            <Space wrap>
              <Input
                placeholder="Tìm theo tên, SĐT, ghế, mã vé..."
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />

              <Select
                style={{ width: 200 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">Tất cả</Option>
                <Option value="boarded">Đã lên xe</Option>
                <Option value="not-boarded">Chưa lên xe</Option>
              </Select>
            </Space>

            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => navigate(`/trip-manager/trips/${tripId}/scan`)}
            >
              Quét vé
            </Button>
          </Space>
        </Card>

        {/* Passengers Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredPassengers}
            rowKey={(record) => `${record.ticketCode}-${record.seatNumber}`}
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hành khách`,
            }}
            rowClassName={(record) =>
              (record.isBoarded || record.isUsed) ? 'bg-green-50' : ''
            }
          />
        </Card>
      </div>
    </div>
  );
};

export default PassengersPage;
