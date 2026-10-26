# TingRoster — 10 Hành Trình Người Dùng Trọng Tâm (Giai đoạn C)

Tài liệu thiết kế chi tiết 10 hành trình sử dụng chính nhằm đảm bảo tính liền mạch, không có bước cụt:

---

### Hành Trình 1: Người dùng mới Đăng ký & Onboarding
1. Giáo viên/Chủ CLB vào trang chủ, bấm **Dùng thử miễn phí**.
2. Điền Form đăng ký (Họ tên, Email, Mật khẩu, Số tài khoản ngân hàng nhận tiền VietQR).
3. Đăng ký thành công -> Hệ thống tự động chuyển hướng vào **`/onboarding`**.
4. Người dùng hoàn thành Wizard 7 bước trực quan (Chọn loại hình -> Tạo lớp -> Thêm học viên -> Kiểm tra VietQR -> Sẵn sàng).

---

### Hành Trình 2: Tạo lớp học / Câu lạc bộ mới
1. Người dùng vào `/groups`, bấm **Tạo lớp / CLB mới**.
2. Nhập tên lớp (hệ thống tự sinh đường dẫn `slug` thân thiện, ví dụ: `lop-toan-12a`).
3. Chọn loại hình (`CLASS`, `SPORTS_CLUB`, `RENTAL`) và định mức học phí mặc định.
4. Bấm **Xác nhận** -> Lớp mới xuất hiện ngay với thẻ thống kê thành viên, nút sao chép link gửi Zalo và mở Kiosk.

---

### Hành Trình 3: Thêm học viên & Nhập danh sách thông minh (AI Import)
1. Trong chi tiết lớp hoặc sổ điểm danh, bấm **Thêm học viên** hoặc **Nhập từ Excel/CSV**.
2. Người dùng tải file danh sách -> AI Import Assistant tự động nhận diện cột (Họ tên, SĐT, Phụ huynh), chuẩn hóa định dạng số điện thoại Việt Nam và cảnh báo nếu có tên trùng lặp.
3. Người dùng xem trước bảng dữ liệu và bấm **Xác nhận lưu** -> Danh sách được lưu vào database.

---

### Hành Trình 4: Điểm danh một chạm hàng ngày
1. Mở `/attendance`, hệ thống tự chọn ngày hôm nay.
2. Danh sách học viên hiển thị dạng ma trận.
3. Người dùng chạm vào nút **Có mặt / Báo vắng** cho từng học viên hoặc bấm **Điểm danh tất cả có mặt**.
4. Giao diện cập nhật lạc quan (Optimistic UI) tức thời mà không cần reload trang.

---

### Hành Trình 5: Tạo đợt thu học phí & Sinh mã VietQR
1. Vào `/invoices`, bấm **Tạo đợt thu mới**.
2. Chọn lớp học và tiêu đề đợt thu (ví dụ: "Học phí Tháng 11/2026").
3. Chọn phương thức tính:
   - **Cố định:** Ví dụ 600.000đ/học viên.
   - **Theo số buổi điểm danh:** Hệ thống đếm chính xác số buổi có mặt trong khoảng ngày và nhân với đơn giá buổi.
4. Bấm **Xác nhận** -> Hệ thống tạo hàng loạt hóa đơn trong một database transaction, cấp mã thanh toán `TRxxxxx` và token bảo mật riêng biệt.

---

### Hành Trình 6: Chia sẻ link cho Phụ huynh qua Zalo & Quét QR
1. Chủ lớp bấm nút **Sao chép link Zalo** tại hóa đơn hoặc gửi link cổng chung `/p/[slug]`.
2. Phụ huynh mở link từ điện thoại, chọn tên con em -> Phiếu thu hiển thị với ảnh VietQR đã điền sẵn số tiền và mã chuyển khoản.
3. Phụ huynh mở app ngân hàng (MB, VCB, Techcombank...), quét mã VietQR và xác nhận chuyển tiền.

---

### Hành Trình 7: Nhận Webhook & Tự động gạch nợ trong 5 giây
1. Ngân hàng ghi nhận biến động số dư -> SePay / Casso gửi Webhook đến `/api/webhooks/sepay`.
2. Hệ thống xác thực secret, trích xuất mã `TRxxxxx`, khóa giao dịch nguyên tử trong database.
3. Hóa đơn tự động chuyển trạng thái:
   - Đủ tiền: `PAID` (Đã đóng đủ).
   - Đóng thiếu: `PARTIAL` (Đóng thiếu).
   - Đóng thừa: `OVERPAID` (Ghi nhận khoản dư).
4. Phụ huynh đang mở trang VietQR nhìn thấy màn hình chuyển sang màu xanh: **"Đã thanh toán đầy đủ"** ngay lập tức mà không cần F5.

---

### Hành Trình 8: Xử lý giao dịch chưa khớp (AI Reconciliation Advisor)
1. Người chuyển khoản quên ghi mã hoặc ghi sai cú pháp -> Hệ thống lưu vào tab **Giao dịch chưa khớp** tại `/transactions`.
2. AI Reconciliation Assistant phân tích số tiền, thời gian và họ tên trong nội dung chuyển tiền, đề xuất: *"Khả năng cao là học viên Nguyễn Văn An (khớp 100% số tiền 600.000đ và thời gian học phí tháng 11)"*.
3. Chủ lớp bấm **Gán thủ công** -> Hệ thống gạch nợ và ghi nhật ký kiểm toán `AuditLog`.

---

### Hành Trình 9: Tra cứu Báo cáo bằng Ngôn ngữ Tự nhiên (Natural Language AI)
1. Vào `/reports`, người dùng gõ câu hỏi: *"Tháng này lớp nào còn nợ nhiều nhất?"* hoặc *"Tuần này thu được bao nhiêu tiền?"*.
2. AI phân tích và truy vấn dữ liệu thực tế từ database, trả về câu trả lời chính xác, kèm con số VND cụ thể và danh sách học viên liên quan.

---

### Hành Trình 10: Vận hành Kiosk thể thao tại sân
1. Chủ sân đặt iPad tại quầy check-in, mở `/kiosk/[groupId]`.
2. Người chơi đến sân, chạm vào tên mình trên màn hình -> QR lớn xuất hiện.
3. Người chơi quét QR -> Sau 5 giây, tiếng chuông "Ting!" vang lên, màn hình hiện checkmark xanh xác nhận và tự động trở về danh sách người chơi tiếp theo.
