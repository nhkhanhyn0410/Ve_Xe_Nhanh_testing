# Components

Thư mục chứa các React components.

## Cấu trúc

### `common/`

Các component tái sử dụng chung:

- Button, Input, Card, Modal, etc.
- Loading, ErrorBoundary
- Form components

### `layout/`

Các component layout:

- Header, Footer, Sidebar
- MainLayout, AuthLayout
- Navigation components

### `auth/`

Các component liên quan đến authentication:

- LoginForm, RegisterForm
- ForgotPasswordForm
- OTPVerification

### `booking/`

Các component liên quan đến đặt vé:

- TripCard, TripList
- SeatSelection
- BookingForm, BookingSummary

### `payment/`

Các component liên quan đến thanh toán:

- PaymentMethod
- PaymentStatus
- Invoice

## Quy tắc đặt tên

- Component names: PascalCase (e.g., `TripCard.jsx`)
- File names: PascalCase (e.g., `TripCard.jsx`)
- Folder names: kebab-case hoặc camelCase

## Example

```jsx
// components/common/Button.jsx
const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
```
