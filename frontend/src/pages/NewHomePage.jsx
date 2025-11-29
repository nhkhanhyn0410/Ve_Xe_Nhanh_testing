import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Statistic,
  AutoComplete,
} from 'antd';
import {
  SearchOutlined,
  SwapOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  StarOutlined,
  TrophyOutlined,
  GiftOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import useBookingStore from '../store/bookingStore';
import CustomerLayout from '../components/customer/CustomerLayout';
import PopularRoutes from '../components/ui/PopularRoutes';

const { Title, Text, Paragraph } = Typography;

const NewHomePage = () => {
  const navigate = useNavigate();
  const { setSearchCriteria } = useBookingStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // City suggestions (same as TripsPage for consistency)
  const cityOptions = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Nha Trang', 'Huế', 'Vũng Tàu', 'Đà Lạt', 'Quy Nhơn',
    'Phan Thiết', 'Hạ Long', 'Sapa', 'Phú Quốc', 'Buôn Ma Thuột'
  ];

  const handleSearch = async (values) => {
    try {
      setLoading(true);

      const searchData = {
        fromCity: values.fromCity,
        toCity: values.toCity,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
        passengers: 1,
      };

      console.log('NewHomePage - Search submitted:', { values, searchData });

      if (!searchData.fromCity || !searchData.toCity) {
        toast.error('Vui lòng nhập điểm đi và điểm đến');
        return;
      }

      if (!searchData.date) {
        toast.error('Vui lòng chọn ngày đi');
        return;
      }

      console.log('NewHomePage - Setting search criteria and navigating:', searchData);
      setSearchCriteria(searchData);
      console.log('NewHomePage - Navigating to search-results');
      navigate('/search-results');
    } catch (error) {
      console.error('NewHomePage - Search error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCities = () => {
    const fromCity = form.getFieldValue('fromCity');
    const toCity = form.getFieldValue('toCity');
    form.setFieldsValue({
      fromCity: toCity,
      toCity: fromCity,
    });
  };

  const features = [
    {
      icon: <ThunderboltOutlined className="text-4xl text-blue-500" />,
      title: 'Đặt vé nhanh chóng',
      description: 'Chỉ vài bước đơn giản để hoàn tất đặt vé',
    },
    {
      icon: <SafetyOutlined className="text-4xl text-green-500" />,
      title: 'An toàn & tin cậy',
      description: 'Đối tác với các nhà xe uy tín',
    },
    {
      icon: <DollarOutlined className="text-4xl text-orange-500" />,
      title: 'Giá tốt nhất',
      description: 'So sánh giá từ nhiều nhà xe',
    },
    {
      icon: <GiftOutlined className="text-4xl text-purple-500" />,
      title: 'Ưu đãi hấp dẫn',
      description: 'Voucher và khuyến mãi liên tục',
    },
  ];

  const loyaltyFeatures = [
    {
      icon: <TrophyOutlined className="text-3xl text-yellow-500" />,
      title: 'Tích điểm Loyalty',
      description: '1 điểm mỗi 10,000 VND chi tiêu',
      link: '/loyalty',
    },
    {
      icon: <StarOutlined className="text-3xl text-blue-500" />,
      title: 'Đánh giá & Review',
      description: 'Chia sẻ trải nghiệm của bạn',
      link: '/my-reviews',
    },
    {
      icon: <ExclamationCircleOutlined className="text-3xl text-orange-500" />,
      title: 'Hỗ trợ 24/7',
      description: 'Gửi khiếu nại mọi lúc',
      link: '/complaints',
    },
  ];

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-orange-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-red-600/80 to-orange-600/90"></div>

          {/* Animated Geometric Shapes */}
          <div className="absolute inset-0">
            {/* Large floating circles */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-red-400/20 to-orange-500/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

            {/* Geometric patterns */}
            <div className="absolute top-32 right-20 w-32 h-32 border border-white/10 rounded-lg rotate-45 animate-pulse"></div>
            <div className="absolute bottom-32 left-20 w-24 h-24 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-white/5 rounded-lg rotate-12 animate-pulse" style={{ animationDelay: '3s' }}></div>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}></div>
            </div>
          </div>
        </div>

        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 pt-6 pb-12 sm:pt-10 sm:pb-20">
          <div className="text-center mb-12">
            {/* Main Heading */}
            <div className="relative">
              <Title level={1} className="text-white text-5xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight">
                <span className="block">Đặt vé xe khách siêu nhanh</span>
              </Title>
            </div>

            {/* Subtitle */}
            <div className="relative mb-8">
              <Paragraph className="text-xl sm:text-3xl text-white/95 max-w-4xl mx-auto leading-relaxed font-light">
                Trải nghiệm đặt vé hiện đại, nhanh chóng và an toàn với hàng nghìn chuyến xe mỗi ngày
              </Paragraph>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { icon: <ThunderboltOutlined />, text: 'Đặt vé 30 giây' },
                { icon: <SafetyOutlined />, text: 'Thanh toán an toàn' },
                { icon: <FileTextOutlined />, text: 'Vé điện tử QR' },
                { icon: <GiftOutlined />, text: 'Ưu đãi hấp dẫn' }
              ].map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
                >
                  <span className="text-white text-xl">{badge.icon}</span>
                  <span className="text-sm font-semibold tracking-wide text-white">{badge.text}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Enhanced Search Form */}
          <div className="max-w-7xl mx-auto animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
            <Card className="relative backdrop-blur-xl bg-white/95 shadow-2xl border-0 rounded-3xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
              {/* Card Header with Gradient */}


              <div className="p-6 lg:p-8">
                <div className="text-center mb-6">
                  <Title level={2} className="text-neutral-800 mb-2 font-bold">
                    Tìm chuyến xe hoàn hảo
                  </Title>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSearch}
                  initialValues={{
                    date: dayjs(),
                  }}
                  className="relative"
                >
                  {/* Form Background Decoration */}
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-50 blur-xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-50 blur-xl"></div>

                  <div className="relative">
                    <Row gutter={[12, 12]} align="bottom">
                      <Col xs={24} lg={11}>
                        <Form.Item
                          label={
                            <span className="font-semibold text-neutral-700 mb-1">
                              Điểm đi
                            </span>
                          }
                          name="fromCity"
                          rules={[{ required: true, message: 'Vui lòng nhập điểm đi!' }]}
                        >
                          <AutoComplete
                            size="large"
                            placeholder="Chọn hoặc nhập thành phố đi (VD: Hà Nội)"
                            options={cityOptions.map(city => ({ value: city }))}
                            filterOption={(inputValue, option) =>
                              option.value.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            className="h-14 rounded-lg border-2 border-neutral-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={2} className="flex justify-center">
                        <Form.Item label={<span className="opacity-0">Swap</span>} className="w-min">
                          <Button
                            type="text"
                            icon={<SwapOutlined className="text-lg" />}
                            onClick={handleSwapCities}
                            size="large"
                            className="h-14 w-full rounded-lg bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-400 transition-all duration-300 shadow-sm"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={11}>
                        <Form.Item
                          label={
                            <span className="font-semibold text-neutral-700">
                              Điểm đến
                            </span>
                          }
                          name="toCity"
                          rules={[{ required: true, message: 'Vui lòng nhập điểm đến!' }]}
                        >
                          <AutoComplete
                            size="large"
                            placeholder="Chọn hoặc nhập thành phố đến (VD: TP. HCM)"
                            options={cityOptions.map(city => ({ value: city }))}
                            filterOption={(inputValue, option) =>
                              option.value.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            className="h-14 rounded-lg border-2 border-neutral-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={12}>
                        <Form.Item
                          label={
                            <span className="font-semibold text-neutral-700">
                              Ngày khởi hành
                            </span>
                          }
                          name="date"
                          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                        >
                          <DatePicker
                            size="large"
                            placeholder="Chọn ngày khởi hành"
                            format="DD/MM/YYYY"
                            disabledDate={(current) =>
                              current && current < dayjs().startOf('day')
                            }
                            className="w-full h-14 rounded-lg border-2 border-neutral-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                            suffixIcon={<CalendarOutlined className="text-red-500" />}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} lg={12}>
                        <Form.Item label={<span className="opacity-0">Search</span>}>
                          <Button
                            type="primary"
                            size="large"
                            block
                            htmlType="submit"
                            loading={loading}
                            icon={<SearchOutlined className="text-lg" />}
                            className="h-14 rounded-lg bg-red-600 hover:bg-red-700 border-0 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Tìm chuyến xe ngay
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </Form>

                {/* Popular searches */}
                <div className="pt-4 border-t border-neutral-200">
                  <div className="text-center">
                    <Text className="text-sm text-neutral-500 mb-3 block">
                      Tìm kiếm phổ biến:
                    </Text>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      {[
                        'Hà Nội - TP.HCM',
                        'Hà Nội - Đà Nẵng',
                        'TP.HCM - Đà Lạt',
                        'Hà Nội - Hải Phòng'
                      ].map((route, index) => (
                        <Button
                          key={index}
                          type="text"
                          className="h-10 px-4 rounded-lg bg-neutral-50 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200 hover:border-red-300 text-sm transition-all duration-200"
                          onClick={() => {
                            const [from, to] = route.split(' - ');
                            form.setFieldsValue({ fromCity: from, toCity: to });
                          }}
                        >
                          {route}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Simplified Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">

          <div className="text-center mb-12">
            <Title level={2} className="text-neutral-800 mb-4">
              Tại sao chọn Vé xe nhanh?
            </Title>
            <Text className="text-lg text-neutral-600 mb-8">
              Nền tảng đặt vé xe khách hàng đầu với 150+ nhà xe uy tín, 500+ tuyến đường và 98% đánh giá tích cực
            </Text>
          </div>

          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12} lg={6}>
              <div className="text-center p-6 bg-neutral-50 rounded-xl hover:bg-red-50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-xl flex items-center justify-center">
                  <ThunderboltOutlined className="text-2xl text-red-600" />
                </div>
                <Title level={4} className="text-neutral-800 mb-2">
                  Đặt vé nhanh chóng
                </Title>
                <Text className="text-neutral-600 text-sm">
                  Chỉ 30 giây để hoàn tất đặt vé
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="text-center p-6 bg-neutral-50 rounded-xl hover:bg-red-50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-xl flex items-center justify-center">
                  <SafetyOutlined className="text-2xl text-red-600" />
                </div>
                <Title level={4} className="text-neutral-800 mb-2">
                  An toàn & tin cậy
                </Title>
                <Text className="text-neutral-600 text-sm">
                  Thanh toán bảo mật 100%
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="text-center p-6 bg-neutral-50 rounded-xl hover:bg-red-50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-xl flex items-center justify-center">
                  <DollarOutlined className="text-2xl text-red-600" />
                </div>
                <Title level={4} className="text-neutral-800 mb-2">
                  Giá tốt nhất
                </Title>
                <Text className="text-neutral-600 text-sm">
                  So sánh giá từ nhiều nhà xe
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="text-center p-6 bg-neutral-50 rounded-xl hover:bg-red-50 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-xl flex items-center justify-center">
                  <GiftOutlined className="text-2xl text-red-600" />
                </div>
                <Title level={4} className="text-neutral-800 mb-2">
                  Ưu đãi hấp dẫn
                </Title>
                <Text className="text-neutral-600 text-sm">
                  Voucher và khuyến mãi liên tục
                </Text>
              </div>
            </Col>
          </Row>

        </div>
      </div>


      {/* Popular Routes */}
      <PopularRoutes />
    </CustomerLayout>
  );
};

export default NewHomePage;
