import { useState, useEffect } from 'react';
import {
  Card,
  Rate,
  Progress,
  List,
  Avatar,
  Space,
  Tag,
  Button,
  Empty,
  Pagination,
  Image,
  Typography,
  message,
  Form,
  Input,
  Modal,
  Select,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { FaBus, FaUserTie, FaClock, FaSmile } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getOperatorReviews, addOperatorResponse } from '../services/reviewApi';
import useOperatorAuthStore from '../store/operatorAuthStore';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OperatorReviewsPage = () => {
  const { operator: user } = useOperatorAuthStore();
  const operatorId = user?.operatorId;

  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState('latest');
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseForm] = Form.useForm();
  const pageSize = 10;

  useEffect(() => {
    if (operatorId) {
      fetchReviews();
    }
  }, [operatorId, currentPage, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        sort: sortBy,
      };

      const response = await getOperatorReviews(operatorId, params);

      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setStatistics(response.data.statistics || null);
        setTotalReviews(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponseModal = (review) => {
    setSelectedReview(review);
    if (review.operatorResponse) {
      responseForm.setFieldsValue({
        operatorResponse: review.operatorResponse,
      });
    } else {
      responseForm.resetFields();
    }
    setResponseModalOpen(true);
  };

  const handleSubmitResponse = async (values) => {
    try {
      await addOperatorResponse(selectedReview._id, values);
      message.success('Đã gửi phản hồi thành công');
      setResponseModalOpen(false);
      responseForm.resetFields();
      fetchReviews();
    } catch (error) {
      console.error('Error submitting response:', error);
      message.error('Không thể gửi phản hồi');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderRatingDistribution = () => {
    if (!statistics?.distribution) return null;

    const distribution = statistics.distribution;
    const total = statistics.totalReviews || 0;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm">{star}</span>
                <StarFilled className="text-yellow-500 text-xs" />
              </div>
              <Progress
                percent={percentage}
                showInfo={false}
                strokeColor="#fadb14"
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12 text-right">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailedRating = (label, value, icon, color) => {
    if (!value) return null;

    return (
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          {icon && <span className={`text-${color}-500`}>{icon}</span>}
          <Text className="text-sm">{label}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Rate disabled value={value} allowHalf className="text-xs" />
          <Text className="text-xs text-gray-500">({value.toFixed(1)})</Text>
        </div>
      </div>
    );
  };

  const renderReviewCard = (review) => {
    const trip = review.trip;
    const hasResponse = !!review.operatorResponse;

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        {/* Header with Trip Info */}
        <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
          <div>
            <Space className="mb-2">
              <EnvironmentOutlined className="text-blue-500" />
              <Text strong>
                {trip?.route?.origin?.city} → {trip?.route?.destination?.city}
              </Text>
            </Space>
            <div className="text-sm text-gray-500">
              <CalendarOutlined className="mr-1" />
              {dayjs(trip?.departureTime).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
          <div className="text-right">
            <Rate disabled value={review.overallRating} allowHalf className="text-lg" />
            <div className="text-sm text-gray-500 mt-1">
              {review.overallRating.toFixed(1)}/5
            </div>
          </div>
        </div>

        {/* Customer Info and Review Time */}
        <div className="flex items-center justify-between mb-3">
          <Space>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              src={review.user?.profilePicture}
            />
            <div>
              <Text strong>{review.user?.fullName || 'Khách hàng'}</Text>
              <div className="text-sm text-gray-500">
                {dayjs(review.createdAt).fromNow()}
              </div>
            </div>
          </Space>
          {hasResponse ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Đã phản hồi
            </Tag>
          ) : (
            <Tag color="orange" icon={<ClockCircleOutlined />}>
              Chưa phản hồi
            </Tag>
          )}
        </div>

        {/* Detailed Ratings */}
        {(review.vehicleRating ||
          review.driverRating ||
          review.punctualityRating ||
          review.serviceRating) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <Text strong className="text-sm text-gray-700 block mb-2">
              Đánh giá chi tiết
            </Text>
            <div className="space-y-1">
              {renderDetailedRating('Xe', review.vehicleRating, <FaBus />, 'blue')}
              {renderDetailedRating('Tài xế', review.driverRating, <FaUserTie />, 'green')}
              {renderDetailedRating('Đúng giờ', review.punctualityRating, <FaClock />, 'orange')}
              {renderDetailedRating('Phục vụ', review.serviceRating, <FaSmile />, 'purple')}
            </div>
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <Paragraph className="mb-3 text-gray-700 bg-blue-50 p-3 rounded-lg">
            "{review.comment}"
          </Paragraph>
        )}

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="mb-3">
            <Image.PreviewGroup>
              <Space wrap>
                {review.images.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`Review image ${index + 1}`}
                    width={100}
                    height={100}
                    className="object-cover rounded"
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </div>
        )}

        {/* Operator Response */}
        {hasResponse && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageOutlined className="text-green-600" />
              <Text strong className="text-green-700">
                Phản hồi của bạn
              </Text>
              <Text className="text-sm text-gray-500">
                {dayjs(review.operatorResponseDate).fromNow()}
              </Text>
            </div>
            <Paragraph className="mb-0 text-gray-700">
              {review.operatorResponse}
            </Paragraph>
          </div>
        )}

        {/* Response Button */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <Button
            type={hasResponse ? 'default' : 'primary'}
            icon={<MessageOutlined />}
            onClick={() => handleOpenResponseModal(review)}
          >
            {hasResponse ? 'Chỉnh sửa phản hồi' : 'Phản hồi'}
          </Button>
        </div>
      </Card>
    );
  };

  const averageRating = statistics?.averageRating || 0;
  const totalCount = statistics?.totalReviews || 0;
  const respondedCount = reviews.filter((r) => r.operatorResponse).length;
  const pendingCount = reviews.filter((r) => !r.operatorResponse).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Title level={2} className="mb-4">
            <StarOutlined className="text-yellow-500 mr-2" />
            Quản lý đánh giá
          </Title>

          {/* Statistics Summary */}
          {statistics && totalCount > 0 && (
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Tổng đánh giá"
                    value={totalCount}
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Điểm trung bình"
                    value={averageRating.toFixed(1)}
                    suffix="/ 5"
                    valueStyle={{ color: '#fadb14' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Đã phản hồi"
                    value={respondedCount}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Chưa phản hồi"
                    value={pendingCount}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Row gutter={[24, 24]}>
          {/* Left Column - Reviews List */}
          <Col xs={24} lg={16}>
            {/* Sort and Filter */}
            <Card className="mb-4">
              <div className="flex justify-between items-center">
                <Text strong>Danh sách đánh giá</Text>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 200 }}
                >
                  <Option value="latest">Mới nhất</Option>
                  <Option value="oldest">Cũ nhất</Option>
                  <Option value="highest">Điểm cao nhất</Option>
                  <Option value="lowest">Điểm thấp nhất</Option>
                  <Option value="needsResponse">Cần phản hồi</Option>
                </Select>
              </div>
            </Card>

            {/* Reviews List */}
            {loading ? (
              <Card loading={true} />
            ) : reviews.length === 0 ? (
              <Card>
                <Empty
                  description="Chưa có đánh giá nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            ) : (
              <>
                <List dataSource={reviews} renderItem={renderReviewCard} />

                {/* Pagination */}
                {totalReviews > pageSize && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      current={currentPage}
                      total={totalReviews}
                      pageSize={pageSize}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showTotal={(total) => `Tổng ${total} đánh giá`}
                    />
                  </div>
                )}
              </>
            )}
          </Col>

          {/* Right Column - Statistics */}
          <Col xs={24} lg={8}>
            {statistics && totalCount > 0 && (
              <Card
                title="Thống kê đánh giá"
                className="sticky top-4"
              >
                {/* Average Rating */}
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="text-5xl font-bold text-yellow-600 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <Rate
                    disabled
                    value={averageRating}
                    allowHalf
                    className="text-2xl mb-2"
                  />
                  <Text className="block text-gray-600">
                    {totalCount} đánh giá
                  </Text>
                </div>

                {/* Rating Distribution */}
                <div className="mb-6">
                  <Text strong className="block mb-3">
                    Phân bổ đánh giá
                  </Text>
                  {renderRatingDistribution()}
                </div>

                {/* Average Detailed Ratings */}
                {statistics.averageDetailedRatings && (
                  <div>
                    <Text strong className="block mb-3">
                      Đánh giá chi tiết trung bình
                    </Text>
                    <div className="space-y-2">
                      {renderDetailedRating(
                        'Xe',
                        statistics.averageDetailedRatings.vehicle,
                        <FaBus />,
                        'blue'
                      )}
                      {renderDetailedRating(
                        'Tài xế',
                        statistics.averageDetailedRatings.driver,
                        <FaUserTie />,
                        'green'
                      )}
                      {renderDetailedRating(
                        'Đúng giờ',
                        statistics.averageDetailedRatings.punctuality,
                        <FaClock />,
                        'orange'
                      )}
                      {renderDetailedRating(
                        'Phục vụ',
                        statistics.averageDetailedRatings.service,
                        <FaSmile />,
                        'purple'
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </Col>
        </Row>
      </div>

      {/* Response Modal */}
      <Modal
        title={
          selectedReview?.operatorResponse
            ? 'Chỉnh sửa phản hồi'
            : 'Phản hồi đánh giá'
        }
        open={responseModalOpen}
        onCancel={() => {
          setResponseModalOpen(false);
          responseForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedReview && (
          <>
            {/* Review Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-start mb-2">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong>
                      {selectedReview.user?.fullName || 'Khách hàng'}
                    </Text>
                    <div className="text-sm text-gray-500">
                      {dayjs(selectedReview.createdAt).format('DD/MM/YYYY')}
                    </div>
                  </div>
                </Space>
                <Rate disabled value={selectedReview.overallRating} allowHalf />
              </div>
              {selectedReview.comment && (
                <Paragraph className="mb-0 text-sm text-gray-700">
                  "{selectedReview.comment}"
                </Paragraph>
              )}
            </div>

            {/* Response Form */}
            <Form
              form={responseForm}
              onFinish={handleSubmitResponse}
              layout="vertical"
            >
              <Form.Item
                name="operatorResponse"
                label="Phản hồi của bạn"
                rules={[
                  { required: true, message: 'Vui lòng nhập phản hồi' },
                  { max: 1000, message: 'Phản hồi không quá 1000 ký tự' },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Nhập phản hồi của bạn cho đánh giá này..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Space className="w-full justify-end">
                  <Button
                    onClick={() => {
                      setResponseModalOpen(false);
                      responseForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Gửi phản hồi
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default OperatorReviewsPage;
