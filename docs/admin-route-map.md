# TingRoster Platform Admin — Route Map & Navigation Architecture

## 1. 7 Nhóm Điều Hướng Quản Trị Hệ Thống (Navigation Groups)

### Nhóm 1: OVERVIEW (Điều hành & Tổng quan)
- **OVERVIEW**: Bảng điều hành tổng hợp, 4 Master KPI (Tenants, MRR, Customer GMV, Platform Float).
- **ACTION_QUEUE**: Hàng đợi các tác vụ khẩn cấp (Đơn nạp pending > 30p, Trial sắp hết hạn, Ticket ưu tiên cao).
- **SYSTEM_HEALTH**: Báo cáo hạ tầng & Tình trạng kết nối Ngân hàng (VietQR Napas 247, SePay Callback, Zalo ZNS).

### Nhóm 2: CUSTOMERS (Khách hàng & Đối tượng Quản lý)
- **USERS**: Danh bạ người dùng toàn nền tảng (User Directory, role, email/phone masked, trạng thái hoạt động).
- **TENANTS**: Quản lý cơ sở / trung tâm / chủ nhà trọ (Tenant Directory, phân loại đa ngành, quy mô, số dư).
- **CLASSES**: Quản lý lớp học & trung tâm giáo dục (Sĩ số học viên, số buổi điểm danh, tiến độ thu học phí).
- **RENTALS**: Quản lý nhà trọ & căn hộ cho thuê (Tỷ lệ lấp đầy phòng, hạn hợp đồng thuê, công nợ tiền phòng).
- **TRIALS**: Quản lý dùng thử 30 ngày & Phễu chuyển đổi nạp phí (Cohort conversion, ngày hết hạn).

### Nhóm 3: FINANCIAL OPERATIONS (Tài chính & Thu Phí Nền Tảng)
- **FINANCE_OVERVIEW**: Doanh thu dịch vụ nền tảng (MRR, Phí đối soát 500đ/tx, Dòng tiền thực nhận).
- **TOPUP_ORDERS**: Quản lý đơn nạp tiền duy trì dịch vụ của Chủ cơ sở (VietQR Napas 247).
- **CREDIT_LEDGER**: Sổ cái biến động số dư ví TingRoster (Append-only, TOP_UP, SERVICE_CHARGE, ADJUSTMENT).
- **INVOICES**: Quản lý hóa đơn cước TingRoster & Biên nhận điện tử.
- **COLLECTIONS_MONITOR**: Giám sát luồng tiền học phí / tiền trọ chuyển về STK ngân hàng của Chủ cơ sở (Zero-custody, đối soát trực tiếp).

### Nhóm 4: PRODUCT & ANALYTICS (Báo cáo & Phân Tích)
- **ANALYTICS_GROWTH**: Tăng trưởng cơ sở, Active tenants theo tuần/tháng.
- **ANALYTICS_ACTIVATION**: Phễu kích hoạt tính năng (Tạo nhóm -> Điểm danh -> Nhận tiền VietQR đầu tiên).
- **ANALYTICS_AI**: Tần suất sử dụng trợ lý AI & Bot thông minh TingRoster.

### Nhóm 5: OPERATIONS (Vận Hành & Kết Nối)
- **SUPPORT_TICKETS**: Trung tâm xử lý yêu cầu trợ giúp và báo lỗi từ chủ cơ sở.
- **WEBHOOK_GATEWAYS**: Giám sát cổng callback SePay, Napas 247, nhật ký retry và SLA.
- **BACKGROUND_JOBS**: Tiến trình đối soát tự động định kỳ, gửi tin nhắn nhắc nợ.

### Nhóm 6: PLATFORM CONFIGURATION (Cấu Hình Hệ Thống)
- **CONFIG_PRICING**: Cấu hình biểu phí 500đ/giao dịch & Gói cước Pro 299k / Enterprise 699k.
- **CONFIG_TRIAL**: Chính sách dùng thử 30 ngày & Giới hạn thành viên.
- **CONFIG_BANK**: Tài khoản ngân hàng nhận tiền cước TingRoster (Miền A Float).
- **CONFIG_SYSTEM**: Timeout webhook, rate limit, chế độ bảo trì và bảo mật 2FA.

### Nhóm 7: SECURITY & AUDIT (An Ninh & Kiểm Toán)
- **AUDIT_LOGS**: Nhật ký thao tác của quản trị viên (Admin Audit Trail, IP address, timestamp, lý do).
- **SECURITY_CENTER**: Cảnh báo truy cập bất thường, kiểm soát phiên đăng nhập.

---

## 2. Responsive Breakpoint Specification
- **Desktop (≥ 1024px):** Fixed Left Sidebar (264px mở, 72px thu gọn), header sticky, content scroll độc lập.
- **Tablet (768px - 1023px):** Collapsible sidebar với overlay backdrop khi mở, KPI grid 2 cột.
- **Mobile (< 768px):** Off-canvas slide drawer với nút Hamburger, danh sách cuộn mượt, touch target tối thiểu 44px.
