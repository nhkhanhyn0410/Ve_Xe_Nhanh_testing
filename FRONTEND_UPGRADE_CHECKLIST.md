# Checklist nâng cấp frontend Vé Xe Nhanh

Mục tiêu: nâng cấp `frontend/` theo thiết kế trong `Vé Xe Nhanh/`, giữ nguyên luồng nghiệp vụ và API production hiện có.

Nguồn tham chiếu chính:

- `reverse_engineer.md` - kiến trúc tổng quan, actor, API, testing, deployment.
- `Vé Xe Nhanh/` - prototype customer redesign, design tokens, fonts, icons, assets, screen flows.
- `frontend/` - React/Vite/Tailwind/Ant Design production app cần nâng cấp.

## Nguyên tắc theo dõi

- `[ ]` Chưa làm.
- `[~]` Đang làm hoặc đã có một phần.
- `[x]` Hoàn tất và đã kiểm chứng.
- Mỗi mục hoàn tất nên ghi file chính đã chỉnh và lệnh kiểm chứng đã chạy.
- Không đánh dấu hoàn tất nếu chỉ port giao diện nhưng làm hỏng API, store, route hoặc auth guard.

## 0. Khảo sát và chốt phạm vi

- [x] Đọc `reverse_engineer.md` để nắm kiến trúc 4 web app: Customer, Operator, Trip Manager, Admin.
- [x] Xác định frontend production là React 18 + Vite + Tailwind + Ant Design + Zustand + React Router.
- [x] Xác định `Vé Xe Nhanh/` là prototype chạy bằng HTML, UMD React, Babel, global component và mock data.
- [x] Xác định không copy nguyên design canvas vào production.
- [x] Chốt phạm vi đợt 1: ưu tiên customer web trước operator/admin/trip-manager.
- [x] Chốt danh sách màn hình customer phải nâng cấp trong milestone đầu.

## 1. Design system và asset nền

- [x] Copy fonts Be Vietnam Pro từ `Vé Xe Nhanh/design-system/fonts/` sang `frontend/src/assets/fonts/` - đã copy 18 file `.ttf`.
- [x] Copy logo, hero image và icon cần thiết từ `Vé Xe Nhanh/design-system/assets/` - đã copy 16 asset vào `frontend/src/assets/brand/` và `frontend/src/assets/icons/vxn/`.
- [x] Thêm `@font-face` Be Vietnam Pro vào CSS production - khai báo đủ 18 weight/style trong `frontend/src/index.css`.
- [x] Cập nhật `frontend/src/styles/design-system.js` từ red/purple theme sang teal/saffron/neutral VXN.
- [x] Cập nhật Tailwind config để expose màu `vxn-teal`, `vxn-saffron`, `vxn-bg`, `vxn-border`.
- [x] Cập nhật Ant Design theme trong `ThemeProvider` theo token VXN.
- [x] Dọn hoặc sửa các utility gradient cũ đang hard-code blue/red/purple - đã đổi utility gradient/spinner/progress/table action sang token VXN.
- [x] Sửa lỗi comment CSS trong `frontend/src/styles/custom.css`.
- [ ] Kiểm tra màu, contrast và font trên Chrome desktop - môi trường hiện không có Chrome/Chromium headless để xác nhận bằng trình duyệt.
- [x] Kiểm tra build không lỗi sau khi đổi token - `npm run build` trong `frontend/` thành công.

## 2. Layout customer chung

- [x] Hợp nhất hai `CustomerLayout` trùng vai trò trong `frontend/src/components/customer/` và `frontend/src/components/layouts/` - `components/layouts/CustomerLayout.jsx` re-export layout canonical từ `components/customer/CustomerLayout.jsx`.
- [x] Thiết kế lại customer chrome theo brand VXN: sidebar trái 256px, logo, nav, auth state, mobile drawer - thêm `components/customer/CustomerShell.jsx`; `npm run build` trong `frontend/` thành công.
- [x] Giữ `CustomerFooter` cho trường hợp cần hiển thị, nhưng customer layout mặc định dùng sidebar shell theo `Vé Xe Nhanh.html` thay vì header/footer ngang.
- [x] Tạo primitives dùng chung: `VxnButton`, `VxnCard`, `VxnChip`, `VxnPageHeader`, `VxnFieldShell` nếu thật sự giảm lặp - chưa tạo abstraction mới vì layout/home hiện tại chưa đủ lặp để đáng tách.
- [x] Dùng icon library hiện có thay vì nhúng global SVG từ prototype khi phù hợp - dùng Ant Design Icons trong header, footer và home.
- [~] Bảo đảm header/footer không che nội dung ở mobile - đã dùng responsive classes và drawer, cần kiểm tra trực quan trên Chrome/mobile viewport.
- [x] Bảo đảm các trang customer vẫn giữ route hiện có - giữ `/`, `/trips`, `/search-results`, `/tickets/lookup`, auth/user routes; `npm run build` thành công.
- [~] Kiểm chứng trạng thái đăng nhập/đăng xuất và user menu - logic `authStore`/logout được giữ, cần click test với session thật.

## 3. Trang chủ và tìm kiếm

- [x] Fetch bundle từ Claude Design URL, đọc `README.md`, `chats/chat1.md`, `project/Vé Xe Nhanh.html` và các imports chính trước khi implement.
- [x] Nâng cấp `NewHomePage.jsx` theo prototype `HomeScreen` - đã đổi sang page frame có sidebar trái, hero top utility, search card nổi và các section đúng cấu trúc prototype.
- [x] Dùng hero image thật từ prototype thay cho nền gradient/orb - dùng `frontend/src/assets/brand/hero-landscape.jpg` cho hero và route card nổi bật.
- [x] Tăng chiều cao và hạ vị trí hero trang chủ để ảnh/search card thoáng hơn - `NewHomePage.jsx` dùng `lg:h-[820px]`, `lg:pt-36`, search card `lg:bottom-[-96px]`; `docker compose up -d --build frontend` build thành công.
- [x] Port search overlay card: điểm đi, điểm đến, ngày đi, đổi chiều, số khách, submit - giữ Ant Design Form/AutoComplete/DatePicker/Select nhưng style lại theo field shell của prototype.
- [x] Giữ logic `setSearchCriteria` và navigate `/search-results` - submit map về `{ fromCity, toCity, date, passengers }`, giới hạn khách theo rule hiện có.
- [x] Thêm tuyến phổ biến, lý do chọn VXN, nhà xe đối tác theo UI mới - thêm layout route card lớn/nhỏ, value props, operators và promo/blog strip.
- [x] Thay mock route card bằng dữ liệu API nếu endpoint sẵn có; nếu chưa có thì tách rõ fallback - tách rõ `popularRoutesFallback` và `operatorFallback`, chưa gọi API mới vì production app chưa có endpoint homepage riêng.
- [~] Kiểm tra validation form: thiếu điểm đi/đến/ngày đi - Ant Design rules và toast đã giữ, cần click test trên trình duyệt.
- [~] Kiểm tra responsive desktop/tablet/mobile - layout đã dùng responsive grid/classes, cần kiểm tra trực quan trên Chrome/mobile viewport.

## 4. Danh sách chuyến

- [ ] Nâng cấp `TripsPage.jsx` theo prototype `SearchResultsScreen`.
- [ ] Giữ API `searchTrips`, filter, sort, pagination hiện có.
- [ ] Tách trip normalization ra helper để tránh lặp và dễ test.
- [ ] Port trip result card: timeline, operator, rating, amenities, seat left, price, CTA.
- [ ] Thiết kế lại filter panel: khoảng giá, loại xe, nhà xe, giờ đi, tiện ích.
- [ ] Hiển thị loading/empty/error theo style VXN.
- [ ] Không làm mất route `/trips` và `/search-results`.
- [ ] Kiểm tra chọn chuyến dẫn đúng `/trips/:tripId`.

## 5. Chi tiết chuyến và chọn ghế

- [ ] Nâng cấp `TripDetailPage.jsx` theo prototype `TripDetailScreen`.
- [ ] Giữ API `getTripDetails` và `getAvailableSeats`.
- [ ] Giữ store booking: `selectedTrip`, `selectedSeats`, pickup, dropoff.
- [ ] Nâng cấp `SeatMapComponent.jsx` theo visual sleeper bus hai tầng trong prototype.
- [ ] Giữ logic không chọn ghế đã booked/held và giới hạn số ghế.
- [ ] Thêm legend ghế rõ ràng: trống, đang chọn, đang giữ, đã đặt.
- [ ] Thiết kế lại pickup/dropoff selector theo card/timeline.
- [ ] Thiết kế sticky booking summary bên phải trên desktop.
- [ ] Bảo đảm mobile vẫn thao tác được chọn ghế và CTA.
- [ ] Kiểm tra dữ liệu seatLayout từ backend với nhiều loại xe.

## 6. Passenger info, booking confirmation, payment

- [ ] Nâng cấp `PassengerInfoPage.jsx` theo prototype `PassengerInfoScreen`.
- [ ] Giữ validation passenger, phone, email, id card nếu đang có.
- [ ] Tích hợp saved passengers nếu API/store đã có.
- [ ] Nâng cấp `BookingConfirmationPage.jsx` theo payment/summary style mới.
- [ ] Giữ luồng tạo booking và payment hiện có.
- [ ] Nâng cấp các trang `VNPayReturn`, `BookingSuccess`, `BookingFailure`.
- [ ] Bảo đảm callback payment không bị đổi route ngoài `App.jsx`.
- [ ] Kiểm tra happy path: search -> trip detail -> seat -> passenger -> payment.
- [ ] Kiểm tra failure path: hết ghế, hold timeout, payment fail.

## 7. Vé điện tử và khách không đăng nhập

- [ ] Nâng cấp `MyTicketsPage.jsx` theo prototype `MyTicketsScreen`.
- [ ] Nâng cấp ticket detail/QR nếu route hoặc component hiện có hỗ trợ.
- [ ] Nâng cấp `GuestTicketLookupPage.jsx` theo prototype `GuestLookupScreen`.
- [ ] Nâng cấp `CancelTicketPage.jsx` theo prototype `GuestCancelScreen` và policy hiện có.
- [ ] Giữ API ticket lookup, OTP, cancel, download PDF, QR.
- [ ] Hiển thị trạng thái vé: valid, used, cancelled, refund processing.
- [ ] Kiểm tra quyền xem vé: customer chỉ xem vé của mình, guest qua OTP.

## 8. Tài khoản, loyalty, review, complaint

- [ ] Nâng cấp `ProfilePage.jsx` theo prototype `ProfileScreen`.
- [ ] Nâng cấp `LoyaltyOverviewPage.jsx` và `LoyaltyHistoryPage.jsx`.
- [ ] Nâng cấp `MyReviewsPage.jsx` và modal tạo review.
- [ ] Nâng cấp `MyComplaintsPage.jsx`, `ComplaintDetailPage.jsx`, complaint modal.
- [ ] Giữ auth guard `ProtectedRoute allowedRoles={['customer']}`.
- [ ] Giữ API user, loyalty, review, complaint hiện có.
- [ ] Mask PII khi hiển thị CCCD, phone, email theo context phù hợp.
- [ ] Kiểm tra empty state và error state cho từng tab.

## 9. Content và auth customer

- [ ] Nâng cấp `NewsPage.jsx` theo prototype blog list/detail/FAQ.
- [ ] Nếu chưa có route FAQ/blog-detail, tạo route rõ ràng hoặc giữ trong NewsPage theo scope.
- [ ] Nâng cấp `CustomerLoginPage.jsx` theo prototype `LoginScreen`.
- [ ] Nâng cấp `CustomerRegisterPage.jsx` theo prototype `RegisterScreen`.
- [ ] Không phá logic login/register hiện có với `authStore`.
- [ ] Giữ social login ở trạng thái đang phát triển nếu backend chưa hỗ trợ.
- [ ] Kiểm tra redirect sau đăng nhập từ protected route.

## 10. Operator, trip manager, admin sau customer

- [ ] Đánh giá có áp dụng toàn bộ VXN tokens cho operator/admin hay chỉ harmonize nhẹ.
- [ ] Không làm mất tính dense dashboard của operator/admin.
- [ ] Kiểm tra operator tenant boundary: mọi thao tác operator vẫn qua API hiện có.
- [ ] Kiểm tra trip-manager QR scanner trên mobile/tablet.
- [ ] Kiểm tra admin table, filter, modal, content management sau khi đổi token toàn cục.

## 11. Kiểm thử và chất lượng

- [ ] Chạy `npm run build` trong `frontend/`.
- [ ] Chạy `npm run lint` trong `frontend/` nếu dependency đã cài.
- [ ] Chạy test frontend nếu có test liên quan.
- [ ] Chạy e2e smoke cho customer booking flow nếu môi trường sẵn sàng.
- [ ] Kiểm tra console không có runtime error ở các route chính.
- [ ] Kiểm tra responsive: 375px, 768px, 1440px.
- [ ] Kiểm tra accessibility cơ bản: label form, focus ring, keyboard navigation.
- [ ] Kiểm tra performance: không import ảnh/font quá nặng không cần thiết.
- [ ] Kiểm tra Docker build frontend nếu đụng cấu hình build/nginx.

## 12. Ghi chú quyết định

- [ ] Ghi lại component nào được port từ prototype và component nào giữ production.
- [ ] Ghi lại mọi route mới hoặc API assumption mới.
- [ ] Ghi lại mọi điểm còn mock/fallback.
- [ ] Ghi lại rủi ro còn lại trước khi bàn giao.
