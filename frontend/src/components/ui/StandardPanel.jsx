import { Card, Typography, Space, Button, Divider } from 'antd';
import { componentVariants } from '../../styles/design-system';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

const StandardPanel = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  footer,
  variant = 'default',
  size = 'medium',
  loading = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      padding: 16,
      titleLevel: 5,
      styles: { body: { padding: 16 } },
    },
    medium: {
      padding: 24,
      titleLevel: 4,
      styles: { body: { padding: 24 } },
    },
    large: {
      padding: 32,
      titleLevel: 3,
      styles: { body: { padding: 32 } },
    },
  };

  const config = sizeConfig[size];

  // Variant styles
  const variantClasses = {
    default: 'bg-white border border-neutral-200 shadow-sm',
    elevated: 'bg-white shadow-lg border-0',
    bordered: 'bg-white border-2 border-primary-200',
    ghost: 'bg-transparent border-0 shadow-none',
  };

  // Header component
  const renderHeader = () => {
    if (!title && !actions) return null;

    return (
      <div className={`flex items-center justify-between ${headerClassName}`}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-primary-500 text-xl">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <Title 
                level={config.titleLevel} 
                className="!mb-0"
              >
                {title}
              </Title>
            )}
            {subtitle && (
              <Text type="secondary" className="text-sm">
                {subtitle}
              </Text>
            )}
          </div>
        </div>
        
        {actions && (
          <Space size="small">
            {Array.isArray(actions) ? actions.map((action, index) => (
              <div key={index}>{action}</div>
            )) : actions}
          </Space>
        )}
      </div>
    );
  };

  // Footer component
  const renderFooter = () => {
    if (!footer) return null;

    return (
      <>
        <Divider className="!my-4" />
        <div className={`${footerClassName}`}>
          {footer}
        </div>
      </>
    );
  };

  return (
    <Card
      loading={loading}
      className={`${variantClasses[variant]} ${className}`}
      styles={config.styles}
      {...props}
    >
      {renderHeader()}
      
      {(title || actions) && <Divider className="!my-4" />}
      
      <div className={contentClassName}>
        {children}
      </div>
      
      {renderFooter()}
    </Card>
  );
};

StandardPanel.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  actions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'elevated', 'bordered', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  footerClassName: PropTypes.string,
};

export default StandardPanel;