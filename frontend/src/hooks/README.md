# Custom Hooks

Thư mục chứa các custom React hooks.

## Danh sách hooks dự kiến

### Authentication

- `useAuth.js` - Hook quản lý authentication state
- `useLogin.js` - Hook xử lý đăng nhập
- `useRegister.js` - Hook xử lý đăng ký

### Data Fetching

- `useTrips.js` - Hook fetch danh sách chuyến xe
- `useTripDetail.js` - Hook fetch chi tiết chuyến xe
- `useBookings.js` - Hook quản lý bookings
- `useTickets.js` - Hook quản lý tickets

### Form

- `useForm.js` - Hook quản lý form state
- `useFormValidation.js` - Hook validate form

### UI/UX

- `useDebounce.js` - Hook debounce input
- `useLocalStorage.js` - Hook tương tác với localStorage
- `useCountdown.js` - Hook đếm ngược (cho seat hold timer)
- `useMediaQuery.js` - Hook responsive design

### Payment

- `usePayment.js` - Hook xử lý thanh toán
- `usePaymentStatus.js` - Hook kiểm tra trạng thái thanh toán

## Quy tắc đặt tên

- Hook names bắt đầu bằng `use`
- File names: camelCase (e.g., `useAuth.js`)
- Export default hook function

## Example

```jsx
// hooks/useAuth.js
import useAuthStore from '@store/authStore';

const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};

export default useAuth;
```

```jsx
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
```
