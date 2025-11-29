import { Card, Row, Col, Typography, Button, Tag } from 'antd';
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    CarOutlined,
    StarOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PopularRoutes = () => {
    const navigate = useNavigate();

    const routes = [
        {
            id: 1,
            from: 'Hà Nội',
            to: 'TP. Hồ Chí Minh',
            duration: '24h',
            price: '450,000',
            operators: 15,
            rating: 4.8,
            trips: 12,
            image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
            popular: true,
            discount: '10%'
        },
        {
            id: 2,
            from: 'Hà Nội',
            to: 'Đà Nẵng',
            duration: '14h',
            price: '320,000',
            operators: 12,
            rating: 4.7,
            trips: 8,
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
            popular: false,
            discount: null
        },
        {
            id: 3,
            from: 'TP. Hồ Chí Minh',
            to: 'Đà Lạt',
            duration: '6h',
            price: '180,000',
            operators: 8,
            rating: 4.9,
            trips: 15,
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
            popular: true,
            discount: '15%'
        },
        {
            id: 4,
            from: 'Hà Nội',
            to: 'Hải Phòng',
            duration: '2h',
            price: '120,000',
            operators: 6,
            rating: 4.6,
            trips: 20,
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
            popular: false,
            discount: null
        },
        {
            id: 5,
            from: 'TP. Hồ Chí Minh',
            to: 'Nha Trang',
            duration: '8h',
            price: '250,000',
            operators: 10,
            rating: 4.8,
            trips: 10,
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
            popular: true,
            discount: '20%'
        },
        {
            id: 6,
            from: 'Đà Nẵng',
            to: 'Hội An',
            duration: '1h',
            price: '80,000',
            operators: 5,
            rating: 4.7,
            trips: 25,
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
            popular: false,
            discount: null
        }
    ];

    const handleRouteClick = (route) => {
        // Set search criteria and navigate to trips page
        navigate('/trips', {
            state: {
                fromCity: route.from,
                toCity: route.to
            }
        });
    };

    return (
        <div className="py-20 bg-white">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                {/* Header */}
                <div className="text-center mb-16">         
                    <Title level={2} className="text-neutral-800 mb-4">
                        Tuyến đường phổ biến
                    </Title>
                    <Text className="text-xl text-neutral-600 max-w-3xl mx-auto block">
                        Khám phá những tuyến đường được yêu thích nhất với giá vé hấp dẫn
                    </Text>
                </div>

                {/* Routes Grid */}
                <Row gutter={[24, 24]}>
                    {routes.map((route) => (
                        <Col key={route.id} xs={24} sm={12} lg={8}>
                            <Card
                                className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer rounded-2xl overflow-hidden group"
                                onClick={() => handleRouteClick(route)}
                                cover={
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={route.image}
                                            alt={`${route.from} - ${route.to}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                        {/* Tags */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {route.popular && (
                                                <Tag color="red" className="border-0 rounded-full px-3 py-1 text-xs font-medium">
                                                    🔥 Hot
                                                </Tag>
                                            )}
                                            {route.discount && (
                                                <Tag color="green" className="border-0 rounded-full px-3 py-1 text-xs font-medium">
                                                    -{route.discount}
                                                </Tag>
                                            )}
                                        </div>

                                        {/* Route Info Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex items-center justify-between text-white">
                                                <div className="flex items-center gap-2">
                                                    <EnvironmentOutlined />
                                                    <Text className="text-white font-medium">
                                                        {route.from}
                                                    </Text>
                                                    <ArrowRightOutlined className="text-xs" />
                                                    <Text className="text-white font-medium">
                                                        {route.to}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                <div className="p-6">
                                    {/* Price */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <Text className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-red-600 bg-clip-text text-transparent">
                                                {route.price}đ
                                            </Text>
                                            <Text className="text-neutral-500 text-sm block">
                                                /người
                                            </Text>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 mb-1">
                                                <StarOutlined className="text-yellow-500 text-sm" />
                                                <Text className="text-neutral-700 font-medium text-sm">
                                                    {route.rating}
                                                </Text>
                                            </div>
                                            <Text className="text-neutral-500 text-xs">
                                                {route.operators} nhà xe
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Route Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ClockCircleOutlined className="text-neutral-500" />
                                                <Text className="text-neutral-600 text-sm">
                                                    Thời gian: {route.duration}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CarOutlined className="text-neutral-500" />
                                                <Text className="text-neutral-600 text-sm">
                                                    {route.trips} chuyến/ngày
                                                </Text>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        className="bg-gradient-to-r from-primary-500 to-red-500 border-0 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                                    >
                                        Xem chuyến xe
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Button
                        size="large"
                        onClick={() => navigate('/trips')}
                        className="px-8 py-2 h-auto text-lg font-medium border-2 border-primary-500 text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300"
                    >
                        Xem tất cả tuyến đường
                        <ArrowRightOutlined className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PopularRoutes;