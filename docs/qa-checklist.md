# Quality Assurance (QA) Checklist — TingRoster

> Danh mục kiểm thử toàn diện cho hệ thống SaaS TingRoster, bao gồm Visual QA, Functional QA, Responsive Breakpoints, Accessibility và Security.

---

## 1. Visual & Typography QA
- [x] **Font tiếng Việt:** Font `Be Vietnam Pro` được nhúng chuẩn xác qua `next/font/google`, hiển thị đầy đủ dấu câu tiếng Việt không lỗi font hay chân chữ.
- [x] **Tabular Numerals:** Các cột số tiền VNĐ áp dụng font mono hoặc `tnum` giúp thẳng hàng và dễ quét mắt.
- [x] **Bảng màu chuẩn AGENTS.md:**
  - Canvas: `#F5F7FB`
  - Surface: `#FFFFFF`
  - Sidebar: Dark Navy `#0B0F19`
  - Primary Brand: Royal Blue `#2538D9`
  - Accent Violet: `#6D5CE8`
  - Chưa đóng: `bg-rose-50 text-rose-700 border-rose-200`
  - Đóng thiếu: `bg-amber-50 text-amber-700 border-amber-200`
  - Đã đóng đủ: `bg-emerald-50 text-emerald-700 border-emerald-200`
- [x] **Hệ thống Avatar:**
  - Thành viên có ảnh chân dung hoặc initials tự sinh theo tên tiếng Việt.
  - Màu nền initials phân bổ ngẫu nhiên nhưng ổn định (deterministic).
  - Có chấm trạng thái hoạt động (online, away, offline).
- [x] **Hệ thống Logo:**
  - Logo TingRoster đa biến thể (light, dark, icon-only) hiển thị sắc nét trên Landing page, Header, Sidebar, Kiosk và Cổng thanh toán.

---

## 2. Functional End-to-End Workflow QA
- [x] **1. Đăng ký & Đăng nhập:**
  - Đăng nhập thành công với tài khoản mẫu (`demo@tingroster.vn` / `123456`).
  - Hỗ trợ nút đăng nhập nhanh 1-chạm không cần gõ phím.
- [x] **2. Onboarding Wizard:**
  - Quy trình 6 bước rõ ràng từ chọn mô hình đến kết nối ngân hàng.
  - Nút quay lại không làm mất dữ liệu đã nhập.
- [x] **3. Quản lý lớp học / CLB:**
  - Tạo mới lớp học, hỗ trợ chuyển đổi giữa chế độ thẻ (Grid) và bảng (Table).
  - Thanh tiến độ thu phí và cảnh báo quá hạn hiển thị chính xác.
- [x] **4. Điểm danh hàng ngày:**
  - Điểm danh 1-chạm (Có mặt, Vắng, Nghỉ phép).
  - Tự động tính tỷ lệ chuyên cần và số buổi học lũy kế.
- [x] **5. Hóa đơn & VietQR:**
  - Tạo hóa đơn đơn lẻ và tạo hàng loạt theo lớp.
  - Tự động sinh mã chuyển khoản chuẩn dạng `TRxxxxx`.
  - Sinh mã VietQR Napas 24/7 quét được bởi mọi ngân hàng.
- [x] **6. Kiosk tại sân:**
  - Giao diện Dark Navy chữ lớn, quét QR và chọn nhanh thành viên.
  - Phát âm thanh chuông Ting! và ghi nhận lượt vào tức thì.
- [x] **7. Đối soát giao dịch:**
  - Nhận webhook ngân hàng mô phỏng qua nút "Thử Ting!".
  - Tự động gạch nợ hóa đơn tương ứng.
  - Hỗ trợ gán thủ công kèm AI đề xuất đối chiếu thông minh.

---

## 3. Responsive Design QA
- [x] **Mobile (<640px):**
  - Thanh điều hướng đáy (Bottom Navigation Bar) cố định thuận tiện ngón tay cái.
  - Menu drawer đóng mở mượt mà.
  - Bảng dữ liệu tự động cuộn ngang hoặc chuyển đổi thành thẻ danh sách.
- [x] **Tablet (640px – 1023px):**
  - Không tràn ngang (no horizontal overflow).
  - Kiosk tối ưu hóa cảm ứng chạm trên iPad / Android Tablet.
- [x] **Desktop (≥1024px):**
  - Sidebar Dark Navy mở rộng 248px, phân cấp thị giác rõ nét.
  - Header tích hợp tìm kiếm toàn hệ thống và hồ sơ quản trị viên.

---

## 4. Financial Integrity & Security QA
- [x] **Lũy đẳng Webhook:** Ràng buộc duy nhất `[provider, providerTransactionId]` ngăn chặn việc cộng dồn tiền 2 lần khi webhook gửi lặp.
- [x] **Giao dịch nguyên tử:** Cập nhật hóa đơn và phân bổ thanh toán diễn ra trong `prisma.$transaction`.
- [x] **Bảo vệ dữ liệu công khai:** Cổng phụ huynh chỉ truy cập qua `publicToken`, không làm lộ thông tin cá nhân hoặc công nợ của học sinh khác.
- [x] **Toán học tiền tệ VNĐ:** Toàn bộ số tiền được lưu và tính toán dưới dạng số nguyên (`Int`), không phát sinh sai số số thực.
