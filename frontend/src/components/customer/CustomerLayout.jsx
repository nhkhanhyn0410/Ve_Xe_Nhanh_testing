import { Layout } from 'antd';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';

const { Content } = Layout;

const CustomerLayout = ({ children, className = '' }) => {
  return (
    <Layout className="min-h-screen bg-white">
      <CustomerHeader />
      <Content className={`flex-1 ${className}`}>
        {children}
      </Content>
      <CustomerFooter />
    </Layout>
  );
};

export default CustomerLayout;