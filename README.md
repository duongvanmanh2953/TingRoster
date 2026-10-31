# TingRoster — Nền Tảng Điểm Danh & Tự Động Đối Soát Thu Phí Bằng VietQR

> "Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo."

**TingRoster** là nền tảng SaaS hiệu suất cao dành cho **Giáo viên dạy thêm**, **Chủ câu lạc bộ thể thao (Cầu lông, Pickleball, Bóng đá)** và **Chủ nhà trọ / căn hộ dịch vụ mini**. Hệ thống tự động tạo mã động VietQR theo chuẩn QuickLink Napas 247, tích hợp Webhook ngân hàng (SePay, Casso) để gạch nợ tức thì theo cơ chế lũy đẳng và giao dịch nguyên tử, không lưu ký tiền (Zero-Custody) và đối soát hoàn toàn tự động.

---

## 🚀 Tính Năng Cốt Lõi

1. **Điểm Danh Một Chạm (Daily Roster Matrix):** Giao diện ma trận tối ưu chạm, tự động tính học phí theo buổi hoặc trọn gói chu kỳ tháng.
2. **VietQR Động Định Danh:** Tự động sinh mã thanh toán ngẫu nhiên bảo mật kèm nội dung và số tiền chính xác từng học viên/hội viên.
3. **Reconciliation Engine Lũy Đẳng:** Xử lý Webhook ngân hàng bằng `prisma.$transaction`, chống trùng lặp giao dịch và tự động phân loại: `UNPAID`, `PARTIAL`, `PAID`, `OVERPAID`.
4. **Hệ Thống Người Dùng Thật (Real Authentication):**
   - Đăng ký tài khoản thực tế bằng email.
   - Xác thực email bắt buộc qua liên kết một lần (24h token).
   - Đăng nhập an toàn bằng mật khẩu băm (bcrypt) & JWT HTTP-only Cookie.
   - Quên mật khẩu, đặt lại mật khẩu với cơ chế chống rò rỉ danh tính (Anti-Enumeration).
   - Kiểm toán phát thư điện tử (`EmailDeliveryLog`).
5. **Platform Admin Control Center:** Quản trị toàn bộ tài khoản, khóa/mở khóa, gửi lại link xác thực, giám sát cổng thanh toán và theo dõi email logs.
6. **Kiến Trúc Phân Tách Cổng & Đa Tên Miền (Multi-Service Port Architecture):** Hỗ trợ tách biệt Landing (3000), Admin (4000), Owner (4001), Member (4002), Kiosk (4003), API (4100) và định tuyến qua Nginx Reverse Proxy.

---

## 🏛️ Kiến Trúc Phân Tách Cổng (Port Mapping)

| Dịch Vụ | Cổng (Port) | Đường Dẫn Local | Subdomain Production | Mục Đích |
| :--- | :--- | :--- | :--- | :--- |
| **Landing & Auth** | `3000` | `http://localhost:3000` | `tingroster.vn` | Giới thiệu, Đăng ký, Đăng nhập, Xác thực email |
| **Platform Admin** | `4000` | `http://localhost:4000` | `admin.tingroster.vn` | Trung tâm điều hành toàn hệ thống |
| **Owner Portal** | `4001` | `http://localhost:4001` | `owner.tingroster.vn` | Quản lý lớp học, sân thể thao, thu học phí |
| **Member Portal** | `4002` | `http://localhost:4002` | `member.tingroster.vn` | Cổng học viên xem công nợ cá nhân |
| **Kiosk Tablet** | `4003` | `http://localhost:4003` | `kiosk.tingroster.vn` | Màn hình tự phục vụ cho máy tính bảng |
| **Backend API** | `4100` | `http://localhost:4100` | `api.tingroster.vn` | API chung & Webhook ngân hàng |
| **PostgreSQL** | `5433` (Host) | `localhost:5433` | Internal Network | CSDL PostgreSQL 16 |

Chi tiết tại [Tài liệu Phân Tách Cổng](file:///home/duong/Downloads/TingRoster/docs/PORT_MAPPING.md) và [Tài liệu Gán Tên Miền](file:///home/duong/Downloads/TingRoster/docs/DOMAIN_MAPPING.md).

---

## 🐳 Triển Khai Nhanh Bằng Docker Compose

### 1. Khởi động Cụm Đa Dịch Vụ (Multi-Service Production)
```bash
docker compose -f docker-compose.multi.yml up -d --build
```

### 2. Thiết lập CSDL & Khởi tạo Super Admin
```bash
# Đồng bộ CSDL
docker compose -f docker-compose.multi.yml exec app-admin npx prisma db push

# Khởi tạo Super Admin đầu tiên (nhập email & mật khẩu bảo mật)
docker compose -f docker-compose.multi.yml exec app-admin npx tsx scripts/bootstrap-admin.ts
```

---

## 💻 Hướng Dẫn Chạy Môi Trường Phát Triển (Local Dev)

### 1. Cài đặt Thư Viện
```bash
npm install
```

### 2. Cấu Hình Biến Môi Trường
```bash
cp .env.example .env
```

### 3. Khởi Động PostgreSQL
```bash
docker compose up -d postgres
npm run db:push
```

### 4. Khởi Tạo Tài Khoản Super Admin Đầu Tiên
Hệ thống **không có mật khẩu mặc định** và **không có tài khoản demo**. Chạy lệnh bootstrap an toàn:
```bash
npm run bootstrap:admin
```

### 5. Khởi Chạy Ứng Dụng
```bash
# Chạy Landing Page & Auth trên cổng 3000
npm run dev:landing

# Hoặc chạy Platform Admin độc lập trên cổng 4000
npm run dev:admin

# Hoặc chạy Owner Portal trên cổng 4001
npm run dev:owner

# Hoặc chạy Student/Member Portal trên cổng 4002
npm run dev:member

# Hoặc chạy Kiosk Mode trên cổng 4003
npm run dev:kiosk
```

---

## 🧪 Kiểm Thử Tự Động (Testing & Quality Assurance)

```bash
# Chạy toàn bộ 101 unit tests
npm test

# Kiểm tra kiểu dữ liệu TypeScript nghiêm ngặt (Zero errors)
npm run typecheck

# Kiểm tra quy trình dọn dẹp dữ liệu an toàn
npm run db:clean
```

---

## 📚 Bộ Tài Liệu Kỹ Thuật (Documentation Suite)

- [Kiến Trúc Toàn Diện (ARCHITECTURE.md)](file:///home/duong/Downloads/TingRoster/docs/ARCHITECTURE.md)
- [Hướng Dẫn Triển Khai (DEPLOYMENT.md)](file:///home/duong/Downloads/TingRoster/docs/DEPLOYMENT.md)
- [Đặc Tả Xác Thực & Phân Quyền (AUTHENTICATION.md)](file:///home/duong/Downloads/TingRoster/docs/AUTHENTICATION.md)
- [Quy Trình Reset CSDL An Toàn (DATABASE_RESET.md)](file:///home/duong/Downloads/TingRoster/docs/DATABASE_RESET.md)
- [Bảng Biến Môi Trường (ENVIRONMENT_VARIABLES.md)](file:///home/duong/Downloads/TingRoster/docs/ENVIRONMENT_VARIABLES.md)
- [Phân Tách Cổng Dịch Vụ (PORT_MAPPING.md)](file:///home/duong/Downloads/TingRoster/docs/PORT_MAPPING.md)
- [Gán Tên Miền & Reverse Proxy (DOMAIN_MAPPING.md)](file:///home/duong/Downloads/TingRoster/docs/DOMAIN_MAPPING.md)
- [Vận Hành Docker (DOCKER_SETUP.md)](file:///home/duong/Downloads/TingRoster/docs/DOCKER_SETUP.md)
