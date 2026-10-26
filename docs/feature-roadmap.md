# TingRoster — Lộ Trình Phát Triển Tính Năng (Feature Roadmap)

Hệ thống tính năng TingRoster được phân cấp thành 4 mức độ ưu tiên từ P0 đến P3:

---

## 🎯 P0 — Cốt lõi (Đã hoàn thiện & Sẵn sàng)
- [x] Xác thực người dùng (Đăng ký, Đăng nhập bằng JWT & Cookie an toàn).
- [x] Quản lý Lớp học / Câu lạc bộ / Thuê phòng.
- [x] Quản lý Học viên / Thành viên.
- [x] Điểm danh một chạm (Daily Roster Matrix).
- [x] Tính học phí (Cố định tháng & Theo số buổi điểm danh).
- [x] Tạo hóa đơn & cấp mã thanh toán `TRxxxxx` an toàn.
- [x] VietQR QuickLink URL chuẩn hóa.
- [x] Webhook SePay & Casso tự động gạch nợ trong 5 giây.
- [x] Động cơ đối soát nguyên tử với `prisma.$transaction`.
- [x] Hàng đợi giao dịch chưa khớp & Gán thủ công có kiểm toán.
- [x] Cổng thanh toán công khai phụ huynh (`/p/[slug]`).
- [x] Chế độ Kiosk iPad tại sân với âm thanh "Ting" (`/kiosk/[groupId]`).

---

## 🚀 P1 — Nâng cấp Trải nghiệm Sản phẩm (Redesign V2)
- [x] **Onboarding Wizard:** Dẫn dắt tài khoản mới hoàn tất thiết lập trong 7 bước.
- [x] **Trang chi tiết lớp chuyên sâu (`/groups/[id]`):** Quản lý tập trung 6 phân hệ của lớp.
- [x] **Hồ sơ thành viên (`/members/[id]`):** Toàn bộ lịch sử điểm danh, phiếu thu và công nợ cá nhân.
- [x] **Trung tâm trợ giúp (`/help`):** Checklist bắt đầu, hướng dẫn tích hợp, FAQ, glossary thuật ngữ.
- [x] **Thông báo Telegram Bot:** Báo tức thì biến động thu phí về điện thoại cá nhân.
- [x] **Nhật ký thay đổi & Kiểm toán (`AuditLog`):** Ghi nhận người thực hiện và dữ liệu thay đổi.

---

## 💡 P2 — Tính năng Nâng cao & AI Thực Dụng
- [x] **Báo cáo & Phân tích (`/reports`):** Doanh thu theo thời gian, tỷ lệ đúng hạn, công nợ từng lớp.
- [x] **Trung tâm Tự động hóa (`/automations`):** Quản lý quy tắc tự tạo hóa đơn, tự nhắc nợ, tự cảnh báo.
- [x] **AI Import Assistant:** Đề xuất mapping cột file Excel/CSV, chuẩn hóa SĐT, phát hiện trùng lặp.
- [x] **AI Natural Language Reports:** Hỏi đáp dữ liệu tài chính bằng tiếng Việt tự nhiên dựa trên database thật.
- [x] **AI Reconciliation Assistant:** Phân tích giao dịch chưa khớp, đề xuất học viên phù hợp kèm độ tin cậy.
- [x] **AI Smart Reminders:** Sinh văn bản nhắc đóng học phí lịch sự theo phong cách (Nhẹ nhàng, Trung tính, Trang trọng).

---

## 🔮 P3 — Khả năng Mở rộng Thương Mại
- [ ] Quản lý nhà trọ chuyên sâu (Số phòng, chỉ số điện nước, kỳ thu tiền nhà).
- [ ] Tích hợp Zalo ZNS (Khi doanh nghiệp hoàn tất xác minh Official Account).
- [ ] White-label & Custom domain cho các trung tâm lớn.
