# Hướng dẫn deploy QR Order System từng bước

Project gồm: **Backend Node/Express** (`server/`) + **Frontend React/Vite** (`client/`) + **MySQL**.

---

# Cách 1: Up GitHub rồi deploy trên Railway

Cách này: **đẩy code lên GitHub** → **Railway** kéo code và deploy (Backend + MySQL + Frontend).

---

## Bước 1: Đẩy code lên GitHub

1. Tạo repo mới trên GitHub (https://github.com/new), không tick "Add a README".
2. Trên máy, mở terminal tại thư mục project và chạy:

```bash
cd c:\Users\huyab\Desktop\qr-order-system
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TEN_USER/TEN_REPO.git
git push -u origin main
```

(Thay `TEN_USER` và `TEN_REPO` bằng username GitHub và tên repo của bạn.)

**Lưu ý:** Nên có file `.gitignore` để không đẩy `node_modules`, `.env`. Nếu chưa có thì tạo:

- `.gitignore` (ở thư mục gốc) nên có: `node_modules/`, `server/.env`, `client/.env`, `client/.env.production`, `.env`, `server/uploads/` (nếu không muốn đẩy ảnh lên Git).

---

## Bước 2: Tạo project trên Railway

1. Vào https://railway.app → đăng nhập (GitHub).
2. **New Project** → **Deploy from GitHub repo** → chọn repo `qr-order-system`.
3. Railway sẽ tạo 1 service từ repo. Ta sẽ tách thành **3 service**: MySQL, Backend, Frontend.

---

## Bước 3: Thêm MySQL và import database

1. Trong project Railway: **+ New** → **Database** → chọn **MySQL**.
2. Sau khi MySQL được tạo, bấm vào service MySQL → tab **Variables** (hoặc **Connect**) → ghi lại hoặc copy các biến: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.
3. Kết nối vào MySQL để import schema (Railway có **Connect** gợi ý dùng MySQL client):
   - Dùng **TCP Proxy** (bật trong tab MySQL) rồi kết nối từ máy bằng MySQL Workbench / DBeaver / hoặc `mysql -h ... -P ... -u ... -p`.
   - Hoặc dùng **Railway CLI**: `railway connect MySQL` (nếu đã cài CLI).
4. Tạo database (thường Railway đã tạo sẵn một database, tên trong `MYSQLDATABASE`). Chạy nội dung file **`database/qr_order_system.sql`** (tạo bảng + dữ liệu mẫu).

---

## Bước 4: Cấu hình service Backend (API)

1. Trong project Railway, bấm vào **service đầu tiên** (service được tạo khi "Deploy from GitHub") — đây sẽ là Backend.
2. Vào **Settings**:
   - **Root Directory**: đặt `server` (Railway chỉ build/chạy từ thư mục `server`).
   - **Build Command**: `npm install` hoặc để trống (Railway tự chạy `npm install`).
   - **Start Command**: `npm start` hoặc `node src/server.js`.
3. Vào **Variables** → **Add variables** (hoặc **Raw Editor**), thêm:

| Biến | Giá trị (ví dụ) |
|------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | Railway tự gán, có thể để trống |
| `JWT_SECRET` | một chuỗi bí mật mạnh (tự đặt) |
| `JWT_EXPIRES_IN` | `12h` |
| `DB_HOST` | giá trị `MYSQLHOST` của service MySQL |
| `DB_PORT` | giá trị `MYSQLPORT` |
| `DB_USER` | giá trị `MYSQLUSER` |
| `DB_PASSWORD` | giá trị `MYSQLPASSWORD` |
| `DB_NAME` | giá trị `MYSQLDATABASE` (hoặc `qr_order_system` nếu bạn đã import vào DB đó) |
| `CORS_ORIGIN` | URL frontend (sẽ có sau Bước 6, ví dụ `https://xxx.up.railway.app`) |

**Mẹo:** Trong Railway có thể **reference biến service khác**: chọn "Add Variable" → có tùy chọn lấy từ service MySQL (Reference), khi đó có thể dùng luôn `MYSQLHOST`, `MYSQLUSER`, ... Backend đã hỗ trợ cả hai: `DB_*` và `MYSQL*`.

4. **Deploy:** Railway sẽ tự deploy lại khi bạn đổi Settings/Variables. Hoặc **Deploy** → **Redeploy**.
5. Sau khi deploy xong: **Settings** → **Generate Domain** (hoặc **Networking** → **Generate domain**) để có URL dạng `https://xxx.up.railway.app`. Copy URL này — đây là **URL API** (dùng cho frontend và cho `CORS_ORIGIN`).

---

## Bước 5: Cấu hình service Frontend

1. Trong cùng project Railway: **+ New** → **GitHub Repo** → chọn lại đúng repo `qr-order-system` (tạo service thứ 2).
2. Bấm vào service Frontend vừa tạo → **Settings**:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (sẽ chạy `serve dist -s`).
3. **Variables** → thêm biến build-time cho Vite:
   - `VITE_API_BASE_URL` = URL API Backend (ví dụ `https://xxx.up.railway.app` từ Bước 4).
4. **Generate Domain** để có URL frontend (ví dụ `https://yyy.up.railway.app`).
5. Quay lại service **Backend** → **Variables** → sửa `CORS_ORIGIN` = URL frontend vừa tạo (ví dụ `https://yyy.up.railway.app`), rồi **Redeploy** Backend.

---

## Bước 6: Kiểm tra

- Mở URL **Frontend** (yyy.up.railway.app) → đăng nhập, xem menu, đặt món.
- Mở URL **Backend** + `/health` (ví dụ `https://xxx.up.railway.app/health`) → phải trả về `{"status":"ok",...}`.

**Upload ảnh / QR:** Backend đang lưu file vào `server/uploads/`. Trên Railway mỗi lần redeploy có thể mất file (ephemeral disk). Nếu cần giữ ảnh lâu dài, sau này có thể chuyển sang lưu file lên S3/R2 hoặc dùng Volume (Railway có Persistent Volumes).

---

## Tóm tắt nhanh (GitHub + Railway)

| Bước | Việc |
|------|------|
| 1 | Push code lên GitHub (có `.gitignore` cho `node_modules`, `.env`) |
| 2 | Railway: New Project → Deploy from GitHub repo |
| 3 | Thêm MySQL → import `database/qr_order_system.sql` |
| 4 | Backend: Root = `server`, Start = `npm start`, set Variables (DB, JWT, CORS) → Generate Domain |
| 5 | Frontend: New service từ cùng repo, Root = `client`, Build = `npm install && npm run build`, Start = `npm start`, set `VITE_API_BASE_URL` = URL Backend → Generate Domain |
| 6 | Sửa Backend `CORS_ORIGIN` = URL Frontend → Redeploy Backend |

---

# Cách 2: Deploy trên VPS (Nginx + PM2)

---

## Phần 1: Chuẩn bị trên máy (trước khi lên server)

### Bước 1.1: Có sẵn MySQL (local hoặc trên cloud)

- Nếu dùng **MySQL trên server**: bỏ qua bước này khi đã cài MySQL trên server.
- Nếu dùng **MySQL managed** (PlanetScale, DigitalOcean, Aiven…): tạo database, ghi lại:
  - Host
  - Port (thường 3306)
  - User
  - Password
  - Tên database: `qr_order_system`

### Bước 1.2: Import database

1. Tạo database (nếu chưa có):

```sql
CREATE DATABASE qr_order_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import file SQL (thay `user` và `qr_order_system` nếu khác):

```bash
mysql -u user -p qr_order_system < database/qr_order_system.sql
```

Hoặc dùng phpMyAdmin / MySQL Workbench: mở file `database/qr_order_system.sql` và chạy.

### Bước 1.3: File cấu hình Backend (server)

Trong thư mục `server/` tạo file `.env` (production) với nội dung tương tự:

```env
PORT=5000
NODE_ENV=production

JWT_SECRET=thay_bang_chuoi_bi_mat_manh_ngau_nhien
JWT_EXPIRES_IN=12h

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=qr_order_system

# URL frontend (khi deploy thật, thay bằng domain của bạn)
# Nhiều domain cách nhau bằng dấu phẩy
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

- **JWT_SECRET**: đổi thành chuỗi dài, ngẫu nhiên (không dùng bí mật mặc định).
- **DB_***: điền đúng thông tin MySQL.
- **CORS_ORIGIN**: khi có domain thật, thay bằng URL frontend (có thể nhiều URL, cách nhau bằng dấu phẩy).

---

## Phần 2: Deploy Backend lên server (VPS Linux)

Giả sử bạn đã có VPS (Ubuntu/Debian), SSH vào được.

### Bước 2.1: Cài Node.js (nếu chưa có)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

### Bước 2.2: Đưa code lên server

Cách 1 – Git (khuyến nghị):

```bash
cd /var/www
sudo mkdir -p qr-order-system
sudo chown $USER:$USER qr-order-system
cd qr-order-system
git clone https://github.com/username/qr-order-system.git .
```

Cách 2 – Upload bằng SFTP/SCP: upload toàn bộ thư mục project vào ví dụ `/var/www/qr-order-system`.

### Bước 2.3: Cấu hình Backend trên server

```bash
cd /var/www/qr-order-system/server
cp .env .env.backup
nano .env
```

Sửa `.env` đúng với MySQL và domain (PORT, JWT_SECRET, DB_*, CORS_ORIGIN) như Bước 1.3.

### Bước 2.4: Cài dependency và chạy thử

```bash
cd /var/www/qr-order-system/server
npm ci
node src/server.js
```

Nếu chạy không lỗi, gõ Ctrl+C để dừng. Kiểm tra API:

```bash
curl http://localhost:5000/health
```

Phải trả về JSON dạng `{"status":"ok",...}`.

### Bước 2.5: Chạy Backend bằng PM2 (để chạy nền, tự khởi động lại)

```bash
sudo npm install -g pm2
cd /var/www/qr-order-system/server
pm2 start src/server.js --name qr-order-api
pm2 save
pm2 startup
```

Sau đó:

- `pm2 list`   → xem process
- `pm2 logs qr-order-api` → xem log
- `pm2 restart qr-order-api` → khởi động lại

---

## Phần 3: Build và deploy Frontend

### Bước 3.1: Cấu hình URL API cho Frontend

Trước khi build, cần set **đúng URL backend** để frontend gọi API.

Tạo file `client/.env.production` (trong máy bạn hoặc trên server):

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

- Nếu API và web cùng domain (Nginx proxy): có thể dùng `https://your-domain.com` rồi proxy `/api` về backend (xem Phần 4).
- **api.your-domain.com**: thay bằng domain thật trỏ đến backend (hoặc IP:PORT tạm thời khi test).

### Bước 3.2: Build Frontend

Trên máy có Node (máy bạn hoặc trên server):

```bash
cd client
npm ci
npm run build
```

Sau khi build xong sẽ có thư mục `client/dist/`.

### Bước 3.3: Đưa bản build lên server

- Nếu build trên máy: upload thư mục `client/dist/` lên server (ví dụ `/var/www/qr-order-system/client/dist`).
- Nếu build trên server: `client/dist/` đã nằm trong project, chỉ cần cấu hình Nginx trỏ vào thư mục này (Bước 4.2).

---

## Phần 4: Cấu hình Nginx (trên VPS)

Giả sử domain của bạn là `your-domain.com`, API dùng `api.your-domain.com` (hoặc cùng domain).

### Bước 4.1: Cài Nginx (nếu chưa có)

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
```

### Bước 4.2: Site Frontend (trang chủ)

Tạo file cấu hình:

```bash
sudo nano /etc/nginx/sites-available/qr-order-frontend
```

Nội dung (thay `your-domain.com` và đường dẫn `dist`):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/qr-order-system/client/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Bật site:

```bash
sudo ln -s /etc/nginx/sites-available/qr-order-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 4.3: Site Backend (API)

Tạo file:

```bash
sudo nano /etc/nginx/sites-available/qr-order-api
```

Nội dung (thay `api.your-domain.com`):

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Bật site:

```bash
sudo ln -s /etc/nginx/sites-available/qr-order-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 4.4: HTTPS (SSL) với Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

Làm theo hướng dẫn. Certbot sẽ tự sửa Nginx để dùng HTTPS.

Sau khi có HTTPS, nhớ cập nhật:

- **Backend `.env`**: `CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com`
- **Frontend `client/.env.production`**: `VITE_API_BASE_URL=https://api.your-domain.com`
- Build lại frontend (`npm run build`) rồi copy lại `client/dist` lên server (nếu cần).

---

## Phần 5: Upload ảnh và QR (thư mục uploads)

Backend phục vụ file tĩnh từ `server/uploads/`. Cần đảm bảo:

1. Thư mục tồn tại trên server: `server/uploads` (và có thể có `uploads/menu`, `uploads/qrcodes` tùy code).
2. Khi deploy lại (git pull / upload code mới), **không ghi đè** thư mục `uploads` (hoặc backup/restore sau khi deploy).

Nếu dùng Git, có thể thêm `server/uploads/` vào `.gitignore` và chỉ tạo thư mục trống hoặc copy uploads từ backup khi deploy.

---

## Tóm tắt thứ tự làm

| Bước | Việc |
|------|------|
| 1 | Tạo DB, import `database/qr_order_system.sql` |
| 2 | Cấu hình `server/.env` (DB, JWT, CORS) |
| 3 | Trên server: cài Node, đưa code lên, chạy backend bằng PM2 |
| 4 | Tạo `client/.env.production` với `VITE_API_BASE_URL` |
| 5 | Build frontend: `cd client && npm ci && npm run build` |
| 6 | Cấu hình Nginx (frontend + API), bật HTTPS |
| 7 | Kiểm tra: mở trang web, đăng nhập, gọi API |

Nếu bạn cho biết bạn đang dùng **VPS** hay **hosting shared / PaaS** (Render, Railway, Vercel…), có thể làm thêm bản hướng dẫn rút gọn theo đúng nền tảng đó.
