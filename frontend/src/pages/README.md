# Pages

Thư mục chứa các page components (route components).

## Cấu trúc

### `auth/`

Trang authentication:

- `LoginPage.jsx` - Trang đăng nhập
- `RegisterPage.jsx` - Trang đăng ký
- `ForgotPasswordPage.jsx` - Quên mật khẩu
- `ResetPasswordPage.jsx` - Đặt lại mật khẩu
- `VerifyEmailPage.jsx` - Xác thực email

### `customer/`

Trang dành cho khách hàng:

- `HomePage.jsx` - Trang chủ
- `SearchPage.jsx` - Tìm kiếm chuyến xe
- `TripDetailPage.jsx` - Chi tiết chuyến xe
- `BookingPage.jsx` - Đặt vé
- `PaymentPage.jsx` - Thanh toán
- `MyTicketsPage.jsx` - Vé của tôi
- `ProfilePage.jsx` - Thông tin cá nhân
- `LoyaltyPage.jsx` - Điểm thưởng

### `operator/`

Trang dành cho nhà xe:

- `OperatorDashboard.jsx` - Dashboard nhà xe
- `ManageTripsPage.jsx` - Quản lý chuyến xe
- `ManageBusesPage.jsx` - Quản lý xe
- `ManageRoutesPage.jsx` - Quản lý tuyến đường
- `RevenueReportPage.jsx` - Báo cáo doanh thu

### `admin/`

Trang dành cho admin:

- `AdminDashboard.jsx` - Dashboard admin
- `ManageOperatorsPage.jsx` - Quản lý nhà xe
- `ManageUsersPage.jsx` - Quản lý người dùng
- `SystemSettingsPage.jsx` - Cài đặt hệ thống

## Quy tắc

- Mỗi page là một component riêng biệt
- Tên file kết thúc bằng `Page.jsx`
- Export default component
- Sử dụng layout components để wrap page content

## Example

```jsx
// pages/customer/HomePage.jsx
import MainLayout from '@components/layout/MainLayout';
import SearchForm from '@components/booking/SearchForm';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto">
        <h1>Tìm kiếm chuyến xe</h1>
        <SearchForm />
      </div>
    </MainLayout>
  );
};

export default HomePage;
```
