import { Empty, Typography, Button, Space } from 'antd';
import { 
  InboxOutlined, 
  SearchOutlined, 
  FileTextOutlined,
  ExclamationCircleOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

const EmptyState = ({
  type = 'default',
  title,
  description,
  action,
  actionText = 'Thử lại',
  onAction,
  className = '',
  size = 'default',
}) => {
  // Type configurations
  const typeConfig = {
    default: {
      icon: <InboxOutlined className="text-6xl text-neutral-300" />,
      title: title || 'Không có dữ liệu',
      description: description || 'Chưa có dữ liệu để hiển thị',
    },
    search: {
      icon: <SearchOutlined className="text-6xl text-neutral-300" />,
      title: title || 'Không tìm thấy kết quả',
      description: description || 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc',
    },
    noData: {
      icon: <FileTextOutlined className="text-6xl text-neutral-300" />,
      title: title || 'Chưa có dữ liệu',
      description: description || 'Dữ liệu sẽ xuất hiện ở đây khi có',
    },
    error: {
      icon: <ExclamationCircleOutlined className="text-6xl text-error-400" />,
      title: title || 'Có lỗi xảy ra',
      description: description || 'Không thể tải dữ liệu. Vui lòng thử lại',
    },
    create: {
      icon: <PlusOutlined className="text-6xl text-primary-400" />,
      title: title || 'Bắt đầu tạo mới',
      description: description || 'Tạo mục đầu tiên của bạn',
    },
  };

  const config = typeConfig[type] || typeConfig.default;

  // Size configurations
  const sizeConfig = {
    small: {
      containerClass: 'py-8',
      titleLevel: 5,
      descriptionClass: 'text-sm',
    },
    default: {
      containerClass: 'py-12',
      titleLevel: 4,
      descriptionClass: 'text-base',
    },
    large: {
      containerClass: 'py-16',
      titleLevel: 3,
      descriptionClass: 'text-lg',
    },
  };

  const sizeConf = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeConf.containerClass} ${className}`}>
      <div className="mb-4">
        {config.icon}
      </div>
      
      <Title level={sizeConf.titleLevel} className="!mb-2 text-neutral-700">
        {config.title}
      </Title>
      
      <Text className={`text-neutral-500 ${sizeConf.descriptionClass} mb-6 max-w-md`}>
        {config.description}
      </Text>
      
      {(action || onAction) && (
        <Space>
          {action || (
            <Button 
              type="primary" 
              onClick={onAction}
              className="bg-gradient-primary border-0"
            >
              {actionText}
            </Button>
          )}
        </Space>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  type: PropTypes.oneOf(['default', 'search', 'noData', 'error', 'create']),
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

export default EmptyState;