# TingRoster — Báo Cáo Đánh Giá & Kiểm Soát An Ninh (Security Review)

Tài liệu đánh giá an toàn thông tin, bảo vệ dữ liệu cá nhân (PII) và tính toàn vẹn giao dịch tài chính:

---

## 1. Xác thực & Quản lý Phiên (Authentication & Session)
- **Mật khẩu:** Băm một chiều bằng `bcrypt` với muối (salt rounds = 10). Tuyệt đối không lưu plain text.
- **Phiên làm việc:** JWT ký bằng thuật toán đối xứng với `JWT_SECRET` tối thiểu 32 ký tự, lưu trữ trong **HTTP-only Cookie** (`SameSite=Lax`, `Secure` trong production).
- **Phòng chống đánh cắp token:** Trình duyệt không thể truy cập cookie qua JavaScript (chống XSS).

---

## 2. Phân Quyền & Kiểm Soát Truy Cập (Authorization & IDOR Defense)
- Mọi thao tác truy vấn và chỉnh sửa Lớp (`Group`), Học viên (`Member`), Điểm danh (`Attendance`), Hóa đơn (`Invoice`) và Giao dịch (`TransactionLog`) đều được xác thực quyền sở hữu `userId = session.userId` ở tầng server.
- Tuyệt đối không tin cậy `userId` do client gửi lên trong Request Body.
- Chống tấn công dò mã (Insecure Direct Object Reference - IDOR): Hóa đơn công khai chỉ truy cập được qua `publicToken` dạng CUID ngẫu nhiên có độ entropy cao, không dùng số tự tăng.

---

## 3. An Toàn Webhook & Chống Giả Mạo Giao Dịch
- **SePay:** Kiểm tra header `Authorization` (Apikey) khớp với `SEPAY_WEBHOOK_API_KEY`.
- **Casso:** Kiểm tra header `secure-token` khớp với `CASSO_WEBHOOK_SECURE_TOKEN`.
- **Lũy đẳng tuyệt đối:** Ràng buộc duy nhất `@@unique([provider, providerTransactionId])` ở mức cơ sở dữ liệu ngăn chặn hoàn toàn race condition và việc cộng tiền lặp lại khi webhook được retry.

---

## 4. Bảo Vệ Dữ Liệu Riêng Tư Của Học Sinh & Phụ Huynh (PII Protection)
- Cổng phụ huynh (`/p/[slug]`):
  - Chỉ hiển thị thông tin tối thiểu của chính học viên được chọn.
  - Không bao giờ trả về danh sách kèm số điện thoại, tên phụ huynh hay danh sách công nợ của cả lớp.
- Che số điện thoại (`maskPhone`): Hiển thị dạng `091****678` khi hiển thị ở các vùng công cộng.

---

## 5. Kiểm Toán & Nhật Ký Giao Dịch (Audit Trail)
- Mọi giao dịch đối soát tự động hay gán thủ công đều được ghi lại trong bảng `AuditLog` với `userId`, hành động (`AUTO_RECONCILE`, `MANUAL_RECONCILE`), chi tiết số tiền, trạng thái cũ, trạng thái mới và timestamp.
- Không log các thông tin nhạy cảm: không log password, token bot, chữ ký webhook hay API keys.
