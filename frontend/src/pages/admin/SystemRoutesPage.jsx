import { PageHeader, Card, EmptyState } from '../../components/admin/vxn';

const SystemRoutesPage = () => (
  <div>
    <PageHeader
      title="Tuyến đường"
      description="Toàn bộ tuyến đường khai thác trên hệ thống — theo dõi mạng lưới của tất cả nhà xe."
    />
    <Card padding={0}>
      <EmptyState icon="map" title="Đang tải tuyến đường…" hint="Dữ liệu tuyến đường toàn hệ thống." />
    </Card>
  </div>
);

export default SystemRoutesPage;
