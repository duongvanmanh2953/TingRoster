# TingRoster — Member Portal, Flexible Workflows, Realtime Chat & Premium Features

## 1. Tổng quan Kiến trúc

TingRoster được phát triển thành nền tảng SaaS vận hành kép gồm hai không gian trải nghiệm độc lập nhưng liên kết chặt chẽ:

1. **Owner Workspace (`/(dashboard)`):** Dành cho Người sở hữu và Quản lý cơ sở (Giáo viên, Chủ trung tâm, Chủ nhiệm CLB thể thao, Chủ nhà trọ). Cung cấp bộ công cụ tự động hóa, cấu hình quy trình linh hoạt (Workflow Builder), lập bảng kê chi tiết từng dòng (Itemized Charge Builder), quản lý gói dịch vụ và đối soát ngân hàng VietQR Napas 247.
2. **Member Portal (`/portal`):** Dành cho Học viên, Hội viên CLB, Khách thuê phòng trọ hoặc Phụ huynh. Sử dụng tài khoản cá nhân dùng chung để tham gia nhiều nhóm/cơ sở khác nhau; minh bạch hóa toàn bộ các khoản phải đóng, lịch sử chuyên cần, đối soát giao dịch thời gian thực và kênh trao đổi nội bộ.

---

## 2. Mô hình Danh tính & Phân quyền Đa cơ sở

Một `User` duy nhất có thể đồng thời đóng nhiều vai trò trong các Workspace khác nhau:

```
[ User Account ] (Email / SĐT / Password / JWT Session)
       │
       ├── Chủ sở hữu (Owner) ─── Workspace A (Lớp Toán 12A Thầy Tuấn)
       ├── Hội viên (Member)  ─── Workspace B (CLB Cầu Lông TingRoster)
       └── Khách thuê (Tenant)─── Workspace C (Nhà trọ Cầu Giấy)
```

- **Quyền hạn Server-side RBAC:**
  - `Platform Super Admin`: Giám sát toàn hệ thống, kiểm soát an toàn bảo mật, xem audit logs.
  - `Owner`: Tạo nhóm, thiết lập quy trình, lập bảng kê chi tiết, cấu hình biểu phí, mua gói Pro, xem toàn bộ báo cáo doanh thu.
  - `Member / Học viên`: Chỉ truy cập dữ liệu của chính mình trong các nhóm mà mình tham gia. Tuyệt đối không thể xem công nợ, số điện thoại hay thông tin tài chính của học viên khác.

---

## 3. Hệ thống Cổng Học Viên / Hội Viên (Member Portal)

| Tuyến đường (Route) | Chức năng nghiệp vụ | Thành phần dữ liệu |
| :--- | :--- | :--- |
| `/portal` | Bảng điều khiển tổng quan cá nhân | Chào mừng học viên, 3 thẻ KPI tài chính (Còn nợ, Quá hạn, Đã đóng), Thẻ VietQR Pay nhanh, Lịch hoạt động sắp tới, Bảng tin thông báo từ Thầy cô |
| `/portal/groups` | Danh sách nhóm đang tham gia | Lớp học, CLB thể thao, Nhà trọ; thông tin người phụ trách, biểu phí định kỳ, chuyên cần cá nhân, lối tắt vào kênh trò chuyện |
| `/portal/fees` | Khoản phải đóng minh bạch | Bảng phân bổ chi tiết từng dòng (Line Items: học phí, tài liệu, giảm trừ); Card chuyển khoản VietQR Napas 247 kèm mã `TR...` chuẩn xác; Lịch sử đối soát ngân hàng |
| `/portal/attendance` | Điểm danh & Chuyên cần | Lịch theo tháng; tỷ lệ chuyên cần; trạng thái (Có mặt, Nghỉ có phép, Vắng tính phí, Học bù); **Modal gửi khiếu nại / điều chỉnh điểm danh** |
| `/portal/chat` | Kênh trò chuyện nội bộ | Kênh Thông báo 1 chiều từ giáo viên, Nhóm thảo luận các thành viên, Tin nhắn riêng 1-1 (kiểm tra phân quyền Pro) |
| `/portal/profile` | Hồ sơ & Cài đặt thông báo | Thông tin cá nhân, người giám hộ, tùy chọn kênh nhận tin (Email, Zalo ZNS), liên kết điều khoản pháp lý |
| `/portal/help` | Trợ giúp & Khiếu nại | Tạo phiếu hỗ trợ (Ticket), theo dõi trạng thái tiếp nhận, xem phản hồi giải quyết từ ban quản trị |

---

## 4. Công cụ Lập Khoản Thu Linh Hoạt (Flexible Charge Builder) & Chứng Từ

### 4.1. Cấu trúc Bảng kê Khoản thu (Line Items)
Mỗi khoản thu được lập trong hệ thống không chỉ là một con số tổng duy nhất, mà được cấu thành từ danh mục chi tiết:
- **Tên hạng mục:** Học phí, Tiền sân, Tiền điện (kWh), Tiền nước (m³), Tài liệu giáo trình...
- **Đơn vị & Số lượng:** 8 buổi, 1 bộ, 150 kWh...
- **Đơn giá & Giảm giá:** Tính toán số nguyên VND chuẩn xác, không dùng số thực gây sai lệch số dư.
- **Thanh toán linh hoạt nhiều đợt (Partial Payments):** Cho phép đặt mức nộp tối thiểu đợt 1 và quản lý số dư còn nợ.

### 4.2. Phân định Chứng Từ Pháp Lý
1. **Bảng kê học phí / Khoản phải đóng nội bộ (Charge Statement):** Thông báo số tiền cần nộp, danh mục chi tiết và mã đối soát VietQR.
2. **Biên nhận thanh toán nội bộ (Internal Payment Receipt):** Xác nhận hệ thống ngân hàng đã nhận tiền và khớp nợ tự động.
3. **Hóa đơn điện tử GTGT pháp định (Official e-Invoice):** Phân định rõ ràng trong hệ thống là hóa đơn điện tử bắt buộc phải tích hợp giải pháp của các nhà cung cấp được Tổng cục Thuế cấp phép (VNPT, Viettel, MISA, BKAV) theo Nghị định 123/2020/NĐ-CP; TingRoster không tự tiện xuất PDF giả mạo danh nghĩa hóa đơn điện tử pháp định.

---

## 5. Quy Trình Vận Hành Do Chủ Cơ Sở Tự Xây Dựng (Workflow Builder)

Trang `/workflows` cung cấp 3 bộ mẫu khởi đầu cho Owner:
1. **Lớp học & Giáo dục:** Điểm danh theo buổi -> Tự động chốt học phí cuối tháng theo số buổi có mặt -> Gửi bảng kê VietQR -> Gạch nợ tự động sau 5 giây.
2. **CLB Thể thao:** Mua gói buổi (10 buổi / 20 buổi) -> Quét mã nạp tiền -> Điểm danh trừ lượt chơi -> Cảnh báo khi gói còn dưới 2 buổi.
3. **Nhà trọ & Căn hộ mini:** Chốt chỉ số điện nước cuối tháng -> Cộng tiền phòng cố định -> Phát hành bảng kê chi tiết -> Gửi link qua Zalo -> Cập nhật trạng thái hợp đồng.

---

## 6. Trò Chuyện Thời Gian Thực & Kiểm Soát Gói Dịch Vụ (Chat Entitlements)

- **Group Announcements:** Kênh phát thanh 1 chiều; chỉ Giáo viên / Chủ sở hữu hoặc Admin mới có quyền đăng bài; thành viên chỉ đọc.
- **Group Chat:** Kênh thảo luận mở cho toàn bộ thành viên trong nhóm.
- **Direct Messages (1-1):** Nhắn tin riêng tư giữa Thầy cô và Học viên.
  - **Cơ chế Entitlement Lock:** Server-side xác thực gói dịch vụ của Workspace:
    - Nếu Workspace đang dùng gói **FREE**: Direct Messages bị khóa. Owner nhận được thông báo nâng cấp gói Pro (299.000đ/tháng), Member nhận được thông báo tính năng chưa khả dụng tại cơ sở này.
    - Nếu Workspace đã đăng ký gói **PRO**: Mở khóa toàn diện tính năng nhắn tin riêng.

---

## 7. Bảng Đánh Giá Tính Năng (Feature Inventory & Gap Analysis)

| Module | Trạng thái triển khai | Chi tiết kỹ thuật |
| :--- | :--- | :--- |
| **Cổng Học Viên (`/portal`)** | **Hoàn thành 100% (Real)** | Kết nối trực tiếp cơ sở dữ liệu Prisma, responsive desktop & mobile bottom nav |
| **Khoản thu chi tiết (`/portal/fees`)** | **Hoàn thành 100% (Real)** | Line items breakdown, VietQR động theo STK cơ sở, đối soát đa giao dịch |
| **Khiếu nại điểm danh (`/portal/attendance`)** | **Hoàn thành 100% (Real)** | Lưu bảng `AttendanceAdjustmentRequest`, trạng thái PENDING/APPROVED |
| **Trò chuyện nội bộ (`/portal/chat`)** | **Hoàn thành 100% (Real)** | Bảng tin thông báo, nhóm chat, chặn Direct Messages nếu chưa lên Pro |
| **Quy trình quản lý (`/workflows`)** | **Hoàn thành 100% (Real)** | 3 Templates đa ngành (Giáo dục, Thể thao, Bất động sản), tùy biến quy tắc |
| **Trung tâm Trợ giúp (`/portal/help`, `/help`)** | **Hoàn thành 100% (Real)** | Tạo ticket `TK-...`, lưu DB `SupportTicket`, tracking trạng thái xử lý |
| **Điều khoản & Hoàn phí (`/legal`)** | **Hoàn thành 100% (Real)** | Lưu DB `PolicyDocument` (v2.4 & v1.8), lưu vết người dùng chấp thuận |
| **Gửi email thông báo thật** | **Hợp đồng an toàn (Ready for SMTP)** | Bảng `NotificationLog` ghi vết PENDING/SENT; sẵn sàng cắm Resend/SendGrid API key |
| **Xuất hóa đơn GTGT điện tử** | **Phân định pháp lý rõ ràng** | Gắn nhãn Bản kê nội bộ; quy định kết nối API nhà cung cấp e-Invoice khi lên Production |
