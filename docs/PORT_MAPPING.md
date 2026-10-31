# TingRoster Port Mapping Architecture

Tài liệu quy định và đặc tả cấu trúc phân tách cổng (port separation) của toàn bộ hệ sinh thái TingRoster, hỗ trợ chạy độc lập từng dịch vụ và ánh xạ reverse proxy linh hoạt.

---

## 1. Bảng Phân Tách Cổng Tổng Thể

| Dịch vụ / Ứng dụng | Cổng Đề Xuất (Target Port) | Mục Đích Sử Dụng | Môi Trường Local URL | Production Subdomain |
| :--- | :--- | :--- | :--- | :--- |
| **Public Landing & Auth** | `3000` | Trang chủ giới thiệu, SEO, Đăng ký, Đăng nhập, Xác thực email | `http://localhost:3000` | `tingroster.vn`, `www.tingroster.vn` |
| **Platform Admin** | `4000` | Control Center quản trị toàn hệ thống (Users, Tenants, Sức khỏe hạ tầng, Email logs) | `http://localhost:4000` | `admin.tingroster.vn` |
| **Owner Portal** | `4001` | Quản trị cơ sở (Lớp học, CLB thể thao, Nhà trọ, Thu học phí, Đối soát) | `http://localhost:4001` | `owner.tingroster.vn`, `app.tingroster.vn` |
| **Student / Member Portal** | `4002` | Cổng hội viên, học sinh, người thuê trọ (Khoản nợ cá nhân, Lịch, Điểm danh) | `http://localhost:4002` | `member.tingroster.vn`, `student.tingroster.vn` |
| **Kiosk Tablet App** | `4003` | Màn hình tự phục vụ Full-screen cho máy tính bảng đặt tại cơ sở | `http://localhost:4003` | `kiosk.tingroster.vn` |
| **Backend API / Auth** | `4100` | Core API, Auth handlers, Nhận Webhook VietQR (SePay, Casso) | `http://localhost:4100` | `api.tingroster.vn` |
| **Database (PostgreSQL)** | `5433` (Host) -> `5432` (Docker) | Lưu trữ CSDL quan hệ chính | `localhost:5433` | Internal Docker Network |
| **Reverse Proxy (Nginx)** | `80` (HTTP), `443` (HTTPS) | Định tuyến theo Hostname vào các cổng nội bộ | `http://localhost:80` | Cổng internet công khai duy nhất |

---

## 2. Cách Khởi Chạy Từng Cổng Trong Môi Trường Phát Triển (Local Dev)

Mỗi service có thể khởi chạy độc lập thông qua script trong `package.json`:

```bash
# 1. Chạy Landing Page & Auth (Cổng 3000)
npm run dev:landing

# 2. Chạy Platform Admin Control Center (Cổng 4000)
npm run dev:admin

# 3. Chạy Owner Portal (Cổng 4001)
npm run dev:owner

# 4. Chạy Student / Member Portal (Cổng 4002)
npm run dev:member

# 5. Chạy Kiosk Mode (Cổng 4003)
npm run dev:kiosk

# 6. Chạy API Server (Cổng 4100)
npm run dev:api
```

---

## 3. Kiến Trúc Định Tuyến Thông Minh (Edge Middleware)

Next.js Middleware (`src/middleware.ts`) tự động nhận diện cả 2 phương thức:
1. **Dựa trên Cổng kết nối (Port-based):**
   - Truy cập vào cổng `4000` tự động chuyển tiếp tới `/admin`.
   - Truy cập vào cổng `4001` tự động chuyển tiếp tới `/dashboard`.
   - Truy cập vào cổng `4002` tự động chuyển tiếp tới `/portal`.
   - Truy cập vào cổng `4003` tự động chuyển tiếp tới `/kiosk`.
   - Truy cập vào cổng `4100` tự động phục vụ `/api/*`.
2. **Dựa trên Hostname (Subdomain-based):**
   - Host `admin.*` chuyển tiếp `/admin`.
   - Host `owner.*` hoặc `app.*` chuyển tiếp `/dashboard`.
   - Host `member.*` hoặc `student.*` chuyển tiếp `/portal`.
   - Host `kiosk.*` chuyển tiếp `/kiosk`.
   - Host `api.*` chuyển tiếp `/api/*`.

Điều này đảm bảo kiến trúc sẵn sàng 100% cho việc gắn Domain riêng biệt mà không cần cấu trúc lại mã nguồn.
