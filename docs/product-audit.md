# TingRoster — Product Audit & Discovery (Giai đoạn A)

## 1. Hiện trạng sản phẩm & Đánh giá năng lực
Hệ thống MVP TingRoster ban đầu đã hoàn thành bộ khung nền tảng:
- **Xác thực & Phiên làm việc:** JWT HTTP-only cookies, bcrypt password hashing.
- **Quản lý dữ liệu:** Lớp học (`Group`), Thành viên (`Member`), Điểm danh (`Attendance`), Hóa đơn (`Invoice`).
- **Thanh toán & Đối soát:** VietQR QuickLink URL generation, SePay & Casso Webhook Adapter, Reconciliation Service với `prisma.$transaction`.
- **Cổng công khai & Kiosk:** `/p/[slug]` (cổng phụ huynh), `/kiosk/[groupId]` (kiosk màn hình tại sân với Web Audio "Ting").

---

## 2. Các điểm nghẽn & Khoảng trống UX phát hiện được

| Khu vực | Vấn đề hiện tại | Giải pháp Redesign V2 |
| :--- | :--- | :--- |
| **Onboarding** | Người dùng mới đăng ký vào thẳng dashboard trống, dễ hoang mang | Xây dựng **Onboarding Wizard** 7 bước dẫn dắt từng bước từ tạo lớp đến thử VietQR |
| **Quản lý lớp** | Chỉ xem được danh sách lớp tổng quát, thiếu trang chi tiết chuyên sâu | Tạo trang **Group Detail** với 6 tabs: Tổng quan, Điểm danh, Thành viên, Học phí, Giao dịch, Cài đặt |
| **Hồ sơ học viên** | Chưa có trang xem chi tiết lịch sử đóng tiền của từng em | Tạo trang **Member Profile** xem toàn bộ lịch sử điểm danh, hóa đơn và nút tạo phiếu thu nhanh |
| **Báo cáo & Phân tích** | Chưa có biểu đồ doanh thu theo tuần/tháng, tỷ lệ thu đúng hạn | Xây dựng trang **Reports & Insights** trực quan, phân tích nợ và dự báo khoản thu |
| **Tự động hóa** | Chưa có màn hình quản lý các quy tắc nhắc nợ, tự tạo đợt thu | Tạo trang **Automation Center** quản lý trigger, điều kiện, hành động và nhật ký thực thi |
| **Hỗ trợ người dùng** | Thiếu hướng dẫn tích hợp, xử lý sự cố chuyển khoản sai | Bổ sung **Help Center** toàn diện với checklist, FAQ, glossary thuật ngữ và tài liệu hướng dẫn |
| **Hỗ trợ thông minh (AI)** | Người dùng vẫn phải xử lý thủ công import file và tra cứu báo cáo | Tích hợp **4 tính năng AI thiết thực**: Import Assistant, Natural Language Query, Reconciliation Assistant, Smart Reminders |

---

## 3. Rủi ro khi Refactor & Chiến lược bảo vệ
1. **Bảo toàn dữ liệu tài chính:** Không sửa đổi cấu trúc số nguyên `Int` của tiền VND trong database.
2. **Bảo toàn tính lũy đẳng:** Giữ nguyên khóa duy nhất `[provider, providerTransactionId]`.
3. **Tương thích ngược API:** Các API route handlers hiện có giữ nguyên response envelope `{ success, data, error }`.
