# Assets

Thư mục chứa các static assets.

## Cấu trúc

### `images/`

Hình ảnh tĩnh:

- Logo, banner
- Background images
- Placeholder images
- Icons, illustrations

### `icons/`

Icon files:

- SVG icons
- Custom icons
- Icon fonts (nếu có)

## Quy tắc

- Sử dụng format tối ưu: WebP cho images, SVG cho icons
- Đặt tên file rõ ràng, dễ hiểu
- Tối ưu hóa kích thước file trước khi upload
- Sử dụng kebab-case cho tên file

## Import trong code

```jsx
// Import image
import logo from '@assets/images/logo.png';
import banner from '@assets/images/home-banner.webp';

// Import icon SVG
import { ReactComponent as BusIcon } from '@assets/icons/bus.svg';

// Usage
<img src={logo} alt="Vé xe nhanh Logo" />
<BusIcon className="w-6 h-6" />
```

## Tối ưu hóa

- Images: Sử dụng WebP format, compress trước khi upload
- Icons: Sử dụng SVG hoặc icon libraries (Ant Design Icons)
- Lazy loading cho images lớn
- CDN cho static assets trong production
