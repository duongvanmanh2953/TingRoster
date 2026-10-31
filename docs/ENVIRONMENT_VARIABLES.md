# TingRoster Environment Variables Dictionary

Tài liệu mô tả chi tiết tất cả các biến môi trường được sử dụng trong toàn bộ hệ thống TingRoster.

---

## 1. Cơ Sở Dữ Liệu & Bộ Nhớ (Database & Storage)

| Tên Biến | Ý Nghĩa & Mục Đích | Ví Dụ Giá Trị | Bắt Buộc? |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL theo chuẩn Prisma connection string | `postgresql://user:pass@host:5432/db?schema=public` | **Có** |
| `POSTGRES_USER` | Tên người dùng CSDL (dùng trong Docker Compose) | `tingroster` | Trong Docker |
| `POSTGRES_PASSWORD`| Mật khẩu CSDL (dùng trong Docker Compose) | `tingroster_secret_password` | Trong Docker |
| `POSTGRES_DB` | Tên CSDL chính | `tingroster` | Trong Docker |

---

## 2. Bảo Mật & Xác Thực (Security & Authentication)

| Tên Biến | Ý Nghĩa & Mục Đích | Ví Dụ Giá Trị | Bắt Buộc? |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Khóa bí mật dùng để ký và giải mã phiên JWT HTTP-only cookie (tối thiểu 32 ký tự ngẫu nhiên) | `openssl rand -hex 32` | **Có** |
| `SEPAY_WEBHOOK_API_KEY` | Khóa bí mật dùng để xác thực webhook gửi từ cổng SePay | `sepay_live_secret_key_xyz` | Khi dùng SePay |
| `CASSO_WEBHOOK_SECURE_TOKEN` | Khóa bí mật dùng để xác thực webhook gửi từ cổng Casso | `casso_live_token_123` | Khi dùng Casso |

---

## 3. Định Tuyến Ứng Dụng & Tên Miền (Application URLs & Domains)

| Tên Biến | Ý Nghĩa & Mục Đích | Ví Dụ Local | Ví Dụ Production |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Địa chỉ gốc của Landing & Public Auth | `http://localhost:3000` | `https://tingroster.vn` |
| `NEXT_PUBLIC_ADMIN_URL` | Địa chỉ của Platform Admin Console | `http://localhost:4000` | `https://admin.tingroster.vn` |
| `NEXT_PUBLIC_OWNER_URL` | Địa chỉ của Owner Portal | `http://localhost:4001` | `https://owner.tingroster.vn` |
| `NEXT_PUBLIC_MEMBER_URL` | Địa chỉ của Student / Member Portal | `http://localhost:4002` | `https://member.tingroster.vn` |
| `NEXT_PUBLIC_KIOSK_URL` | Địa chỉ của Kiosk Tablet Scanner | `http://localhost:4003` | `https://kiosk.tingroster.vn` |
| `NEXT_PUBLIC_API_URL` | Địa chỉ của Backend API Gateway | `http://localhost:4100` | `https://api.tingroster.vn` |

---

## 4. Dịch Vụ Gửi Email (SMTP & Notifications)

| Tên Biến | Ý Nghĩa & Mục Đích | Ví Dụ Giá Trị |
| :--- | :--- | :--- |
| `SMTP_HOST` | Địa chỉ máy chủ SMTP (hoặc Mailpit khi test local) | `smtp.gmail.com` hoặc `localhost` |
| `SMTP_PORT` | Cổng SMTP (`587` cho STARTTLS, `465` cho SSL, `1025` cho Mailpit) | `587` |
| `SMTP_USER` | Tên đăng nhập SMTP hoặc API Key | `notifications@tingroster.vn` |
| `SMTP_PASS` | Mật khẩu ứng dụng hoặc Secret Key SMTP | `app_password_secret` |
| `SMTP_SECURE` | Sử dụng TLS/SSL trực tiếp (`true` cho port 465, `false` cho 587) | `false` |
| `SMTP_FROM` | Tên và địa chỉ hiển thị của người gửi | `TingRoster <no-reply@tingroster.vn>` |

---

## 5. Cấu Hình Tài Khoản Ngân Hàng Mặc Định (VietQR Fallback)

| Tên Biến | Ý Nghĩa & Mục Đích | Ví Dụ Giá Trị |
| :--- | :--- | :--- |
| `DEFAULT_BANK_ID` | Mã ngân hàng Napas mặc định (MB, VCB, TCB, ACB, VPB,...) | `MB` |
| `DEFAULT_BANK_ACCOUNT_NO` | Số tài khoản ngân hàng thụ hưởng | `0987654321` |
| `DEFAULT_BANK_ACCOUNT_NAME`| Tên chủ tài khoản không dấu | `NGUYEN VAN A` |
