import { Layout } from 'antd';
import CustomerHeader from '../customer/CustomerHeader';
import CustomerFooter from '../customer/CustomerFooter';

const { Content } = Layout;

/**
 * CustomerLayout - Main layout wrapper for customer-facing pages
 *
 * Features:
 * - Consistent header across all customer pages
 * - Responsive footer
 * - Flexible content area
 * - Min height to push footer down
 *
 * Usage:
 * <CustomerLayout>
 *   <YourPageContent />
 * </CustomerLayout>
 */
const CustomerLayout = ({ children, className = '' }) => {
  return (
    <Layout className="min-h-screen flex flex-col">
      {/* Header */}
      <CustomerHeader />

      {/* Main Content */}
      <Content className={`flex-1 ${className}`}>
        {children}
      </Content>

      {/* Footer */}
      <CustomerFooter />
    </Layout>
  );
};

export default CustomerLayout;
