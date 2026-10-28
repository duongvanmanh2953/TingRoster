# TINGROSTER — LỘ TRÌNH THỰC THI NÂNG CẤP TOÀN DIỆN (IMPLEMENTATION ROADMAP)

---

## 1. TỔNG QUAN LỘ TRÌNH 6 PHASE

| Giai đoạn | Tên Phase | Trọng tâm công việc | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Audit & Spec Architecture** | Kiểm toán mã nguồn, đánh giá rủi ro tài chính, thiết lập 8 tài liệu chuẩn kiến trúc. | **HOÀN THÀNH** |
| **Phase 1** | **UI Foundation & Design System** | Đồng bộ theme Material UI + Tailwind CSS, Be Vietnam Pro font, tabular numerals, color tokens. | **TIẾN HÀNH** |
| **Phase 2** | **Workspace App Re-engineering** | Chuẩn hóa 12 navigation items; Tái thiết kế Dashboard chuẩn Operational SaaS (4 KPI, 3 biểu đồ, Action Queue). | **TIẾN HÀNH** |
| **Phase 3** | **30-Day Free Trial & Financial Domains** | Phân định rạch ròi Domain A (Platform Credits) & Domain B (Customer Collections); bảo mật ẩn billing đối với staff. | **TIẾN HÀNH** |
| **Phase 4** | **Platform Admin Console** | Tái cấu trúc `/admin` thành trung tâm quản trị toàn hệ thống (Overview, Tenants, Trials, Top-ups, Ledger, Webhooks). | **TIẾN HÀNH** |
| **Phase 5 & 6** | **Verification, Hardening & Testing** | Chạy `npm run typecheck`, `npm test`, Docker container live test, rà soát bảo mật. | **TIẾN HÀNH** |

---

## 2. KẾ HOẠCH TRIỂN KHAI CHI TIẾT

### Phase 1: UI Foundation
- Cập nhật palette Material UI: Primary `#3344D6`, Primary Soft `#EEF2FF`, Canvas `#F5F7FB`, Surface `#FFFFFF`.
- Tối ưu `MuiThemeRegistry.tsx` với typography `Be Vietnam Pro`, elevation bóng mờ tinh tế, border neutral `#E4E7EC`.

### Phase 2: Workspace App Navigation & Dashboard
- Sửa `src/app/(dashboard)/layout.tsx`: Đảm bảo 12 mục menu chuẩn; kiểm tra quyền: chỉ Owner hoặc Billing Admin mới thấy mục `Gói dịch vụ & Số dư TingRoster`.
- Tái thiết kế `src/app/(dashboard)/dashboard/page.tsx`:
  * Hàng trên: 4 KPI tối cao (Tổng phải thu, Đã thu xác nhận, Còn phải thu, Quá hạn cần xử lý).
  * Biểu đồ: Thu tiền theo thời gian (Line chart với bộ lọc Ngày/Tuần/Tháng/Quý).
  * Biểu đồ cơ cấu khoản thu & Bảng tuổi nợ.
  * Hàng đợi Action Queue (Việc cần xử lý ngay).
  * Recent activity feed liên kết dữ liệu nguồn.

### Phase 3 & 4: Trial 30 Ngày & Platform Admin Console
- Hoàn thiện trang `/billing` với banner 30 ngày dùng thử đếm ngược rõ ràng.
- Nâng cấp trang `/admin` thành Platform Admin Console chuyên nghiệp độc lập.

### Phase 5 & 6: Testing & Verification
- Kiểm tra toàn bộ TypeScript Strict Mode.
- Chạy unit tests.
- Rebuild và kiểm tra container Docker.
