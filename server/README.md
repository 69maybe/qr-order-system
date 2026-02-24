# QR Order System API

Backend Node.js/Express phục vụ ứng dụng đặt món QR. Hỗ trợ xác thực JWT, quản lý menu, bàn ăn và đơn hàng dựa trên schema MySQL có sẵn.

## 1. Chuẩn bị môi trường

```bash
cd server
cp env.sample .env   # tạo và cập nhật thông tin kết nối DB + JWT_SECRET
npm install
```

Các biến `.env` cần thiết:

| Biến | Mô tả |
| --- | --- |
| `PORT` | Cổng server (mặc định `5000`) |
| `JWT_SECRET` | Khóa ký JWT |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Thông tin MySQL |
| `CORS_ORIGIN` | Danh sách domain (phân tách bằng dấu phẩy) được phép gọi API |

## 2. Chạy server

```bash
npm run dev   # nodemon
npm start     # chạy production
```

## 3. Các nhóm API chính

| Phương thức & URL | Mô tả | Bảo vệ |
| --- | --- | --- |
| `POST /api/auth/login` | Đăng nhập, trả về JWT | Công khai |
| `GET /api/auth/me` | Lấy thông tin người dùng từ JWT | Yêu cầu JWT |
| `GET /api/menu` | Danh sách món ăn | Công khai |
| `POST/PUT/DELETE /api/menu` | CRUD món ăn | Chỉ `admin` |
| `GET /api/tables` | Danh sách bàn | `admin` hoặc `staff` |
| `POST/PUT/DELETE /api/tables` | Quản lý bàn | Chỉ `admin` |
| `GET /api/orders` | Danh sách đơn + chi tiết | `admin` hoặc `staff` |
| `POST /api/orders` | Khách tạo đơn (theo QR) | Công khai |
| `PATCH /api/orders/:id/status` | Cập nhật trạng thái | `admin` hoặc `staff` |
| `PATCH /api/orders/:id/payment` | Đánh dấu thanh toán | `admin` hoặc `staff` |

## 4. Mapping vai trò

- Bảng `nguoi_dung.vai_tro` sử dụng `admin` và `nhanvien`.
- Khi đăng nhập, API sẽ chuẩn hóa `nhanvien` thành `staff` để khớp với frontend React hiện tại.

## 5. Health check

`GET /health` trả về `{ status: "ok" }` để tiện cấu hình load balancer hoặc monitoring.

