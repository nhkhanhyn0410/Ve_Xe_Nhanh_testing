import { Card, Row, Col, Typography, Button, Space } from 'antd';
import {
  SearchOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  GiftOutlined,
  StarOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const FeatureShowcase = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: <SearchOutlined className="text-4xl text-primary-500" />,
      title: 'Tìm kiếm thông minh',
      description: 'Tìm chuyến xe phù hợp với bộ lọc thông minh và gợi ý tự động',
      gradient: 'from-primary-500 to-red-600',
      action: () => navigate('/trips'),
      actionText: 'Tìm chuyến ngay'
    },
    {
      icon: <ThunderboltOutlined className="text-4xl text-yellow-500" />,
      title: 'Đặt vé siêu tốc',
      description: 'Hoàn tất đặt vé chỉ trong 30 giây với quy trình tối ưu',
      gradient: 'from-yellow-500 to-orange-600',
      action: () => navigate('/'),
      actionText: 'Trải nghiệm ngay'
    },
    {
      icon: <SafetyOutlined className="text-4xl text-green-500" />,
      title: 'An toàn tuyệt đối',
      description: 'Thanh toán bảo mật SSL, vé điện tử chống giả mạo',
      gradient: 'from-green-500 to-emerald-600',
      action: () => navigate('/login'),
      actionText: 'Đăng ký ngay'
    },
    {
      icon: <GiftOutlined className="text-4xl text-orange-500" />,
      title: 'Ưu đãi hấp dẫn',
      description: 'Voucher, cashback, loyalty points và nhiều ưu đãi khác',
      gradient: 'from-orange-500 to-red-600',
      action: () => navigate('/loyalty'),
      actionText: 'Xem ưu đãi'
    }
  ];

  const serviceFeatures = [
    {
      icon: <FileTextOutlined />,
      title: 'Vé điện tử QR',
      description: 'Vé điện tử với mã QR, không lo mất vé',
      stats: '100% Digital'
    },
    {
      icon: <ClockCircleOutlined />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ hỗ trợ luôn sẵn sàng phục vụ',
      stats: '24/7 Support'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Hoàn tiền nhanh',
      description: 'Chính sách hoàn tiền linh hoạt và nhanh chóng',
      stats: '5-7 ngày'
    },
    {
      icon: <StarOutlined />,
      title: 'Đánh giá minh bạch',
      description: 'Hệ thống đánh giá và review từ khách hàng thực',
      stats: '4.8/5 ⭐'
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-neutral-50 to-red-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Main Features */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-red-100 text-primary-700 rounded-full font-medium text-sm mb-6">
            ⚡ Tính năng vượt trội
          </div>
          <Title level={2} className="text-neutral-800 mb-4">
            Trải nghiệm đặt vé hoàn toàn mới
          </Title>
          <Paragraph className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Khám phá những tính năng hiện đại giúp việc đặt vé xe khách trở nên dễ dàng hơn bao giờ hết
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} className="mb-20">
          {mainFeatures.map((feature, index) => (
            <Col key={index} xs={24} md={12} lg={6}>
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white rounded-2xl overflow-hidden group">
                <div className="text-center p-6">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white text-3xl">
                      {feature.icon}
                    </div>
                  </div>
                  <Title level={4} className="text-neutral-800 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-neutral-600 mb-6 leading-relaxed">
                    {feature.description}
                  </Paragraph>
                  <Button
                    type="primary"
                    onClick={feature.action}
                    className={`bg-gradient-to-r ${feature.gradient} border-0 rounded-lg hover:shadow-lg transition-all duration-300`}
                  >
                    {feature.actionText}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Service Features */}
        <div className="text-center mb-12">
          <Title level={3} className="text-neutral-800 mb-4">
            Dịch vụ chất lượng cao
          </Title>
          <Text className="text-lg text-neutral-600">
            Cam kết mang đến trải nghiệm tốt nhất cho khách hàng
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {serviceFeatures.map((feature, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card className="text-center border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm">
                <div className="p-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-100 flex items-center justify-center">
                    <div className="text-primary-600 text-xl">
                      {feature.icon}
                    </div>
                  </div>
                  <Title level={5} className="text-neutral-800 mb-2">
                    {feature.title}
                  </Title>
                  <Text className="text-neutral-600 text-sm mb-3 block">
                    {feature.description}
                  </Text>
                  <div className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                    {feature.stats}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary-600 to-red-600 border-0 rounded-2xl overflow-hidden">
            <div className="p-12 text-white">
              <Title level={3} className="text-white mb-4">
                Sẵn sàng trải nghiệm?
              </Title>
              <Paragraph className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Tham gia cùng hàng nghìn khách hàng đã tin tưởng và sử dụng dịch vụ của chúng tôi
              </Paragraph>
              <Space size="large">
                <Button
                  size="large"
                  onClick={() => navigate('/register')}
                  className="bg-white text-primary-600 hover:bg-neutral-100 border-0 rounded-lg px-8 py-2 h-auto font-semibold"
                >
                  Đăng ký miễn phí
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate('/trips')}
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary-600 rounded-lg px-8 py-2 h-auto font-semibold"
                >
                  Tìm chuyến xe
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;