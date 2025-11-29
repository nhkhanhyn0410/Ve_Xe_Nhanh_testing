import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

const LoadingSpinner = ({
  size = 'default',
  text = 'Đang tải...',
  spinning = true,
  children,
  className = '',
  indicator,
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      fontSize: 16,
      textSize: 'text-sm',
    },
    default: {
      fontSize: 24,
      textSize: 'text-base',
    },
    large: {
      fontSize: 32,
      textSize: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  const defaultIndicator = (
    <LoadingOutlined 
      style={{ fontSize: config.fontSize, color: '#3b82f6' }} 
      spin 
    />
  );

  if (children) {
    return (
      <Spin 
        spinning={spinning} 
        indicator={indicator || defaultIndicator}
        className={className}
      >
        {children}
      </Spin>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <Spin 
        indicator={indicator || defaultIndicator}
        spinning={spinning}
      />
      {text && (
        <Text className={`mt-3 text-neutral-600 ${config.textSize}`}>
          {text}
        </Text>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  text: PropTypes.string,
  spinning: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  indicator: PropTypes.node,
};

export default LoadingSpinner;