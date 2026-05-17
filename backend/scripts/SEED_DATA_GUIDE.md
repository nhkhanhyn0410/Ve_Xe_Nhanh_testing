# Hướng dẫn tạo Seed Data chuẩn xác (cho agent / dev)

> Mục tiêu: mọi seed data phải **trung thực với model thật** — chỉ điền field
> thực sự tồn tại trong schema Mongoose, ref trỏ đúng model đã đăng ký, mật
> khẩu để model tự hash. KHÔNG bịa field, KHÔNG dữ liệu mock trong code chạy.

## 1. Script chuẩn

| Script | Vai trò | Cách chạy |
|--------|---------|-----------|
| `backend/scripts/seedData.js` | **Nguồn seed chính thức** (User, BusOperator, Employee, Bus, Route, Trip, Voucher, Booking, Ticket, Complaint). Tự xoá sạch dữ liệu cũ trước khi seed. | `cd backend && npm run seed` |
| `backend/scripts/seedRoutesEmployees.js` | Bổ sung tuyến/nhân viên (chạy tay khi cần). | `node scripts/seedRoutesEmployees.js` |
| `backend/scripts/seedContent.js` | Seed Banner/Blog/FAQ (content). | `node scripts/seedContent.js` |
| `backend/scripts/ensureAdmin.js` | Đảm bảo có 1 admin. | `node scripts/ensureAdmin.js` |

> ⚠️ `clearData.js` hiện là **stub hỏng** (chỉ tạo 1 admin rồi dừng). Đừng
> dùng/đừng tham chiếu. Việc xoá dữ liệu đã nằm trong `seedData.js`.
>
> Khi thêm dữ liệu mới: **sửa `seedData.js`**, đừng tạo script seed song song.

## 2. Thứ tự tạo BẮT BUỘC (theo phụ thuộc ref)

Tạo theo đúng thứ tự này, dùng `_id` của doc trước làm ref cho doc sau:

```
User  →  BusOperator  →  Employee  →  Bus  →  Route  →  Trip  →  Voucher  →  Booking  →  Ticket  →  Complaint
```

- `Employee.operatorId`, `Bus.operatorId`, `Route.operatorId`, `Trip.operatorId` → `BusOperator._id`
- `Trip.routeId` → `Route._id`; `Trip.busId` → `Bus._id`
- `Booking.userId` → `User._id`; `Booking.tripId` → `Trip._id`; `Booking.operatorId` → `BusOperator._id`
- `Ticket.bookingId` → `Booking._id`
- `Complaint.userId` → `User._id`; `Complaint.operatorId` → `BusOperator._id`; `Complaint.bookingId` → `Booking._id`

Ref sai/trỏ tới doc chưa tạo → 500 `MissingSchemaError` hoặc populate rỗng.

## 3. Quy tắc bắt buộc (đã rút ra từ bug thực tế)

1. **KHÔNG tự hash mật khẩu.** Các model (User, Employee, BusOperator…) có
   `pre('save')` tự hash. Hash thủ công trong seed → bị hash 2 lần → không
   đăng nhập được. Truyền mật khẩu **plaintext**, để hook làm.

2. **Dùng `createWithHooks(Model, docs)` cho model có pre-save hook**
   (User, BusOperator, Employee, Complaint…). Hàm này `new Model(); .save()`
   từng doc nên hook chạy. **KHÔNG dùng `insertMany`** cho các model này
   (insertMany bỏ qua hook → mật khẩu/ticketNumber… không được sinh).

3. **Tên model đăng ký phải khớp `ref`.** Nhà xe đăng ký là **`BusOperator`**
   (KHÔNG phải `Operator`). Mọi `ref:` trong schema và mọi `.populate()` phải
   dùng đúng `'BusOperator'`. (Bug `ref: 'Operator'` từng gây 500 ở Complaint.)

4. **Enum role — không bịa giá trị:**
   - `User.role`: chỉ `'customer' | 'admin'`.
   - `Employee.role`: chỉ `'driver' | 'trip_manager'`.
   - Nhân viên chuyến/tài xế đăng nhập qua **Employee model** (`/employees/login`),
     phải seed vào collection `Employee`. KHÔNG hardcode tài khoản trong controller.

5. **Trip phải có ngày tương lai.** Dùng helper `daysFromNow(days, hours)` để
   tạo các chuyến +3/+7/+14/+30 ngày, nếu không UI sẽ không có chuyến để test.

6. **Toạ độ thật.** `Route.origin/destination/stops[].coordinates` phải có
   `{ lat, lng }` thật của VN (bản đồ Leaflet ở trip detail cần lat/lng thật;
   thiếu toạ độ sẽ rơi về sơ đồ SVG dự phòng).

7. **Chỉ field có trong schema.** Trước khi thêm field, mở `backend/src/models/<Model>.js`
   kiểm tra schema + `enum` + `required`. Field không có trong schema sẽ bị
   Mongoose loại bỏ âm thầm (dữ liệu trông "có" nhưng không lưu).

8. **Tiền tệ & số liệu hợp lý.** Giá VND số nguyên (vd 250000), `finalPrice`
   khớp logic Booking, `overallRating` 1–5, v.v. Không số liệu phi thực tế.

## 4. Khuôn mẫu thêm dữ liệu vào `seedData.js`

```js
// Tạo có chạy hook (model có password / pre-save):
const operators = await createWithHooks(BusOperator, [
  { companyName: 'Nhà xe ABC', email: 'abc@op.vn', phone: '0901111111',
    password: 'op123' /* plaintext, hook tự hash */, status: 'active' },
]);

// Tham chiếu doc đã tạo:
const trips = await Trip.create([
  { operatorId: operators[0]._id, routeId: routes[0]._id,
    busId: buses[0]._id, departureTime: daysFromNow(3, 7),
    /* …chỉ field có trong Trip schema… */ },
]);
```

## 5. Checklist trước khi coi là "xong"

- [ ] `cd backend && npm run seed` chạy hết, **không** lỗi schema/validation.
- [ ] Backend khởi động (`npm run dev`) không `MissingSchemaError`.
- [ ] Login admin được bằng tài khoản seed (xem log "SEED SUMMARY").
- [ ] Login Employee (`/employees/login`) bằng nhân viên seed → vào được dashboard.
- [ ] Trip detail có chuyến tương lai + bản đồ Leaflet hiện đúng (toạ độ thật).
- [ ] Không thêm field ngoài schema; không hash tay; ref khớp tên model thật.

## 6. Nguyên tắc vàng

> **Trung thực hơn là cho đủ.** Nếu một số liệu không có field thật để chứa,
> đừng bịa — bỏ đi hoặc seed đúng cái model hỗ trợ. Seed data là "sự thật"
> để cả hệ thống test dựa vào.
