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
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  UserOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { FaBus, FaUserTie, FaClock, FaSmile } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getTripReviews } from '../services/reviewApi';
import CreateReviewModal from './CreateReviewModal';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title, Paragraph } = Typography;

const ReviewsSection = ({ tripId, booking = null }) => {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  useEffect(() => {
    if (tripId) {
      fetchReviews();
    }
  }, [tripId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      const response = await getTripReviews(tripId, params);

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

  const handleReviewCreated = () => {
    setIsModalOpen(false);
    setCurrentPage(1);
    fetchReviews();
    message.success('Cảm ơn bạn đã đánh giá!');
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
              <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailedRating = (label, value, icon, color) => {
    if (!value) return null;

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-2">
          {icon && <span className={`text-${color}-500`}>{icon}</span>}
          <Text className="text-sm">{label}</Text>
        </div>
        <Rate disabled value={value} allowHalf className="text-sm" />
      </div>
    );
  };

  const renderReviewCard = (review) => {
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        {/* User info and overall rating */}
        <div className="flex items-start justify-between mb-3">
          <Space>
            <Avatar
              size={48}
              icon={<UserOutlined />}
              src={review.user?.profilePicture}
            />
            <div>
              <Text strong className="block">
                {review.user?.fullName || 'Khách hàng'}
              </Text>
              <Text className="text-sm text-gray-500">
                {dayjs(review.createdAt).fromNow()}
              </Text>
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
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <Text strong className="text-sm text-gray-700 block mb-2">
              Đánh giá chi tiết
            </Text>
            <div className="grid grid-cols-2 gap-2">
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

        {/* Operator Response */}
        {review.operatorResponse && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <ShopOutlined className="text-blue-600" />
              <Text strong className="text-blue-700">
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
      </Card>
    );
  };

  const averageRating = statistics?.averageRating || 0;
  const totalCount = statistics?.totalReviews || 0;

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <StarOutlined className="text-yellow-500" />
          <span>Đánh giá từ hành khách</span>
        </div>
      }
      className="mb-6"
    >
      {/* Overall Statistics */}
      {statistics && totalCount > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Average Rating */}
            <div className="flex-shrink-0 text-center">
              <div className="text-5xl font-bold text-yellow-600 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <Rate disabled value={averageRating} allowHalf className="text-2xl mb-2" />
              <Text className="text-gray-600">
                {totalCount} đánh giá
              </Text>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              <Text strong className="block mb-3">
                Phân bổ đánh giá
              </Text>
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {booking && (
        <div className="mb-4">
          <Button
            type="primary"
            icon={<StarOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="large"
          >
            Viết đánh giá
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <Text>Đang tải đánh giá...</Text>
        </div>
      ) : reviews.length === 0 ? (
        <Empty
          description="Chưa có đánh giá nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <List
            dataSource={reviews}
            renderItem={renderReviewCard}
            className="mt-4"
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

      {/* Create Review Modal */}
      {booking && (
        <CreateReviewModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={handleReviewCreated}
          booking={booking}
        />
      )}
    </Card>
  );
};

export default ReviewsSection;
