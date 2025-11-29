import { Card, Tag, Typography, Avatar, Divider, Button } from 'antd';
import {
  CalendarOutlined,
  EyeOutlined,
  UserOutlined,
  ArrowRightOutlined,
  FireOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const NewsCard = ({ article, onClick, size = 'default' }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Công nghệ': 'blue',
      'Khuyến mãi': 'red',
      'Đối tác': 'green',
      'Hướng dẫn': 'orange',
      'Chính sách': 'purple',
      'Tính năng': 'cyan'
    };
    return colors[category] || 'default';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (size === 'featured') {
    return (
      <Card className="border-0 shadow-xl overflow-hidden rounded-2xl cursor-pointer" onClick={onClick}>
        <div className="relative h-80 lg:h-96 rounded-xl overflow-hidden mb-6">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <Tag color="red" className="border-0 rounded-full px-3 py-1 font-medium">
              <FireOutlined className="mr-1" />
              Nổi bật
            </Tag>
          </div>
        </div>
        
        <div className="p-6">
          <Tag color={getCategoryColor(article.category)} className="mb-4">
            {article.category}
          </Tag>
          <Title level={2} className="text-neutral-800 mb-4 leading-tight hover:text-primary-600 transition-colors">
            {article.title}
          </Title>
          <Paragraph className="text-neutral-600 text-lg mb-6 leading-relaxed">
            {article.content || article.excerpt}
          </Paragraph>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1">
                <CalendarOutlined />
                {formatDate(article.publishDate)}
              </div>
              <div className="flex items-center gap-1">
                <EyeOutlined />
                {article.views.toLocaleString()} lượt xem
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar size={32} icon={<UserOutlined />} className="bg-gradient-to-r from-primary-500 to-red-500" />
              <Text className="text-neutral-600">{article.author}</Text>
            </div>
            <Button
              type="primary"
              size="large"
              className="bg-gradient-to-r from-primary-500 to-red-500 border-0"
            >
              Đọc thêm
              <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer rounded-2xl overflow-hidden group"
      onClick={onClick}
      cover={
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Tag color={getCategoryColor(article.category)} className="border-0 rounded-full">
              {article.category}
            </Tag>
            {article.hot && (
              <Tag color="red" className="border-0 rounded-full">
                <FireOutlined />
              </Tag>
            )}
          </div>
        </div>
      }
    >
      <div className="p-4">
        <Title level={5} className="text-neutral-800 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {article.title}
        </Title>
        <Paragraph className="text-neutral-600 mb-4 line-clamp-3">
          {article.excerpt}
        </Paragraph>
        
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
          <div className="flex items-center gap-1">
            <ClockCircleOutlined />
            {formatDate(article.publishDate)}
          </div>
          <div className="flex items-center gap-1">
            <EyeOutlined />
            {article.views}
          </div>
        </div>

        <Divider className="my-4" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar size={24} icon={<UserOutlined />} className="bg-neutral-400" />
            <Text className="text-neutral-500 text-xs">{article.author}</Text>
          </div>
          <Button type="text" size="small" className="text-primary-600 hover:text-primary-700">
            Đọc thêm
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;