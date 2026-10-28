# TINGROSTER — BẢN ĐẶC TẢ PLATFORM ADMIN CONSOLE (25 PHÂN HỆ QUẢN TRỊ)

---

## 1. MỤC TIÊU VÀ ĐỐI TƯỢNG SỬ DỤNG

Platform Admin Console (`/admin`) là trung tâm điều hành toàn hệ thống dành riêng cho:
- Lãnh đạo và Giám đốc điều hành TingRoster.
- Đội ngũ vận hành kỹ thuật (Platform Operations / DevOps).
- Đội ngũ kế toán tài chính nền tảng (Platform Finance).
- Đội ngũ Chăm sóc khách hàng & Hỗ trợ kỹ thuật (Customer Support).
- Đội ngũ An ninh & Kiểm toán bảo mật (Security & Audit).

Môi trường này hoàn toàn độc lập với Workspace App của khách hàng thông thường, có navigation riêng, cơ chế xác thực cấp cao, nhật ký kiểm toán không thể sửa xóa (Immutable Audit Trail) và phân quyền chặt chẽ (RBAC).

---

## 2. BẢN ĐỒ 25 PHÂN HỆ QUẢN TRỊ TOÀN DIỆN

```
PLATFORM ADMIN CONSOLE
├── 1. TỔNG QUAN & ĐIỀU HÀNH
│   ├── [1] Admin Overview (Executive KPI & Smart Summaries)
│   ├── [2] Action Queue (Hàng đợi công việc cần xử lý gấp)
│   └── [3] Growth & Cohort Funnel Analytics
├── 2. KHÁCH HÀNG & PHÂN QUYỀN
│   ├── [4] Tenants & Workspaces Management
│   ├── [5] Users & Access Management (RBAC)
│   └── [6] Security Center & Impersonation Audit
├── 3. DÙNG THỬ & THƯƠNG MẠI
│   ├── [7] 30-Day Free Trial Management
│   ├── [8] Plans & Entitlements Configuration
│   ├── [9] Subscriptions & Billing Engine
│   └── [10] Coupons, Promotions & Referral Credits
├── 4. VÍ DỊCH VỤ & TÀI CHÍNH NỀN TẢNG
│   ├── [11] Top-up Orders Management
│   ├── [12] Platform Credit Ledger (Append-only)
│   ├── [13] Platform Payments & Refund Processing
│   ├── [14] Platform Revenue & Financial Reports
│   └── [15] Invoices & E-invoice Integration (NĐ 254/2026)
├── 5. GIÁM SÁT GIAO DỊCH KHÁCH HÀNG & ĐỐI SOÁT
│   ├── [16] Customer Collections Monitoring (Zero Custody)
│   └── [17] Reconciliation Operations & Mismatch Resolution
├── 6. HẠ TẦNG KỸ THUẬT & TÍCH HỢP
│   ├── [18] Integrations & Webhooks Monitoring (Napas/VietQR/Banks)
│   ├── [19] Usage & AI Cost Management (Tokens & Budgets)
│   ├── [20] Notification Management (Zalo ZNS / SMS / Telegram)
│   ├── [21] Background Jobs & Queue Backlog
│   └── [22] System Health & Live Gateway Ping
├── 7. AN NINH, RỦI RO & VẬN HÀNH
│   ├── [23] Support Center (Tickets & Issues)
│   ├── [24] Risk & Abuse Management (Spam & Attack Signals)
│   ├── [25] Feature Flags & Platform Settings
```

---

## 3. CHI TIẾT CÁC PHÂN HỆ QUAN TRỌNG NHẤT

### 3.1. Phân hệ [7]: Quản lý Dùng thử 30 Ngày (30-Day Free Trial Management)
- **Cơ chế cấp trial:** Tự động kích hoạt gói PRO 30 ngày ngay khi tenant mới hoàn tất đăng ký và khởi tạo workspace đầu tiên.
- **Theo dõi đếm ngược:** Tính toán chính xác số ngày còn lại theo múi giờ `Asia/Ho_Chi_Minh`.
- **Cảnh báo trước hạn:** Tự động gắn tag và kích hoạt thông báo khi còn 7 ngày, 3 ngày, 1 ngày.
- **Hành động Admin:**
  * Cho phép gia hạn thêm ngày dùng thử (`EXTEND_TRIAL`), bắt buộc nhập lý do nghiệp vụ (Reason) và ghi nhận vào Audit Log.
  * Lọc danh sách theo tỷ lệ kích hoạt (Activation milestone) và ngành nghề (Chủ nhà trọ, Giáo viên, Chủ CLB).

### 3.2. Phân hệ [11] & [12]: Đơn Nạp Tiền & Sổ Cái Ví Nền Tảng (Top-up & Credit Ledger)
- **Top-up Orders:** Quản lý các đơn nạp ví dịch vụ của các chủ cơ sở (100k, 200k, 500k, 1tr). Xác minh chữ ký webhook ngân hàng trước khi cập nhật.
- **Credit Ledger:** Sổ cái ghi nhận dòng tiền dịch vụ nội bộ của TingRoster. Các loại bút toán: `TOP_UP`, `SERVICE_CHARGE`, `REFUND`, `ADJUSTMENT`.
- **Admin Adjustment Policy:** Chỉ vai trò `PLATFORM_FINANCE` mới có quyền cộng/trừ tiền số dư thủ công. Bắt buộc có preview số dư trước/sau, bắt buộc nhập lý do giải trình. Tuyệt đối không cho phép support tự ý sửa số dư.

### 3.3. Phân hệ [16] & [17]: Giám sát Webhook Ngân hàng & Đối soát Giao dịch
- **Chế độ Zero Custody:** TingRoster không giữ tiền học phí của khách hàng. Phân hệ này đóng vai trò giám sát đường truyền (monitoring pipeline):
  * Tỷ lệ thành công của Webhook SePay, Casso, VietQR API.
  * Tỷ lệ khớp tự động theo mã thanh toán (Mục tiêu >= 99.8%).
  * Danh sách giao dịch sai mã nội dung chuyển khoản để hỗ trợ chủ cơ sở tra cứu nhanh.

### 3.4. Phân hệ [2]: Hàng Đợi Công Việc Cần Xử Lý Gấp (Action Queue)
Tập hợp các sự kiện bất thường cần con người can thiệp:
1. Đơn nạp tiền pending quá 15 phút.
2. Webhook ngân hàng trả về lỗi 5xx.
3. Cơ sở có giao dịch chuyển khoản thừa/thiếu tiền vượt ngưỡng cho phép.
4. Yêu cầu hỗ trợ từ khách hàng có độ ưu tiên cao (P1).
