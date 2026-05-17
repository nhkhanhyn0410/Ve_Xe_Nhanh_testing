import { PageHeader, Card, EmptyState } from '../../components/admin/vxn';

const ReviewsPage = () => (
  <div>
    <PageHeader
      title="Đánh giá"
      description="Đánh giá & phản hồi của khách hàng về các nhà xe trên toàn hệ thống."
    />
    <Card padding={0}>
      <EmptyState icon="star" title="Đang tải đánh giá…" hint="Dữ liệu đánh giá toàn hệ thống." />
    </Card>
  </div>
);

export default ReviewsPage;
