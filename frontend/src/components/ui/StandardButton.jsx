import { Button } from 'antd';
import PropTypes from 'prop-types';

const StandardButton = ({
  variant = 'primary',
  size = 'middle',
  children,
  className = '',
  ...props
}) => {
  // Variant configurations
  const variantConfig = {
    primary: {
      type: 'primary',
      className: 'bg-gradient-primary border-0 hover:opacity-90 transition-all duration-200',
    },
    secondary: {
      type: 'default',
      className: 'bg-gradient-secondary text-white border-0 hover:opacity-90 transition-all duration-200',
    },
    outline: {
      type: 'default',
      className: 'border-primary-500 text-primary-500 hover:bg-primary-50 hover:border-primary-600 transition-all duration-200',
    },
    ghost: {
      type: 'text',
      className: 'text-primary-500 hover:bg-primary-50 transition-all duration-200',
    },
    danger: {
      type: 'primary',
      danger: true,
      className: 'bg-gradient-error border-0 hover:opacity-90 transition-all duration-200',
    },
    success: {
      type: 'primary',
      className: 'bg-gradient-success border-0 hover:opacity-90 transition-all duration-200',
    },
    warning: {
      type: 'primary',
      className: 'bg-gradient-warning border-0 hover:opacity-90 transition-all duration-200',
    },
  };

  const config = variantConfig[variant] || variantConfig.primary;

  return (
    <Button
      {...config}
      size={size}
      className={`${config.className} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

StandardButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning']),
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default StandardButton;