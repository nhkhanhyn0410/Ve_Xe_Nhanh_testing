import { PageHeader, Card, EmptyState } from '../../components/admin/vxn';

const SystemTripsPage = () => (
  <div>
    <PageHeader
      title="Chuyến xe"
      description="Toàn bộ chuyến xe trên hệ thống — giám sát lịch trình và tình trạng khai thác của mọi nhà xe."
    />
    <Card padding={0}>
      <EmptyState icon="route" title="Đang tải chuyến xe…" hint="Dữ liệu chuyến xe toàn hệ thống." />
    </Card>
  </div>
);

export default SystemTripsPage;
