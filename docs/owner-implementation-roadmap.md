# LỘ TRÌNH TRIỂN KHAI CHO OWNER WORKSPACE (IMPLEMENTATION ROADMAP)

Tài liệu này xác định các bước cụ thể để hoàn thiện các tính năng cốt lõi cho Owner theo đúng thứ tự ưu tiên P0 -> P1 -> P2.

---

## 1. CÁC GIAI ĐOẠN TRIỂN KHAI CỤ THỂ

### Phase 1: Nền tảng Tài liệu & Trung tâm Hóa đơn Chứng từ (P0)
- [x] Audit hiện trạng và lập 7 tài liệu kiến trúc kỹ thuật.
- [ ] Xây dựng trang **Hóa đơn & Chứng từ Tài liệu (Document Center)** tại `/documents`:
  - Phân loại rõ: *Biên nhận nội bộ (Internal Receipts)*, *Chứng từ thanh toán (Payment Proofs)*, *Cổng Hóa đơn điện tử (e-Invoice Status)*.
  - Hỗ trợ xem chi tiết biên nhận, in hoặc tải file PDF biên nhận thu tiền có dòng miễn trừ pháp lý chuẩn mực.
  - Hiển thị trung thực trạng thái e-Invoice chưa kết nối, không sinh file hóa đơn đỏ giả mạo.

### Phase 2: Trung tâm Xuất Báo cáo & Bàn giao Kế toán (Export Center - P1)
- [ ] Xây dựng trang **Trung tâm Xuất Dữ liệu** tại `/export`:
  - Cho phép Owner chọn loại báo cáo: Danh sách thành viên, Lịch sử điểm danh, Khoản thu & Công nợ, Lịch sử giao dịch VietQR, Dữ liệu bàn giao kế toán.
  - Chọn phạm vi ngày bắt đầu / kết thúc và nhóm cơ sở (workspace).
  - Preview số dòng dữ liệu trước khi tải.
  - Tạo và tải file CSV / Excel thực tế về máy tính.

### Phase 3: Nâng cấp AI Assistant Workbench cho Owner (P2)
- [ ] Cập nhật giao diện `/ai-assistant` với các phím tắt tác vụ nhanh dành riêng cho Owner:
  - "Những khoản nào quá hạn hơn 7 ngày?"
  - "Tóm tắt doanh thu và công nợ tháng này."
  - "Lớp nào có học viên nghỉ nhiều cần liên hệ phụ huynh?"
  - "Soạn thảo tin nhắn Zalo nhắc nợ học phí/tiền trọ lịch sự."
  - "Giao dịch VietQR nào chưa khớp nội dung cần đối soát?"

### Phase 4: Tích hợp Đầy Đủ vào Navigation Shell & RBAC Enforce (P0)
- [ ] Cập nhật menu điều hướng trong `src/app/(dashboard)/layout.tsx`:
  - Thêm mục **Hóa đơn & Chứng từ** (`/documents`).
  - Thêm mục **Xuất dữ liệu** (`/export`).
  - Đảm bảo kiểm tra phân quyền: Staff không truy cập được Billing và Export nhạy cảm.

### Phase 5: Visual QA, Type-Check & Docker Production Build (P0)
- [ ] Chạy `npm run typecheck` xác nhận 0 lỗi.
- [ ] Chạy `npm test` xác nhận 100% test suites pass.
- [ ] Build lại Docker image và xác nhận tất cả routes trả về `200 OK`.
