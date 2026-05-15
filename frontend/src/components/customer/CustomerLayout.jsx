import CustomerFooter from './CustomerFooter';
import CustomerShell from './CustomerShell';

const CustomerLayout = ({ children, className = '', hideFooter = true }) => {
  return (
    <CustomerShell mainClassName={`bg-vxn-bg-soft ${className}`}>
      {children}
      {!hideFooter && <CustomerFooter />}
    </CustomerShell>
  );
};

export default CustomerLayout;
