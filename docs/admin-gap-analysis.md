# TingRoster Platform Admin — Gap Analysis & System Audit

## 1. Executive Summary
TingRoster là nền tảng SaaS fintech quản lý điểm danh, công nợ học phí/tiền trọ và đối soát ngân hàng tự động qua VietQR hàng đầu tại Việt Nam. Tài liệu này kiểm tra chi tiết trạng thái thực tế giữa yêu cầu quản trị toàn diện (Platform Admin Console) và hạ tầng hiện hữu để triển khai triệt để.

---

## 2. Feature Inventory Matrix

| Phân hệ / Tính năng | Yêu cầu chuẩn SaaS | Hiện trạng Codebase | Trạng thái | Kế hoạch hành động |
|---|---|---|---|---|
| **Visual Foundation** | Nền phẳng neutral `#F5F6F8`, surface `#FFFFFF`, border `#E5E7EB`, font `Be Vietnam Pro`, không dùng pastel gradient | Đã loại bỏ hoàn toàn gradient `from-blue-50/70 via-indigo-50/40 to-slate-50` | **DONE** | Duy trì quy chuẩn flat surface trên mọi components |
| **Admin Navigation & Sidebar** | 7 nhóm nghiệp vụ, collapsible (260px / 72px), drawer mobile, độc lập cuộn, active state rõ ràng | Đã chuyển sang Left Sidebar, đang cần nâng cấp lên 7 nhóm chuẩn SaaS | **IN PROGRESS** | Nâng cấp sidebar thành 7 groups với icon, search, badges và collapse toggle |
| **Global User Directory** | Quản lý User ID, tên, email, phone che, ngày tạo, status, role, active, audit actions | API `/api/admin` đã hỗ trợ danh sách, cần view chi tiết và filters | **READY TO EXPAND** | Tích hợp User Directory Table với search, filter và modal xem chi tiết |
| **Workspace / Tenant Directory** | Lọc theo loại hình (Lớp học, CLB, Nhà trọ), plan, trial status, quy mô, số dư ví dịch vụ | Đã có Tenant Directory và filter cơ bản | **EXPANDING** | Thêm phân loại đa ngành (Education, Sports, Rental) và deep diagnostics |
| **Lớp học & Trung tâm** | Giám sát lớp học, số lượng học viên, số buổi, công nợ tổng hợp | Data model `Group` sẵn sàng, có API `/api/groups` | **IN PROGRESS** | Thêm tab Lớp học & Trung tâm trong Customers group |
| **Phòng trọ & Bất động sản** | Giám sát bất động sản, phòng trống, tỷ lệ lấp đầy, hợp đồng | Data model `Group` (loại RENTAL) và rooms | **IN PROGRESS** | Thêm tab Nhà trọ & Bất động sản trong Customers group |
| **Financial Operations** | Tách biệt Miền A (Platform Float) và Miền B (Customer Collections); Sổ cái CreditLedger append-only | Đã có CreditLedgerEntry, Transaction, Webhook | **READY** | Xây dựng Financial Operations với Revenue Overview, Exception Queue, Top-up Orders |
| **Trial 30 Ngày & Thu Phí** | Quản lý cohort, thời hạn kết thúc theo múi giờ VN, nhắc nộp tiền duy trì, conversion rate | Đã có trial stats và bảng giá | **READY** | Xây dựng view chuyên sâu Trial Funnel & Expiry Tracker |
| **Hóa đơn & Chứng từ** | Phân loại hóa đơn TingRoster vs biên nhận thu tiền cơ sở | Đã có Invoices, QuickCreate modal | **EXPANDING** | Bổ sung Document & Invoice Explorer |
| **Integrations & Webhooks** | Giám sát độ trễ, SLA 99.98%, retry queue, SePay/Casso webhook logs | Đã có endpoint webhooks, health monitor | **READY** | Hiển thị real-time Gateway status và Retry actions an toàn |
| **Support & Operations** | Ticket khách hàng, priority, SLA, liên kết tenant/order | Đã có mock support tickets | **EXPANDING** | Nâng cấp Support Center với bộ lọc priority và status |
| **Security & Audit Logs** | Admin audit logs, IP tracing, actor, reason, event history | Đã có AuditLog data model và log viewer | **READY** | Mở rộng Security Center với IP/Actor filters |
| **Platform Configuration** | Biểu phí 500đ/tx, gói Pro 299k/tháng, STK nhận tiền TingRoster, timeout, 2FA | Đã có component `PlatformConfigTab` | **DONE** | Đã hoàn thiện và kết nối |

---

## 3. Data Integrity & Financial Domain Boundary
1. **Miền A (Platform Credits / Float):** Tiền nạp của Chủ cơ sở để duy trì phần mềm (500đ/giao dịch VietQR, gói cước). Tiền chuyển về STK TingRoster. Sổ cái `CreditLedgerEntry` luôn append-only.
2. **Miền B (Customer Collections):** Tiền học phí / tiền trọ phụ huynh và khách thuê chuyển trực tiếp qua VietQR về STK ngân hàng của Chủ cơ sở. TingRoster **zero-custody**, không bao giờ gộp vào doanh thu nền tảng!

---

## 4. Definition of Done
- Không có lỗi TypeScript (`npm run typecheck` exit 0).
- 100% tests pass (`npm test`).
- Toàn bộ 7 nhóm sidebar điều hướng hoạt động mượt mà.
- Không còn bất kỳ pastel gradient cũ nào.
- Responsive hoàn hảo trên Desktop, Tablet và Mobile.
