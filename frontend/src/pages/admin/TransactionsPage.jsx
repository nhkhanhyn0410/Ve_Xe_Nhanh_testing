import { PageHeader, Card, EmptyState } from '../../components/admin/vxn';

const TransactionsPage = () => (
  <div>
    <PageHeader
      title="Giao dịch"
      description="Tất cả giao dịch thanh toán trên hệ thống — đối soát, hoàn tiền, theo dõi cổng thanh toán."
    />
    <Card padding={0}>
      <EmptyState icon="wallet" title="Đang tải giao dịch…" hint="Dữ liệu giao dịch toàn hệ thống." />
    </Card>
  </div>
);

export default TransactionsPage;
