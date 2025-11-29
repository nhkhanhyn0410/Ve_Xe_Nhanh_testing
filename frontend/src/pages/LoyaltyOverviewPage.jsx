import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Typography,
  message,
  Spin,
  Tag,
  Divider,
  Space,
} from 'antd';
import {
  TrophyOutlined,
  GiftOutlined,
  HistoryOutlined,
  RiseOutlined,
  StarFilled,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  getLoyaltyOverview,
  getTierLabel,
  getTierColor,
  getTierGradient,
  formatCurrency,
  calculateDiscount,
  getTierBenefits,
  getTierRequirements,
} from '../services/loyaltyApi';
import RedeemPointsModal from '../components/RedeemPointsModal';
import CustomerLayout from '../components/layouts/CustomerLayout';

const { Title, Text, Paragraph } = Typography;

const LoyaltyOverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await getLoyaltyOverview();

      if (response.success) {
        setOverview(response.data);
      }
    } catch (error) {
      console.error('Error fetching loyalty overview:', error);
      message.error('Không thể tải thông tin loyalty');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemSuccess = () => {
    setRedeemModalOpen(false);
    fetchOverview();
  };

  const currentTier = overview?.currentTier;
  const nextTier = overview?.nextTier;
  const points = overview?.points;
  const tierColor = currentTier ? getTierColor(currentTier.name) : '#1890ff';
  const tierGradient = currentTier ? getTierGradient(currentTier.name) : { from: '#1890ff', to: '#096dd9' };

  return (
    <CustomerLayout>
      {loading || !overview ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Đang tải thông tin loyalty..." />
        </div>
      ) : (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div
          className="shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${tierGradient.from} 0%, ${tierGradient.to} 100%)`,
          }}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrophyOutlined className="text-4xl text-white" />
                <Title level={2} className="mb-0 text-white">
                  Chương trình Loyalty
                </Title>
              </div>
              <Text className="text-white text-lg opacity-90">
                Tích điểm - Nhận ưu đãi - Nâng hạng
              </Text>
            </div>
            <div className="text-right">
              <Tag
                color={tierColor}
                className="text-2xl px-6 py-2"
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                }}
              >
                <StarFilled className="mr-2" />
                {getTierLabel(currentTier.name).toUpperCase()}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Points Summary */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng điểm hiện tại"
                value={points.total}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: tierColor, fontWeight: 'bold' }}
                suffix="điểm"
              />
              <Text className="text-sm text-gray-500">
                Giá trị: {formatCurrency(overview.redemptionValue)}
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã tích lũy"
                value={points.totalEarned}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix="điểm"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đã đổi"
                value={points.totalRedeemed}
                prefix={<GiftOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix="điểm"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Sắp hết hạn"
                value={points.expiringSoon}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: points.expiringSoon > 0 ? '#fa8c16' : '#52c41a' }}
                suffix="điểm"
              />
              {points.expiringSoon > 0 && (
                <Text className="text-sm text-orange-500">
                  Trong 30 ngày tới
                </Text>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Tier Progress */}
            {!nextTier.isMaxTier && (
              <Card
                title={
                  <Space>
                    <RiseOutlined />
                    <span>Tiến độ lên hạng</span>
                  </Space>
                }
                className="mb-4"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong style={{ color: tierColor }}>
                      {getTierLabel(currentTier.name)}
                    </Text>
                    <Text strong style={{ color: getTierColor(nextTier.name) }}>
                      {getTierLabel(nextTier.name)}
                    </Text>
                  </div>
                  <Progress
                    percent={nextTier.progress}
                    strokeColor={{
                      from: tierGradient.from,
                      to: getTierGradient(nextTier.name).from,
                    }}
                    status="active"
                  />
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Text className="text-lg">
                    {nextTier.message}
                  </Text>
                  <div className="mt-2">
                    <Text className="text-2xl font-bold text-blue-600">
                      {nextTier.pointsNeeded}
                    </Text>
                    <Text className="text-gray-600"> điểm nữa</Text>
                  </div>
                </div>
              </Card>
            )}

            {nextTier.isMaxTier && (
              <Card className="mb-4">
                <div className="text-center p-6">
                  <TrophyOutlined className="text-6xl mb-4" style={{ color: tierColor }} />
                  <Title level={3}>🎉 Chúc mừng!</Title>
                  <Text className="text-lg">{nextTier.message}</Text>
                </div>
              </Card>
            )}

            {/* Tier Benefits */}
            <Card
              title={
                <Space>
                  <GiftOutlined />
                  <span>Quyền lợi hạng {getTierLabel(currentTier.name)}</span>
                </Space>
              }
              className="mb-4"
            >
              <div className="space-y-2">
                {getTierBenefits(currentTier.name).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {currentTier.benefits && (
                <>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="text-center">
                        <Text className="text-gray-500 block">Hệ số tích điểm</Text>
                        <Text className="text-2xl font-bold" style={{ color: tierColor }}>
                          x{currentTier.benefits.pointsMultiplier || 1}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center">
                        <Text className="text-gray-500 block">Ưu đãi thêm</Text>
                        <Text className="text-2xl font-bold" style={{ color: tierColor }}>
                          {currentTier.benefits.extraDiscount || 0}%
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </>
              )}
            </Card>

            {/* Quick Actions */}
            <Card
              title="Hành động nhanh"
              className="mb-4"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<GiftOutlined />}
                    onClick={() => setRedeemModalOpen(true)}
                    block
                    disabled={points.total < 100}
                  >
                    Đổi điểm
                  </Button>
                  {points.total < 100 && (
                    <Text className="text-sm text-gray-500 mt-1 block text-center">
                      Tối thiểu 100 điểm
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    size="large"
                    icon={<HistoryOutlined />}
                    onClick={() => navigate('/loyalty/history')}
                    block
                  >
                    Xem lịch sử
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right Column - Tier Roadmap */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <StarFilled />
                  <span>Lộ trình thăng hạng</span>
                </Space>
              }
            >
              <div className="space-y-4">
                {getTierRequirements().map((tier, index) => {
                  const isCurrentTier = tier.tier === currentTier.name;
                  const isCompleted = points.total >= tier.minPoints;

                  return (
                    <div
                      key={tier.tier}
                      className={`p-4 rounded-lg border-2 ${
                        isCurrentTier ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StarFilled
                            style={{
                              color: isCompleted ? tier.color : '#d9d9d9',
                              fontSize: '20px',
                            }}
                          />
                          <Text strong className="text-lg">
                            {tier.label}
                          </Text>
                        </div>
                        {isCurrentTier && (
                          <Tag color="blue">Hiện tại</Tag>
                        )}
                      </div>
                      <Text className="text-sm text-gray-600">
                        {tier.minPoints === 0
                          ? 'Hạng khởi điểm'
                          : `${tier.minPoints.toLocaleString()} điểm trở lên`}
                      </Text>
                    </div>
                  );
                })}
              </div>

              <Divider />

              <div className="text-center text-sm text-gray-500">
                <Paragraph>
                  💡 <strong>Mẹo:</strong> Tích điểm khi hoàn thành chuyến đi.
                  1 điểm = 10,000 VND chi tiêu.
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Redeem Modal */}
      <RedeemPointsModal
        open={redeemModalOpen}
        onCancel={() => setRedeemModalOpen(false)}
        onSuccess={handleRedeemSuccess}
        currentPoints={points?.total}
      />
      </div>
      )}
    </CustomerLayout>
  );
};

export default LoyaltyOverviewPage;
