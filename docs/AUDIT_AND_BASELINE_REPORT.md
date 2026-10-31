# BÁO CÁO KHẢO SÁT VÀ CHUẨN HÓA KIẾN TRÚC TINGROSTER (PRE-TRANSFORMATION AUDIT)

**Thời gian lập báo cáo:** 31/10/2026  
**Dự án:** TingRoster Core Platform  
**Trạng thái:** Hoàn tất khảo sát toàn diện codebase, database, authentication, UI & hạ tầng.

---

## 1. Kết Quả Khảo Sát Codebase & Hạ Tầng Hiện Tại

### 1.1. Công nghệ & Thư viện
- **Framework:** Next.js 14.2.15 (App Router, React 18.3.1, TypeScript 5.6.3 Strict Mode).
- **Styling:** Tailwind CSS 3.4.14, CSS Custom Variables, Vanilla CSS trong `globals.css`.
- **Database & ORM:** PostgreSQL 16 (chạy trên Docker container `tingroster-db`, port 5433 nội bộ), Prisma ORM 5.21.1.
- **Xác thực:** JWT HttpOnly cookie (`tingroster_session`), bcryptjs.
- **Icon:** Lucide React (`lucide-react` 0.453.0).
- **Kiểm thử:** Vitest (14 test suites, 101 unit/integration tests đang pass 100%).
- **Trạng thái Typecheck:** `tsc --noEmit` exit 0 (không có lỗi kiểu dữ liệu).

### 1.2. Thống kê Database & Dữ liệu Demo Hiện Có
- **Tài khoản người dùng (User):** 12 tài khoản, trong đó có:
  - `demo@tingroster.vn` (Role ADMIN, mật khẩu hardcoded `123456`).
  - `hocvien@tingroster.vn` (Demo học viên).
  - 10 tài khoản test sinh ra từ unit tests (`test_action_qr_*`, `chat_*`).
- **Không gian (Group/Workspace):** 11 nhóm (Lớp Toán 12A, CLB Cầu Lông, các space test).
- **Hội viên/Thành viên (Member):** 18 thành viên.
- **Hóa đơn (Invoice):** 4 hóa đơn demo.
- **Giao dịch đối soát & phân bổ:** Dữ liệu seed trong `prisma/seed.ts`.

### 1.3. Điểm yếu & Rủi ro Kiến trúc Cần Khắc Phục
1. **Dữ liệu giả & Nút Demo:** 
   - `LoginPage.tsx` có hardcoded email `demo@tingroster.vn`, nút "Vào Demo", phân quyền dựa vào `email.includes('admin')` hoặc `email.includes('hocvien')`.
   - `HomePage.tsx` gắn nút "Vào Demo" cho hầu hết các CTA chính, bypass luồng đăng ký thực.
2. **Xác thực chưa hoàn chỉnh:**
   - Chưa có trường `isEmailVerified`, `emailVerificationToken`, `resetPasswordToken` trong User model.
   - Chưa có trang `/verify-email`, `/forgot-password`, `/reset-password`.
   - Chưa có Mail Service gửi email xác thực và đặt lại mật khẩu với template HTML thực tế.
3. **Thư viện hiệu ứng dựng sẵn (React Bits):**
   - Đang import `SpotlightCard`, `TiltedCard` từ `src/components/reactbits/` tại landing page và admin page (trái với yêu cầu thiết kế riêng và anti-slop).
4. **Kiến trúc Port đơn nhất:**
   - Hiện toàn bộ Landing, Owner Dashboard, Platform Admin, Student Portal, Kiosk chạy chung trên 1 port (3000 hoặc 3001).
   - Chưa có reverse proxy định tuyến theo domain (`admin.*`, `owner.*`, `member.*`, `kiosk.*`, `api.*`).
5. **Platform Admin chưa mang tầm Control Center:**
   - Đang dùng tabs đơn giản, lồng nhiều card, thiếu các màn hình giám sát email logs, background jobs, audit trail, server-side pagination, user freeze/unfreeze/resend verification.

---

## 2. Ma Trận Phân Loại Thay Đổi (Preserve / Redesign / Refactor / Delete)

| Thành phần | Phân loại | Hành động cụ thể |
| :--- | :--- | :--- |
| **Reconciliation Engine & VietQR** | GIỮ LẠI (Preserve) | Giữ nguyên thuật toán so khớp thanh toán, đối soát tự động 24/7, sinh VietQR Napas chuẩn Zero-Custody. |
| **Data Models (Group, Member, Invoice, Attendance, Contract)** | GIỮ LẠI (Preserve) | Toàn bộ quan hệ nghiệp vụ, outbox event, audit log, meter readings, digital contracts được bảo toàn. |
| **Landing Page** | THIẾT KẾ LẠI (Redesign) | Thiết kế lại 100% theo phong cách High-End Editorial SaaS: Bộ ảnh AI thực tế, Device mockups CSS 3D, 9 sections trực quan, typography chuẩn 400-500-600, CTA trỏ vào Auth thật. |
| **Platform Admin** | THIẾT KẾ LẠI (Redesign) | Đại tu thành System Operations Control Center: Real-time DB Metrics, User Directory với Server Actions (khóa, mở khóa, gửi lại xác thực, audit log), Quản lý Không gian, Gói & Dịch vụ, Email Delivery Logs, System Health. |
| **Owner Portal** | THIẾT KẾ LẠI (Redesign) | Chuẩn hóa bảng điều khiển, loại bỏ card lồng nhau, điều hướng 2 cấp rõ ràng, empty state có hướng dẫn thao tác cụ thể. |
| **Student / Member Portal** | THIẾT KẾ LẠI (Redesign) | Giao diện mobile-first độc lập hoàn toàn với Owner: chỉ xem dữ liệu cá nhân, lịch sinh hoạt, quét QR, thanh toán VietQR. |
| **Kiosk** | THIẾT KẾ LẠI (Redesign) | Full-screen kiosk, tương tác từ xa rõ nét, dynamic QR, auto-reset an toàn, không rò rỉ dữ liệu phiên trước. |
| **Authentication Flow** | REFACTOR & XÂY MỚI | Bổ sung Email Verification Token, Reset Password Token, trang Đăng ký, Xác thực Email, Đăng nhập, Quên mật khẩu, Đổi mật khẩu. Gửi email qua SMTP/Mailpit/Console. |
| **Demo Accounts & Mock Seed** | XÓA (Delete) | Loại bỏ tài khoản hardcoded `demo@tingroster.vn`, xóa nút Demo 1-click, tạo script Reset Database an toàn có kiểm tra môi trường. |
| **React Bits Components** | XÓA (Delete) | Loại bỏ dependency và các file trong `src/components/reactbits/`, thay bằng CSS layout chuyên biệt. |
| **Hạ Tầng Multi-Port & Proxy** | XÂY MỚI (New) | Cấu hình Docker Compose đa service, Nginx Reverse Proxy phân nhánh hostname/port, tài liệu hướng dẫn gán domain và bootstrap Super Admin. |

---

## 3. Bản Đồ Port & Domain Mục Tiêu

| Ứng dụng | Port Nội Bộ | Domain Đề Xuất (Reverse Proxy) | Mục Đích |
| :--- | :--- | :--- | :--- |
| **Public Landing & Auth** | `3000` | `tingroster.vn` / `www.tingroster.vn` | Giới thiệu, tính ROI, đăng ký, xác thực email, đăng nhập |
| **Platform Admin** | `4000` | `admin.tingroster.vn` | Quản trị nền tảng toàn hệ thống (Super Admin) |
| **Owner Portal** | `4001` | `owner.tingroster.vn` | Quản lý không gian, thành viên, điểm danh, công nợ |
| **Student/Member Portal** | `4002` | `member.tingroster.vn` | Cổng học viên/hội viên tự phục vụ |
| **Kiosk** | `4003` | `kiosk.tingroster.vn` | Màn hình check-in tự động tại cơ sở |
| **Backend API & Auth** | `4100` | `api.tingroster.vn` | API chung, webhooks VietQR, auth endpoints |
| **Database (PostgreSQL)** | `5433` (nội bộ: 5432) | `internal` | Lưu trữ dữ liệu an toàn |
