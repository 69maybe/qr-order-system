# QR Order System

Hệ thống đặt món qua QR code: khách quét QR tại bàn → xem menu, đặt món → nhân viên/quản lý xử lý đơn và thống kê.

## Tính năng

- **Khách hàng:** Quét QR theo bàn → xem menu, thêm món vào giỏ, gửi đơn (không cần đăng nhập).
- **Nhân viên:** Đăng nhập → xem danh sách đơn, cập nhật trạng thái (chờ xử lý / đang chuẩn bị / đã phục vụ), thanh toán.
- **Admin:** Quản lý món ăn (thêm/sửa/xóa, ảnh, loại món), quản lý bàn (thêm/sửa, tạo QR), xem thống kê doanh thu.

## Công nghệ

| Phần | Stack |
|------|--------|
| Frontend | React 18, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express 5 |
| Database | MySQL |
| Auth | JWT (httpOnly cookie / Bearer) |
| Upload ảnh | Multer |
| QR code | qrcode |

## Cấu trúc project

```
qr-order-system/
├── client/                 # Frontend React (Vite)
│   ├── src/
│   │   ├── components/     # Customer, Staff, Admin components
│   │   ├── contexts/       # AuthContext
│   │   ├── pages/          # CustomerOrdering, StaffDashboard, AdminDashboard...
│   │   └── services/       # api.js
│   └── package.json
├── server/                 # Backend Express
│   ├── src/
│   │   ├── config/         # db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/         # auth, menu, tables, orders
│   │   └── server.js
│   ├── uploads/            # Ảnh món, QR (tạo khi chạy)
│   └── package.json
├── database/
│   └── qr_order_system.sql # Schema + dữ liệu mẫu
├── DEPLOY.md               # Hướng dẫn deploy (GitHub + Railway, VPS)
└── README.md
```

## Yêu cầu

- Node.js 18+
- MySQL 8 (hoặc tương thích)
- npm hoặc yarn

## Chạy local

### 1. Clone và cài dependency

```bash
git clone https://github.com/TEN_USER/qr-order-system.git
cd qr-order-system
```

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Database

Tạo database và import file SQL:

```bash
mysql -u root -p -e "CREATE DATABASE qr_order_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p qr_order_system < database/qr_order_system.sql
```

Hoặc dùng phpMyAdmin / MySQL Workbench: tạo database `qr_order_system`, sau đó chạy nội dung file `database/qr_order_system.sql`.

### 3. Cấu hình Backend

Tạo file `server/.env` (copy từ `server/.env.example` rồi sửa):

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=chuoi_bi_mat_bat_ky
JWT_EXPIRES_IN=12h

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql
DB_NAME=qr_order_system

CORS_ORIGIN=http://localhost:3000
```

### 4. Chạy Backend

```bash
cd server
npm run dev
```

API chạy tại: **http://localhost:5000**  
Kiểm tra: http://localhost:5000/health

### 5. Chạy Frontend

Mở terminal mới:

```bash
cd client
npm run dev
```

Trang web: **http://localhost:3000**

- **Khách đặt món:** http://localhost:3000/order/1 (số là `tableId`, ví dụ bàn 1).
- **Nhân viên:** http://localhost:3000/staff/login  
- **Admin:** http://localhost:3000/admin/dashboard (đăng nhập bằng tài khoản admin).

Tài khoản mẫu (sau khi import SQL): xem trong database bảng `nguoi_dung` (admin / nhanvien).

## Biến môi trường

### Backend (`server/.env`)

| Biến | Mô tả |
|------|--------|
| `PORT` | Cổng chạy API (mặc định 5000) |
| `NODE_ENV` | `development` / `production` |
| `JWT_SECRET` | Chuỗi bí mật ký JWT |
| `JWT_EXPIRES_IN` | Thời hạn token (vd: 12h) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Kết nối MySQL |
| `CORS_ORIGIN` | URL frontend (nhiều URL cách nhau bằng dấu phẩy) |

### Frontend (khi build production)

Tạo `client/.env.production` (xem `client/.env.production.example`):

| Biến | Mô tả |
|------|--------|
| `VITE_API_BASE_URL` | URL API (vd: https://api.example.com) |

## Deploy

Xem hướng dẫn chi tiết trong **[DEPLOY.md](./DEPLOY.md)**:

- **Cách 1:** Đẩy code lên GitHub → deploy Backend + Frontend + MySQL trên **Railway**.
- **Cách 2:** Deploy trên **VPS** (Nginx + PM2).

## API chính

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Đăng nhập (nhân viên/admin) |
| GET | `/api/auth/me` | Thông tin user đang đăng nhập |
| GET | `/api/menu` | Danh sách món (active) |
| POST | `/api/orders` | Tạo đơn (khách) |
| GET | `/api/orders` | Danh sách đơn (staff/admin) |
| PATCH | `/api/orders/:id/status` | Cập nhật trạng thái đơn |
| GET | `/api/tables` | Danh sách bàn (admin) |
| GET | `/api/orders/revenue/statistics` | Thống kê doanh thu (admin) |

## License

ISC
