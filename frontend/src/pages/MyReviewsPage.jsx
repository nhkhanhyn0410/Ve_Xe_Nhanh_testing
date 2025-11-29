import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Rate,
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
  Descriptions,
} from 'antd';
import {
  StarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ShopOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { FaBus, FaUserTie, FaClock, FaSmile } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getMyReviews } from '../services/reviewApi';
import CustomerLayout from '../components/layouts/CustomerLayout';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title, Paragraph } = Typography;

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchMyReviews();
  }, [currentPage]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      const response = await getMyReviews(params);

      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setTotalReviews(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      message.error('Không thể tải đánh giá của bạn');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDetailedRating = (label, value, icon, color) => {
    if (!value) return null;

    return (
      <div className="flex items-center gap-2">
        {icon && <span className={`text-${color}-500`}>{icon}</span>}
        <Text className="text-sm">{label}:</Text>
        <Rate disabled value={value} allowHalf className="text-xs" />
        <Text className="text-xs text-gray-500">({value.toFixed(1)})</Text>
      </div>
    );
  };

  const renderReviewCard = (review) => {
    const trip = review.trip;
    const booking = review.booking;

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        {/* Trip Info Header */}
        <div className="bg-gray-50 -mt-4 -mx-4 px-4 py-3 mb-4 rounded-t-lg">
          <Descriptions size="small" column={1}>
            <Descriptions.Item
              label={<Text strong>Tuyến đường</Text>}
            >
              <Space>
                <EnvironmentOutlined className="text-blue-500" />
                <Text>
                  {trip?.route?.origin?.city} → {trip?.route?.destination?.city}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item
              label={<Text strong>Nhà xe</Text>}
            >
              <Space>
                <ShopOutlined className="text-green-500" />
                <Text>{trip?.operator?.companyName}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item
              label={<Text strong>Thời gian</Text>}
            >
              <Space>
                <CalendarOutlined className="text-orange-500" />
                <Text>
                  {dayjs(trip?.departureTime).format('DD/MM/YYYY HH:mm')}
                </Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Review Content */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-3">
            <Space>
              <Avatar size={40} icon={<UserOutlined />} />
              <div>
                <Text strong>Bạn</Text>
                <div className="text-sm text-gray-500">
                  Đánh giá {dayjs(review.createdAt).fromNow()}
                </div>
              </div>
            </Space>
            <div className="text-right">
              <Rate disabled value={review.overallRating} allowHalf className="text-lg" />
              <div className="text-sm text-gray-500 mt-1">
                {review.overallRating.toFixed(1)}/5
              </div>
            </div>
          </div>

          {/* Detailed ratings */}
          {(review.vehicleRating || review.driverRating || review.punctualityRating || review.serviceRating) && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <Text strong className="text-sm text-gray-700 block mb-2">
                Đánh giá chi tiết
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {renderDetailedRating('Xe', review.vehicleRating, <FaBus />, 'blue')}
                {renderDetailedRating('Tài xế', review.driverRating, <FaUserTie />, 'green')}
                {renderDetailedRating('Đúng giờ', review.punctualityRating, <FaClock />, 'orange')}
                {renderDetailedRating('Phục vụ', review.serviceRating, <FaSmile />, 'purple')}
              </div>
            </div>
          )}

          {/* Comment */}
          {review.comment && (
            <Paragraph className="mb-3 text-gray-700">
              {review.comment}
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

          {/* Status Tags */}
          <Space wrap className="mb-3">
            {review.isPublished ? (
              <Tag color="green">Đã đăng</Tag>
            ) : (
              <Tag color="orange">Chờ duyệt</Tag>
            )}
            {review.isReported && <Tag color="red">Bị báo cáo</Tag>}
          </Space>

          {/* Operator Response */}
          {review.operatorResponse && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded p-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <ShopOutlined className="text-green-600" />
                <Text strong className="text-green-700">
                  Phản hồi từ nhà xe
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
        </div>
      </Card>
    );
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm mb-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              className="mb-4"
            >
              Quay lại
            </Button>
            <Title level={2} className="mb-0">
              <StarOutlined className="text-yellow-500 mr-2" />
              Đánh giá của tôi
            </Title>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <Card loading={true} />
        ) : reviews.length === 0 ? (
          <Card>
            <Empty
              description="Bạn chưa có đánh giá nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <>
            <List
              dataSource={reviews}
              renderItem={renderReviewCard}
            />

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
      </div>
      </div>
    </CustomerLayout>
  );
};

export default MyReviewsPage;
