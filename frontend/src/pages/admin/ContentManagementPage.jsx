import { useState } from 'react';
import { Tabs, Card } from 'antd';
import {
  FileImageOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import BannerManagement from '../../components/admin/content/BannerManagement';
import BlogManagement from '../../components/admin/content/BlogManagement';
import FAQManagement from '../../components/admin/content/FAQManagement';

const ContentManagementPage = () => {
  const [activeTab, setActiveTab] = useState('banners');

  const items = [
    {
      key: 'banners',
      label: (
        <span>
          <FileImageOutlined />
          Banners
        </span>
      ),
      children: (
        <Card>
          <BannerManagement />
        </Card>
      ),
    },
    {
      key: 'blogs',
      label: (
        <span>
          <FileTextOutlined />
          Blogs
        </span>
      ),
      children: (
        <Card>
          <BlogManagement />
        </Card>
      ),
    },
    {
      key: 'faqs',
      label: (
        <span>
          <QuestionCircleOutlined />
          FAQs
        </span>
      ),
      children: (
        <Card>
          <FAQManagement />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Nội Dung</h1>
        <p className="text-gray-600 mt-1">
          Quản lý banners, blogs, FAQs và nội dung trang web
        </p>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </div>
  );
};

export default ContentManagementPage;
