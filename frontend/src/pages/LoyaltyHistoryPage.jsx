import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Timeline,
  Tag,
  Button,
  Empty,
  Pagination,
  Typography,
  message,
  Select,
  Space,
  Row,
  Col,
  Statistic,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  GiftOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
  getLoyaltyHistory,
  getTransactionIcon,
  getTransactionLabel,
  getTransactionColor,
  formatPoints,
  getTierLabel,
  getTierColor,
} from '../services/loyaltyApi';
import CustomerLayout from '../components/layouts/CustomerLayout';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;
const { Option } = Select;

const LoyaltyHistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [tierBenefits, setTierBenefits] = useState(null);
  const [pointsExpiringSoon, setPointsExpiringSoon] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterType, setFilterType] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchHistory();
  }, [currentPage, filterType]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        type: filterType || undefined,
      };

      const response = await getLoyaltyHistory(params);

      if (response.success) {
        setHistory(response.data.history || []);
        setUser(response.data.user);
        setTierBenefits(response.data.tierBenefits);
        setPointsExpiringSoon(response.data.pointsExpiringSoon);
        setTotalRecords(response.data.pagination.totalRecords);
      }
    } catch (error) {
      console.error('Error fetching loyalty history:', error);
      message.error('Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (value) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const renderTimelineItem = (entry) => {
    const type = entry.type;
    const color = getTransactionColor(type);
    const isPositive = type === 'earn';
    const isNegative = type === 'redeem' || type === 'expire';

    return {
      color: color,
      dot:
        type === 'earn' ? (
          <TrophyOutlined className="text-lg" />
        ) : type === 'redeem' ? (
          <GiftOutlined className="text-lg" />
        ) : (
          <ClockCircleOutlined className="text-lg" />
        ),
      children: (
        <Card
          size="small"
          className={`hover:shadow-md transition-shadow ${
            isPositive
              ? 'border-l-4 border-green-500'
              : isNegative
              ? 'border-l-4 border-red-500'
              : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Tag color={color} className="mb-0">
                  {getTransactionIcon(type)} {getTransactionLabel(type)}
                </Tag>
                <Text
                  strong
                  className={`text-lg ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : ''
                  }`}
                >
                  {formatPoints(entry.points, type)} điểm
                </Text>
              </div>

              <Text className="block text-gray-700 mb-2">{entry.reason}</Text>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>
                  <ClockCircleOutlined className="mr-1" />
                  {dayjs(entry.createdAt).format('DD/MM/YYYY HH:mm')}
                </span>
                <span>({dayjs(entry.createdAt).fromNow()})</span>
              </div>

              {entry.expiresAt && type === 'earn' && !entry.isExpired && (
                <div className="mt-2">
                  <Text className="text-xs text-orange-500">
                    <ThunderboltOutlined /> Hết hạn:{' '}
                    {dayjs(entry.expiresAt).format('DD/MM/YYYY')}
                  </Text>
                </div>
              )}

              {entry.isExpired && (
                <Tag color="default" className="mt-2">
                  Đã hết hạn
                </Tag>
              )}
            </div>
          </div>
        </Card>
      ),
    };
  };

  const tierColor = user ? getTierColor(user.loyaltyTier) : '#1890ff';

  return (
    <CustomerLayout>
      {loading && !history.length ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Đang tải lịch sử..." />
        </div>
      ) : (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/loyalty')}
          >
            Quay lại
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Title level={2} className="mb-6">
          <TrophyOutlined className="mr-2" style={{ color: tierColor }} />
          Lịch sử điểm thưởng
        </Title>

        {/* Summary Statistics */}
        {user && (
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Hạng hiện tại"
                  value={getTierLabel(user.loyaltyTier)}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: tierColor }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Tổng điểm"
                  value={user.totalPoints}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  suffix="điểm"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Sắp hết hạn"
                  value={pointsExpiringSoon}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: pointsExpiringSoon > 0 ? '#fa8c16' : '#52c41a' }}
                  suffix="điểm"
                />
                {pointsExpiringSoon > 0 && (
                  <Text className="text-sm text-orange-500">Trong 30 ngày</Text>
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Filter */}
        <Card className="mb-4">
          <Space>
            <Text strong>Lọc theo loại:</Text>
            <Select
              placeholder="Tất cả giao dịch"
              style={{ width: 200 }}
              value={filterType || undefined}
              onChange={handleFilterChange}
              allowClear
            >
              <Option value="earn">💰 Tích điểm</Option>
              <Option value="redeem">🎁 Đổi điểm</Option>
              <Option value="expire">Hết hạn</Option>
            </Select>
          </Space>
        </Card>

        {/* Timeline */}
        {loading ? (
          <Card loading={true} />
        ) : history.length === 0 ? (
          <Card>
            <Empty
              description={
                filterType
                  ? 'Không tìm thấy giao dịch nào'
                  : 'Chưa có lịch sử giao dịch'
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {!filterType && (
                <Button
                  type="primary"
                  onClick={() => navigate('/loyalty')}
                >
                  Về trang chủ Loyalty
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <>
            <Card>
              <Timeline
                mode="left"
                items={history.map(renderTimelineItem)}
              />
            </Card>

            {/* Pagination */}
            {totalRecords > pageSize && (
              <div className="flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  total={totalRecords}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `Tổng ${total} giao dịch`}
                />
              </div>
            )}
          </>
        )}
      </div>
      </div>
      )}
    </CustomerLayout>
  );
};

export default LoyaltyHistoryPage;
