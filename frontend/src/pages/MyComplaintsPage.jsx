import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  List,
  Tag,
  Button,
  Empty,
  Pagination,
  Typography,
  message,
  Select,
  Space,
  Descriptions,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { MdReportProblem } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import CustomerLayout from '../components/layouts/CustomerLayout';
import {
  getMyComplaints,
  getCategoryLabel,
  getStatusLabel,
  getPriorityLabel,
  getStatusColor,
  getPriorityColor,
} from '../services/complaintApi';
import CreateComplaintModal from '../components/CreateComplaintModal';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;
const { Option } = Select;

const MyComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const pageSize = 10;

  useEffect(() => {
    fetchComplaints();
  }, [currentPage, filterStatus, filterCategory]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        sort: '-createdAt',
      };

      const response = await getMyComplaints(params);

      if (response.status === 'success') {
        setComplaints(response.data || []);
        setTotalComplaints(response.pagination?.total || 0);

        // Calculate statistics
        calculateStatistics(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      message.error('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const stats = {
      total: data.length,
      open: data.filter((c) => c.status === 'open').length,
      inProgress: data.filter((c) => c.status === 'in_progress').length,
      resolved: data.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
    };
    setStatistics(stats);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintCreated = () => {
    setIsModalOpen(false);
    setCurrentPage(1);
    fetchComplaints();
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <ExclamationCircleOutlined />,
      in_progress: <SyncOutlined spin />,
      resolved: <CheckCircleOutlined />,
      closed: <CloseCircleOutlined />,
      rejected: <CloseCircleOutlined />,
    };
    return icons[status] || <ExclamationCircleOutlined />;
  };

  const renderComplaintCard = (complaint) => {
    return (
      <Card
        className="mb-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/complaints/${complaint._id}`)}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag color="blue" className="font-mono">
                {complaint.ticketNumber}
              </Tag>
              <Tag color={getStatusColor(complaint.status)} icon={getStatusIcon(complaint.status)}>
                {getStatusLabel(complaint.status)}
              </Tag>
              <Tag color={getPriorityColor(complaint.priority)}>
                {getPriorityLabel(complaint.priority)}
              </Tag>
            </div>
            <Title level={5} className="mb-1">
              {complaint.subject}
            </Title>
            <Text className="text-gray-500 text-sm">
              <ClockCircleOutlined className="mr-1" />
              {dayjs(complaint.createdAt).fromNow()} •{' '}
              {getCategoryLabel(complaint.category)}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/complaints/${complaint._id}`);
            }}
          >
            Xem chi tiết
          </Button>
        </div>

        {/* Description Preview */}
        <Text className="block text-gray-700 mb-3 line-clamp-2">
          {complaint.description}
        </Text>

        {/* Bottom Info */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <Space>
            {complaint.bookingId && (
              <Tag>
                Vé: {complaint.bookingId.bookingCode}
              </Tag>
            )}
            {complaint.assignedTo && (
              <Tag color="green">
                Được phân công: {complaint.assignedTo.fullName}
              </Tag>
            )}
            {complaint.notes && complaint.notes.length > 0 && (
              <Text className="text-sm text-gray-500">
                💬 {complaint.notes.length} ghi chú
              </Text>
            )}
          </Space>

          {complaint.status === 'resolved' && !complaint.satisfactionRating && (
            <Tag color="orange">Chờ đánh giá</Tag>
          )}
        </div>
      </Card>
    );
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              className="mb-4"
            >
              Quay lại
            </Button>
            <div className="flex justify-between items-center mb-4">
              <Title level={2} className="mb-0">
                <MdReportProblem className="text-orange-500 mr-2 inline" />
                Khiếu nại của tôi
              </Title>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Tạo khiếu nại mới
              </Button>
            </div>

            {/* Statistics */}
            {complaints.length > 0 && (
              <Row gutter={16} className="mt-4">
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Tổng số"
                    value={totalComplaints}
                    prefix={<MdReportProblem />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Mới tạo"
                    value={statistics.open}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Đang xử lý"
                    value={statistics.inProgress}
                    prefix={<SyncOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Đã giải quyết"
                    value={statistics.resolved}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              </Row>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Filters */}
        <Card className="mb-4">
          <Space wrap>
            <Text strong>Lọc theo:</Text>
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              value={filterStatus || undefined}
              onChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
              allowClear
            >
              <Option value="open">Mới tạo</Option>
              <Option value="in_progress">Đang xử lý</Option>
              <Option value="resolved">Đã giải quyết</Option>
              <Option value="closed">Đã đóng</Option>
              <Option value="rejected">Bị từ chối</Option>
            </Select>

            <Select
              placeholder="Danh mục"
              style={{ width: 150 }}
              value={filterCategory || undefined}
              onChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
              allowClear
            >
              <Option value="booking">🎫 Đặt vé</Option>
              <Option value="payment">💳 Thanh toán</Option>
              <Option value="service">🤝 Dịch vụ</Option>
              <Option value="driver">👨‍✈️ Tài xế</Option>
              <Option value="vehicle">🚌 Xe</Option>
              <Option value="refund">💰 Hoàn tiền</Option>
              <Option value="technical">⚙️ Kỹ thuật</Option>
              <Option value="other">📝 Khác</Option>
            </Select>

            {(filterStatus || filterCategory) && (
              <Button
                onClick={() => {
                  setFilterStatus('');
                  setFilterCategory('');
                  setCurrentPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </Space>
        </Card>

        {/* Complaints List */}
        {loading ? (
          <Card loading={true} />
        ) : complaints.length === 0 ? (
          <Card>
            <Empty
              description={
                filterStatus || filterCategory
                  ? 'Không tìm thấy khiếu nại nào'
                  : 'Bạn chưa có khiếu nại nào'
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {!filterStatus && !filterCategory && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Tạo khiếu nại mới
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <>
            <List
              dataSource={complaints}
              renderItem={renderComplaintCard}
            />

            {/* Pagination */}
            {totalComplaints > pageSize && (
              <div className="flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  total={totalComplaints}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `Tổng ${total} khiếu nại`}
                />
              </div>
            )}
          </>
        )}
        </div>

        {/* Create Complaint Modal */}
        <CreateComplaintModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={handleComplaintCreated}
        />
      </div>
    </CustomerLayout>
  );
};

export default MyComplaintsPage;
