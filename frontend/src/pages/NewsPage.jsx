import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Button } from 'antd';
import {
    ArrowRightOutlined,
    FireOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/layouts/CustomerLayout';
import NewsCard from '../components/ui/NewsCard';

const { Title, Text, Paragraph } = Typography;

const NewsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const featuredNews = {
        id: 1,
        title: 'Vé xe nhanh ra mắt tính năng đặt vé thông minh với AI',
        excerpt: 'Hệ thống AI mới giúp gợi ý tuyến đường tối ưu và thời gian đi lại phù hợp nhất cho khách hàng...',
        content: 'Với công nghệ trí tuệ nhân tạo tiên tiến, Vé xe nhanh giờ đây có thể phân tích thói quen di chuyển của khách hàng và đưa ra những gợi ý tuyến đường tối ưu nhất.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
        category: 'Công nghệ',
        publishDate: '2024-11-27',
        author: 'Đội ngũ Vé xe nhanh',
        views: 1250,
        featured: true
    };

    const newsArticles = [
        {
            id: 2,
            title: 'Khuyến mãi lớn mùa lễ hội - Giảm đến 30% cho tất cả tuyến đường',
            excerpt: 'Nhân dịp cuối năm, Vé xe nhanh triển khai chương trình khuyến mãi lớn với mức giảm giá hấp dẫn...',
            image: 'https://images.unsplash.com/photo-1607344645866-009c7d0f2e8d?w=400&h=250&fit=crop',
            category: 'Khuyến mãi',
            publishDate: '2024-11-25',
            author: 'Marketing Team',
            views: 890,
            hot: true
        },
        {
            id: 3,
            title: 'Mở rộng mạng lưới đối tác - Thêm 50 nhà xe mới',
            excerpt: 'Vé xe nhanh tiếp tục mở rộng mạng lưới với 50 nhà xe đối tác mới trên toàn quốc...',
            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop',
            category: 'Đối tác',
            publishDate: '2024-11-23',
            author: 'Business Team',
            views: 654
        },
        {
            id: 4,
            title: 'Hướng dẫn sử dụng vé điện tử QR Code mới',
            excerpt: 'Cách sử dụng vé điện tử QR Code mới của Vé xe nhanh một cách đơn giản và hiệu quả...',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop',
            category: 'Hướng dẫn',
            publishDate: '2024-11-20',
            author: 'Support Team',
            views: 432
        },
        {
            id: 5,
            title: 'Chính sách hoàn tiền mới - Linh hoạt và nhanh chóng hơn',
            excerpt: 'Vé xe nhanh cập nhật chính sách hoàn tiền mới giúp khách hàng có trải nghiệm tốt hơn...',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
            category: 'Chính sách',
            publishDate: '2024-11-18',
            author: 'Customer Service',
            views: 321
        },
        {
            id: 6,
            title: 'Tính năng đánh giá và review từ khách hàng',
            excerpt: 'Hệ thống đánh giá mới giúp khách hàng chia sẻ trải nghiệm và lựa chọn nhà xe phù hợp...',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            category: 'Tính năng',
            publishDate: '2024-11-15',
            author: 'Product Team',
            views: 567
        }
    ];

    const categories = [
        { name: 'Tất cả', count: 25, active: true },
        { name: 'Công nghệ', count: 8 },
        { name: 'Khuyến mãi', count: 6 },
        { name: 'Đối tác', count: 4 },
        { name: 'Hướng dẫn', count: 7 }
    ];



    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-red-50">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-full font-medium text-sm mb-6">
                        <FireOutlined className="mr-2" />
                        Tin tức mới nhất
                    </div>
                    <Title level={1} className="text-neutral-800 mb-4">
                        Tin tức & Cập nhật
                    </Title>
                    <Paragraph className="text-xl text-neutral-600 max-w-3xl mx-auto">
                        Cập nhật những tin tức mới nhất về dịch vụ, tính năng và khuyến mãi từ Vé xe nhanh
                    </Paragraph>
                </div>

                {/* Categories Filter */}
                <div className="mb-8">
                    <Card className="border-0 shadow-sm">
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category, index) => (
                                <Button
                                    key={index}
                                    type={category.active ? 'primary' : 'default'}
                                    className={category.active ? 'bg-gradient-to-r from-primary-500 to-red-500 border-0' : ''}
                                >
                                    {category.name} ({category.count})
                                </Button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Featured News */}
                <Row gutter={[32, 32]} className="mb-12">
                    <Col xs={24} lg={12}>
                        <NewsCard
                            article={featuredNews}
                            size="featured"
                            onClick={() => console.log('Navigate to article:', featuredNews.id)}
                        />
                    </Col>
                    <Col xs={24} lg={12}>
                        <div className="h-full flex flex-col justify-center space-y-6">
                            <div className="bg-gradient-to-r from-primary-50 to-red-50 p-6 rounded-2xl border border-primary-100">
                                <Title level={4} className="text-primary-700 mb-3">
                                    📰 Tin tức nổi bật
                                </Title>
                                <Text className="text-neutral-600">
                                    Cập nhật những thông tin mới nhất về dịch vụ, công nghệ và khuyến mãi từ Vé xe nhanh
                                </Text>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-100">
                                <Title level={4} className="text-neutral-800 mb-4">
                                    🔥 Thống kê
                                </Title>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary-600">25+</div>
                                        <div className="text-sm text-neutral-500">Bài viết</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">15K+</div>
                                        <div className="text-sm text-neutral-500">Lượt đọc</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* News Grid */}
                <div className="mb-8">
                    <Title level={3} className="text-neutral-800 mb-6">
                        Tin tức khác
                    </Title>
                    <Row gutter={[24, 24]}>
                        {newsArticles.map((article) => (
                            <Col key={article.id} xs={24} sm={12} lg={8} xl={6}>
                                <NewsCard
                                    article={article}
                                    onClick={() => console.log('Navigate to article:', article.id)}
                                />
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Load More */}
                <div className="text-center">
                    <Button
                        size="large"
                        className="px-8 py-2 h-auto text-lg font-medium border-2 border-primary-500 text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300"
                    >
                        Xem thêm tin tức
                        <ArrowRightOutlined className="ml-2" />
                    </Button>
                </div>
            </div>
            </div>
        </CustomerLayout>
    );
};

export default NewsPage;