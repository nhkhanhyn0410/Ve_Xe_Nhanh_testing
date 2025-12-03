# TÀI LIỆU TEST CASE - HỆ THỐNG ĐẶT VÉ XE KHÁCH

## 1. THÔNG TIN DỰ ÁN
- **Tên dự án**: Vé Xe Nhanh
- **Mô tả**: Hệ thống đặt vé xe khách trực tuyến
- **Phiên bản**: 1.0.0
- **Ngày tạo**: 03/12/2025

---

## 2. BẢNG KIỂM THỬ CHI TIẾT

### 2.1. MODULE XÁC THỰC (AUTHENTICATION)

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_AUTH_001** | Đăng ký khách hàng | Chưa có tài khoản | 1. Truy cập trang đăng ký<br>2. Nhập đầy đủ thông tin hợp lệ<br>3. Click "Đăng ký" | Tạo tài khoản thành công, tự động đăng nhập | ✓ | PASS |
| **TC_AUTH_002** | Đăng ký với email đã tồn tại | Email đã được đăng ký | 1. Nhập email đã tồn tại<br>2. Điền các thông tin khác<br>3. Click "Đăng ký" | Hiển thị lỗi "Email đã được sử dụng" | ✓ | PASS |
| **TC_AUTH_003** | Đăng nhập khách hàng | Có tài khoản hợp lệ | 1. Nhập email và password đúng<br>2. Click "Đăng nhập" | Đăng nhập thành công, chuyển về trang chủ | ✓ | PASS |
| **TC_AUTH_004** | Đăng nhập với mật khẩu sai | Có tài khoản | 1. Nhập email đúng, password sai<br>2. Click "Đăng nhập" | Hiển thị lỗi "Thông tin đăng nhập không chính xác" | ✓ | PASS |
| **TC_AUTH_005** | Đăng nhập nhà xe | Tài khoản operator | 1. Truy cập /operator/login<br>2. Nhập thông tin đúng<br>3. Click "Đăng nhập" | Đăng nhập thành công, vào dashboard nhà xe | ✓ | PASS |
| **TC_AUTH_006** | Đăng nhập admin | Tài khoản admin | 1. Truy cập /admin/login<br>2. Nhập thông tin đúng<br>3. Click "Đăng nhập" | Đăng nhập thành công, vào dashboard admin | ✓ | PASS |
| **TC_AUTH_007** | Đăng nhập quản lý chuyến | Tài khoản trip manager | 1. Truy cập /trip-manager/login<br>2. Nhập mã nhân viên và mật khẩu<br>3. Click "Đăng nhập" | Đăng nhập thành công, token được lưu, truy cập được các API | ✓ | PASS |
| **TC_AUTH_008** | Đăng xuất | Đã đăng nhập | 1. Click "Đăng xuất" | Xóa session, chuyển về trang đăng nhập | ✓ | PASS |

---

### 2.2. MODULE TÌM KIẾM VÀ ĐẶT VÉ

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_BOOK_001** | Tìm kiếm chuyến xe | Truy cập trang chủ | 1. Chọn điểm đi<br>2. Chọn điểm đến<br>3. Chọn ngày khởi hành<br>4. Click "Tìm chuyến" | Hiển thị danh sách chuyến xe phù hợp | ✓ | PASS |
| **TC_BOOK_002** | Tìm kiếm không có kết quả | Không có chuyến | 1. Chọn tuyến đường không có chuyến<br>2. Click "Tìm chuyến" | Hiển thị "Không tìm thấy chuyến xe phù hợp" | ✓ | PASS |
| **TC_BOOK_003** | Xem chi tiết chuyến | Có kết quả tìm kiếm | 1. Click vào một chuyến xe<br>2. Xem thông tin chi tiết | Hiển thị đầy đủ: giờ đi, điểm đón, giá vé, số ghế trống | ✓ | PASS |
| **TC_BOOK_004** | Chọn ghế ngồi | Xem chi tiết chuyến | 1. Click "Đặt vé"<br>2. Click chọn ghế trống<br>3. Ghế chuyển màu xanh | Ghế được chọn, hiển thị số ghế đã chọn | ✓ | PASS |
| **TC_BOOK_005** | Không cho chọn ghế đã đặt | Có ghế đã được đặt | 1. Click vào ghế màu đỏ (đã đặt) | Không thể chọn, không có phản ứng | ✓ | PASS |
| **TC_BOOK_006** | Nhập thông tin hành khách | Đã chọn ghế | 1. Điền họ tên, email, SĐT<br>2. Click "Tiếp tục" | Chuyển sang bước thanh toán | ✓ | PASS |
| **TC_BOOK_007** | Áp dụng voucher hợp lệ | Có voucher | 1. Nhập mã voucher<br>2. Click "Áp dụng" | Giảm giá thành công, hiển thị số tiền giảm | ✓ | PASS |
| **TC_BOOK_008** | Áp dụng voucher không hợp lệ | Voucher đã hết hạn/sai | 1. Nhập mã voucher sai<br>2. Click "Áp dụng" | Hiển thị lỗi "Mã voucher không hợp lệ" | ✓ | PASS |

---

### 2.3. MODULE THANH TOÁN

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_PAY_001** | Thanh toán VNPay thành công | Đã nhập thông tin | 1. Chọn VNPay<br>2. Click "Thanh toán"<br>3. Thanh toán trên VNPay<br>4. Quay lại website | Booking status = confirmed, nhận email/SMS xác nhận | ✓ | PASS |
| **TC_PAY_002** | Hủy thanh toán VNPay | Đang thanh toán | 1. Click "Thanh toán"<br>2. Click "Hủy" trên VNPay | Quay lại trang đặt vé, booking status = pending | ✓ | PASS |
| **TC_PAY_003** | Thanh toán khi đã hết ghế | Ghế vừa bị đặt | 1. Người khác đặt ghế đó trước<br>2. Tiếp tục thanh toán | Hiển thị lỗi "Ghế không còn trống" | ✓ | PASS |
| **TC_PAY_004** | Xem vé sau thanh toán | Thanh toán thành công | 1. Vào "Vé của tôi"<br>2. Click xem chi tiết | Hiển thị thông tin vé, mã QR, PDF download | ✓ | PASS |

---

### 2.4. MODULE HỦY VÉ VÀ HOÀN TIỀN

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_CANCEL_001** | Hủy vé trước 2 giờ | Vé hợp lệ, >2h trước khởi hành | 1. Vào "Vé của tôi"<br>2. Click "Hủy vé"<br>3. Xác nhận hủy | Vé chuyển sang "cancelled", hoàn 100% tiền, ghế được nhả | ✓ | PASS |
| **TC_CANCEL_002** | Hủy vé trong vòng 2 giờ | Vé hợp lệ, <2h trước khởi hành | 1. Click "Hủy vé"<br>2. Xác nhận | Vé bị hủy, ghế được nhả, KHÔNG hoàn tiền (0%) | ✓ | PASS |
| **TC_CANCEL_003** | Không thể hủy sau khởi hành | Xe đã khởi hành | 1. Thử click "Hủy vé" | Nút "Hủy vé" không hiển thị | ✓ | PASS |
| **TC_CANCEL_004** | Hủy vé guest (không đăng nhập) | Vé đặt không đăng nhập | 1. Truy cập /cancel-ticket<br>2. Nhập mã booking + email/SĐT<br>3. Xác nhận | Vé được hủy thành công với logic hoàn tiền giống trên | ✓ | PASS |
| **TC_CANCEL_005** | Hủy vé với booking status=paid | Vé đã thanh toán | 1. Click "Hủy vé"<br>2. Xác nhận | Backend chấp nhận status paid/completed, nhả ghế thành công | ✓ | PASS |

---

### 2.5. MODULE TRA CỨU VÉ (GUEST)

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_LOOKUP_001** | Tra cứu vé bằng email | Có vé đặt với email | 1. Truy cập /tickets/lookup<br>2. Nhập email<br>3. Nhập OTP từ email<br>4. Xác nhận | Hiển thị danh sách vé đã đặt với email đó | ✓ | PASS |
| **TC_LOOKUP_002** | Tra cứu vé bằng SĐT | Có vé đặt với SĐT | 1. Nhập số điện thoại<br>2. Nhập OTP từ SMS<br>3. Xác nhận | Hiển thị danh sách vé đã đặt với SĐT đó | ✓ | PASS |
| **TC_LOOKUP_003** | Gửi OTP qua email | Nhập email hợp lệ | 1. Nhập email<br>2. Click "Gửi OTP" | Nhận email chứa mã OTP 6 chữ số, có hiệu lực 5 phút | ✓ | PASS |
| **TC_LOOKUP_004** | Nhập OTP sai | Đã nhận OTP | 1. Nhập OTP sai<br>2. Click "Xác nhận" | Hiển thị lỗi "Mã OTP không đúng" | ✓ | PASS |
| **TC_LOOKUP_005** | OTP hết hạn | OTP đã quá 5 phút | 1. Đợi >5 phút<br>2. Nhập OTP cũ | Hiển thị lỗi "Mã OTP đã hết hạn" | ✓ | PASS |
| **TC_LOOKUP_006** | Tra cứu không có vé | Email/SĐT chưa đặt vé | 1. Nhập email chưa đặt vé<br>2. Click "Gửi OTP" | Hiển thị lỗi "Không tìm thấy vé nào" | ✓ | PASS |
| **TC_LOOKUP_007** | Hủy vé từ trang tra cứu | Tra cứu thành công | 1. Click nút "Hủy vé" bên cạnh vé<br>2. Tự động điền thông tin vào form hủy | Chuyển sang trang hủy vé với thông tin đã điền sẵn | ✓ | PASS |

---

### 2.6. MODULE QUẢN LÝ NHÀ XE (OPERATOR)

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_OP_001** | Tạo tuyến đường mới | Đăng nhập operator | 1. Vào "Tuyến đường"<br>2. Click "Thêm tuyến"<br>3. Điền thông tin<br>4. Lưu | Tạo tuyến thành công, hiển thị trong danh sách | ✓ | PASS |
| **TC_OP_002** | Thêm xe mới | Đã có nhà xe | 1. Vào "Xe"<br>2. Click "Thêm xe"<br>3. Nhập biển số, loại xe, số ghế<br>4. Lưu | Thêm xe thành công | ✓ | PASS |
| **TC_OP_003** | Tạo chuyến xe | Có tuyến đường và xe | 1. Vào "Chuyến"<br>2. Click "Tạo chuyến"<br>3. Chọn tuyến, xe, giờ đi<br>4. Lưu | Tạo chuyến thành công, có thể đặt vé | ✓ | PASS |
| **TC_OP_004** | Thêm nhân viên | Đăng nhập operator | 1. Vào "Nhân viên"<br>2. Click "Thêm nhân viên"<br>3. Chọn role (driver/trip_manager)<br>4. Lưu | Tạo tài khoản nhân viên, gửi thông tin đăng nhập | ✓ | PASS |
| **TC_OP_005** | Tạo voucher | Operator | 1. Vào "Voucher"<br>2. Tạo voucher với mã, % giảm giá, thời hạn<br>3. Lưu | Voucher có thể sử dụng khi đặt vé | ✓ | PASS |
| **TC_OP_006** | Xem doanh thu | Có booking | 1. Vào "Báo cáo"<br>2. Chọn khoảng thời gian | Hiển thị doanh thu, số vé bán, biểu đồ | ✓ | PASS |

---

### 2.7. MODULE QUẢN LÝ CHUYẾN (TRIP MANAGER)

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_TM_001** | Xem danh sách chuyến được phân | Đã đăng nhập | 1. Truy cập dashboard<br>2. Xem "Chuyến của tôi" | Hiển thị các chuyến được phân công | ✓ | PASS |
| **TC_TM_002** | Bắt đầu chuyến | Trước giờ khởi hành | 1. Click "Bắt đầu chuyến"<br>2. Xác nhận | Chuyến chuyển sang trạng thái "in_progress" | ✓ | PASS |
| **TC_TM_003** | Quét QR code vé | Chuyến đang chạy | 1. Click "Soát vé"<br>2. Quét QR code vé<br>3. Xác nhận | Vé chuyển sang "used", hiển thị thông tin hành khách | ✓ | PASS |
| **TC_TM_004** | Quét vé đã sử dụng | Vé đã quét | 1. Quét lại QR code vé cũ | Hiển thị cảnh báo "Vé đã được sử dụng" | ✓ | PASS |
| **TC_TM_005** | Quét vé không hợp lệ | QR code sai | 1. Quét QR không phải vé | Hiển thị lỗi "Mã QR không hợp lệ" | ✓ | PASS |
| **TC_TM_006** | Xem danh sách hành khách | Đang trong chuyến | 1. Click "Hành khách"<br>2. Xem danh sách | Hiển thị tất cả hành khách, trạng thái soát vé | ✓ | PASS |
| **TC_TM_007** | Kết thúc chuyến | Đã đến đích | 1. Click "Kết thúc chuyến"<br>2. Xác nhận | Chuyến chuyển sang "completed" | ✓ | PASS |

---

### 2.8. MODULE ADMIN

| ID | Chức năng | Điều kiện | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|----|-----------|-----------|-------------------|------------------|-----------------|------------|
| **TC_ADM_001** | Xem tổng quan hệ thống | Đăng nhập admin | 1. Vào dashboard | Hiển thị tổng số user, booking, doanh thu, biểu đồ | ✓ | PASS |
| **TC_ADM_002** | Duyệt nhà xe mới | Có operator đăng ký | 1. Vào "Nhà xe"<br>2. Xem danh sách pending<br>3. Click "Duyệt" | Nhà xe chuyển sang "active", có thể hoạt động | ✓ | PASS |
| **TC_ADM_003** | Khóa tài khoản nhà xe | Nhà xe vi phạm | 1. Vào chi tiết nhà xe<br>2. Click "Khóa"<br>3. Xác nhận | Nhà xe không thể đăng nhập, chuyến không hiển thị | ✓ | PASS |
| **TC_ADM_004** | Xử lý khiếu nại | Có khiếu nại mới | 1. Vào "Khiếu nại"<br>2. Xem chi tiết<br>3. Trả lời và cập nhật trạng thái | Khách hàng nhận thông báo, khiếu nại = resolved | ✓ | PASS |
| **TC_ADM_005** | Xem báo cáo doanh thu | Có giao dịch | 1. Vào "Báo cáo"<br>2. Chọn thời gian | Hiển thị doanh thu tổng, theo nhà xe, biểu đồ | ✓ | PASS |

---

## 3. TÓM TẮT KẾT QUẢ KIỂM THỬ

### 3.1. Thống kê theo module

| Module | Tổng TC | Pass | Fail | Pass Rate |
|--------|---------|------|------|-----------|
| Xác thực | 8 | 8 | 0 | 100% |
| Đặt vé | 8 | 8 | 0 | 100% |
| Thanh toán | 4 | 4 | 0 | 100% |
| Hủy vé | 5 | 5 | 0 | 100% |
| Tra cứu vé | 7 | 7 | 0 | 100% |
| Quản lý nhà xe | 6 | 6 | 0 | 100% |
| Quản lý chuyến | 7 | 7 | 0 | 100% |
| Admin | 5 | 5 | 0 | 100% |
| **TỔNG** | **50** | **50** | **0** | **100%** |

### 3.2. Các lỗi đã sửa trong quá trình phát triển

| Lỗi | Mô tả | Trạng thái |
|-----|-------|------------|
| **Bug #1** | Tra cứu vé bằng email bị lỗi 400 do backend chỉ hỗ trợ phone | ✅ Đã sửa |
| **Bug #2** | Nút hủy vé bị mất do logic kiểm tra 24 giờ sai | ✅ Đã sửa |
| **Bug #3** | OTP Redis sử dụng sai method `setEx` (camelCase) | ✅ Đã sửa |
| **Bug #4** | Hủy vé guest bị lỗi cast ObjectId do truyền bookingCode | ✅ Đã sửa |
| **Bug #5** | Hủy vé không nhả ghế do chỉ kiểm tra status=confirmed | ✅ Đã sửa |
| **Bug #6** | Trip manager đăng nhập bị 401 do storage key không khớp | ✅ Đã sửa |
| **Bug #7** | Email verification không khớp do booking có nhiều email fields | ✅ Đã sửa |

### 3.3. Các tính năng đã test thành công

✅ **Xác thực đa vai trò**: Customer, Operator, Admin, Trip Manager
✅ **Tìm kiếm và đặt vé**: Tìm chuyến, chọn ghế, áp voucher, thanh toán
✅ **Thanh toán VNPay**: Tích hợp payment gateway thành công
✅ **OTP qua Email/SMS**: Xác thực 2 bước cho guest
✅ **Tra cứu vé guest**: Không cần đăng nhập, xác thực bằng OTP
✅ **Hủy vé & hoàn tiền**: Logic chính sách 2 giờ, nhả ghế tự động
✅ **Quét QR code**: Soát vé trên xe bằng camera/scanner
✅ **Quản lý nhà xe**: CRUD tuyến đường, xe, chuyến, nhân viên, voucher
✅ **Admin dashboard**: Duyệt nhà xe, xử lý khiếu nại, báo cáo doanh thu

---

## 4. MÔI TRƯỜNG KIỂM THỬ

| Thông tin | Chi tiết |
|-----------|----------|
| **Hệ điều hành** | Windows 11, macOS Ventura |
| **Trình duyệt** | Chrome 120, Firefox 121, Safari 17 |
| **Thiết bị** | Desktop, Tablet (iPad), Mobile (iPhone 13, Samsung S22) |
| **Backend** | Node.js 20.16.0, Express.js |
| **Frontend** | React 18, Vite |
| **Database** | MongoDB 7.0 |
| **Cache** | Redis 7.0 |
| **Payment Gateway** | VNPay Sandbox |

---

## 5. GHI CHÚ VÀ ĐỀ XUẤT

### 5.1. Các điểm mạnh của hệ thống
- ✅ Hỗ trợ đa vai trò với phân quyền rõ ràng
- ✅ Xác thực OTP qua email/SMS cho guest user
- ✅ Logic hủy vé và hoàn tiền linh hoạt theo thời gian
- ✅ Tích hợp thanh toán VNPay hoàn chỉnh
- ✅ Real-time seat selection với WebSocket
- ✅ QR code cho soát vé trên xe
- ✅ Responsive design, mobile-friendly

### 5.2. Các điểm cần cải thiện (nếu có)
- ⚠️ Thêm unit test tự động cho backend services
- ⚠️ Thêm E2E testing với Cypress/Playwright
- ⚠️ Tối ưu performance cho tìm kiếm với database lớn
- ⚠️ Thêm rate limiting cho API OTP để tránh spam
- ⚠️ Backup dữ liệu tự động hàng ngày

---

## 6. KẾT LUẬN

Hệ thống **Vé Xe Nhanh** đã hoàn thành và test thành công **50/50 test cases (100% pass rate)**. Tất cả các chức năng chính hoạt động ổn định:

- ✅ Đăng ký, đăng nhập đa vai trò
- ✅ Tìm kiếm và đặt vé với thanh toán VNPay
- ✅ Tra cứu vé guest với OTP authentication
- ✅ Hủy vé và hoàn tiền theo chính sách
- ✅ Quản lý nhà xe (tuyến, xe, chuyến, nhân viên)
- ✅ Quản lý chuyến và soát vé bằng QR code
- ✅ Admin dashboard với báo cáo và duyệt nhà xe

Hệ thống sẵn sàng để triển khai production sau khi thực hiện các cải thiện về security và performance được đề xuất ở mục 5.2.

---

**Ngày hoàn thành test**: 03/12/2025
**Người thực hiện**: Development Team
**Phê duyệt**: Project Manager
