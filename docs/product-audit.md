# TINGROSTER — BÁO CÁO AUDIT SẢN PHẨM & KỸ THUẬT TOÀN DIỆN (PHASE 0)

*Ngày lập: 28/10/2026*  
*Người thực hiện: Antigravity Engineering & Design Squad*  
*Mục tiêu: Đánh giá toàn diện kiến trúc, mã nguồn, phân định tính năng hoạt động vs mock, rủi ro tài chính và lộ trình chuẩn hóa SaaS thương mại.*

---

## 1. TỔNG QUAN HỆ THỐNG HIỆN TẠI

- **Framework:** Next.js 14+ (App Router).
- **Ngôn ngữ:** TypeScript Strict Mode.
- **Styling:** Tailwind CSS kết hợp Material UI (MUI v6) thông qua `AppRouterCacheProvider` và `MuiThemeRegistry`.
- **Database / ORM:** PostgreSQL 16 chạy trên Docker container `tingroster-db` (Port 5433), Prisma ORM v5.
- **Containerization:** Docker Compose cụm 2 dịch vụ (`tingroster-db` và `tingroster-app` port 3001).

---

## 2. PHÂN LOẠI TÍNH NĂNG THEO TRẠNG THÁI HOẠT ĐỘNG THỰC TẾ

| Nhóm chức năng | Trạng thái kỹ thuật | Mô tả chi tiết & Đánh giá rủi ro |
| :--- | :--- | :--- |
| **Authentication & Session** | **ĐANG HOẠT ĐỘNG** | Đăng nhập JWT HTTP-only cookie, mã hóa mật khẩu bcrypt, phân quyền `userId` trên API. |
| **Quản lý Lớp học / CLB / Nhà trọ (`/groups`)** | **ĐANG HOẠT ĐỘNG** | Đầy đủ CRUD `Group`, tự sinh slug tiếng Việt chuẩn SEO, thống kê sĩ số học viên từ DB. |
| **Quản lý Thành viên (`/members`)** | **ĐANG HOẠT ĐỘNG** | Danh sách thành viên, lọc theo nhóm, tìm kiếm theo tên/SĐT, thống kê chuyên cần và trạng thái công nợ. |
| **Điểm danh 1 chạm (`/attendance`)** | **ĐANG HOẠT ĐỘNG** | Ma trận điểm danh P/A/L/T, lưu hàng loạt hoặc từng học viên qua `prisma.$transaction`, thống kê tỷ lệ chuyên cần. |
| **Khoản thu & Hóa đơn (`/invoices`)** | **ĐANG HOẠT ĐỘNG** | Sinh hóa đơn theo lớp/chu kỳ, sinh mã thanh toán định danh `TRxxxxx`, mã QR VietQR Napas chuẩn MBBank. |
| **Giao dịch & Đối soát VietQR (`/transactions`)** | **ĐANG HOẠT ĐỘNG** | Ghi nhận webhook ngân hàng, thuật toán đối soát tự động gạch nợ hóa đơn, chống trùng lặp lũy đẳng `[provider, providerTransactionId]`. |
| **Cổng VietQR công khai cho Phụ huynh (`/p/[slug]`)** | **ĐANG HOẠT ĐỘNG** | Truy cập an toàn qua `publicToken`, hiển thị QR động kèm số tiền và mã chuyển khoản chính xác, copy số TK 1 chạm. |
| **Kiosk tại sân (`/kiosk`)** | **ĐANG HOẠT ĐỘNG** | Màn hình check-in mã học viên/SĐT toàn màn hình, chuông thông báo Ting! khi điểm danh thành công. |
| **Báo cáo tài chính & Kế toán (`/reports`)** | **HOẠT ĐỘNG VỚI DATA ENGINE** | Tính toán dòng tiền thực thu (Cash-in) vs doanh thu phát sinh (Accrual), phân bổ tuổi nợ (Aging 4 buckets), ước tính thuế theo TT 40/2021/TT-BTC. |
| **Số dư & Nạp tiền TingRoster (`/billing`)** | **HOẠT ĐỘNG CƠ BẢN** | Lưu trữ `serviceBalance` và nhật ký `serviceLedger` trong User model. Đã có modal nạp VietQR mô phỏng. |
| **Platform Admin Console (`/admin`)** | **CẦN TÁCH BIỆT & NÂNG CẤP TOÀN DIỆN** | Hiện tại là một trang đơn lẻ, cần phân tách thành Platform Admin Console chuyên nghiệp độc lập với 25 nhóm nghiệp vụ. |
| **Phân định 2 Domain Tài chính** | **CÓ NGUY CƠ NHẦM LẪN** | Cần phân tách rạch ròi bằng tài liệu và giao diện giữa **Domain A (Platform Credits)** và **Domain B (Customer Collections)**. |

---

## 3. AUDIT GIAO DIỆN & TYPOGRAPHY TIẾNG VIỆT

- **Font chữ:** Font `Be Vietnam Pro` (Google Fonts) được tải thông qua `next/font/google`. Đã cấu hình `subsets: ['latin', 'vietnamese']` và `display: 'swap'`.
- **Dấu tiếng Việt:** Hiển thị sắc nét trên Windows 11 Chrome, Edge, không bị lệch chân chữ hoa có dấu (như `Ư`, `Ơ`, `Đ`, `Ắ`, `Ặ`).
- **Tabular Numerals (`tnum`):** Đã cấu hình `font-feature-settings: "tnum" 1` cho các thẻ hiển thị tiền VND, giúp số tiền căn thẳng hàng dọc khi xem bảng và KPI.
- **Sự cố CSS Layer Material UI:** Đã loại bỏ `enableCssLayer: true` khỏi `AppRouterCacheProvider` để tránh xung đột Tailwind CSS reset ghi đè màu nền nút bấm Material UI.
- **Tương phản & Dark Mode:** Đã đồng bộ màu text `dark:text-[#F8FAFC]` trên các Dialog, Drawer và Modal popup.

---

## 4. AUDIT ẢNH THAM CHIẾU TRONG REPOSITORY

- Thư mục `docs/ui-reference/` đã được bổ sung ảnh tham chiếu chuẩn:
  * `reference_modal.png` (Modal tạo lớp học / CLB phong cách Operational SaaS Dark/Light tương phản cao, góc bo 20px, stroke xanh neon tinh tế).
- Đã đối chiếu 5 mô hình tham chiếu trong `docs/ui-reference-analysis.md`:
  1. *FiscalPro Dashboard:* Bố cục 4 KPI tài chính hàng đầu + Action Queue.
  2. *Pulse Analytics:* Biểu đồ doanh thu 2 đường gradient + Donut chart nguồn thu.
  3. *Untitled UI Members:* Dải KPI ngang 5 số liệu + Bảng thành viên đa nhãn.
  4. *Skolaro Attendance:* Ma trận điểm danh ngày P/A/L/T.
  5. *Olvy Details:* Hồ sơ 2 cột kèm Dòng thời gian lịch sử hoạt động.

---

## 5. AUDIT SCRIPTS & TEST SUITES

- `npm run typecheck` (`tsc --noEmit`): Pass 100%, 0 lỗi TypeScript Strict Mode.
- `npm test` (`vitest run`): Pass 100% (19/19 tests tại 3 test suites: `reconciliation-logic.test.ts`, `payment-code.test.ts`, `providers.test.ts`).
- `docker compose`: Đang chạy ổn định tại `localhost:3001` (App) và `localhost:5433` (Postgres).

---

## 6. DANH SÁCH RỦI RO & NHIỆM VỤ ƯU TIÊN HÀNG ĐẦU

1. **Rủi ro gộp số liệu tài chính:** Phải đảm bảo không bao giờ cộng tiền nạp TingRoster (ví duy trì 500đ/tx) vào doanh thu học phí/tiền trọ của khách hàng.
2. **Quyền truy cập Billing:** Mục `billing` trong Workspace App phải bị ẩn đối với nhân viên (Staff/Manager), chỉ có Owner hoặc Billing Admin mới được xem và nạp tiền.
3. **Phân hệ Admin Console:** Cần xây dựng kiến trúc phân hệ hoàn chỉnh cho `/admin` với 25 nhóm chức năng, có Action Queue ưu tiên, giám sát Webhook thời gian thực và quản lý 30-Day Trial.
