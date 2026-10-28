# ĐẶC TẢ PHÂN ĐỊNH HÓA ĐƠN, BIÊN NHẬN VÀ CHỨNG TỪ TÀI LIỆU

Tài liệu này xác lập quy chuẩn pháp lý và phân định ranh giới nghiêm ngặt giữa các loại tài liệu trong TingRoster, tuân thủ Nghị định 254/2026/NĐ-CP và Thông tư 91/2026/TT-BTC.

---

## 1. NGUYÊN TẮC BẤT BIẾN: PHÂN LOẠI 3 NHÓM TÀI LIỆU

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG TÀI LIỆU CỦA WORKSPACE                      │
├─────────────────────────┬─────────────────────────┬────────────────────┤
│   A. BIÊN NHẬN NỘI BỘ   │ B. CHỨNG TỪ THANH TOÁN  │ C. HÓA ĐƠN ĐIỆN TỬ │
│   (Internal Receipt)    │    (Payment Proof)      │    (e-Invoice)     │
├─────────────────────────┼─────────────────────────┼────────────────────┤
│ • Ghi nhận thu tiền     │ • Lịch sử giao dịch     │ • Hóa đơn GTGT     │
│   nội bộ cơ sở          │   chuyển khoản VietQR   │   có mã CQT        │
│ • Không thay thế HĐĐT   │ • Mã tham chiếu SePay/  │ • Chỉ phát hành    │
│ • Phục vụ đối soát phụ  │   Casso/Napas           │   khi đã tích hợp  │
│   huynh/khách thuê      │ • Bằng chứng chuyển tiền│   provider hợp lệ  │
└─────────────────────────┴─────────────────────────┴────────────────────┘
```

### 1.1. Loại A: Biên Nhận Nội Bộ (Internal Receipt / Phiếu Thu)
- **Mục đích:** Xác nhận giữa Chủ cơ sở (Owner) và Người nộp tiền (Học sinh/Khách thuê) rằng hệ thống đã ghi nhận việc thanh toán một khoản tiền.
- **Giá trị pháp lý:** Là chứng từ kế toán nội bộ, đối soát giữa 2 bên. **Tuyệt đối không được gọi là "Hóa đơn điện tử" hay "Hóa đơn đỏ"**.
- **Các trường thông tin bắt buộc:**
  1. Tiêu đề: *BIÊN NHẬN THU TIỀN NỘI BỘ (INTERNAL RECEIPT)*.
  2. Mã biên nhận: Định dạng `REC-YYYYMMDD-XXXXX`.
  3. Đơn vị thu: Tên lớp học / Nhà trọ / CLB, Người đại diện, Số điện thoại.
  4. Người nộp tiền: Họ tên học viên / Khách thuê phòng, Mã định danh.
  5. Nội dung thu: Tên đợt thu (Học phí tháng 10, Tiền phòng 302 kỳ 10/2026).
  6. Số tiền: Viết bằng số (định dạng VND `formatVND()`) và viết bằng chữ.
  7. Phương thức: *Chuyển khoản VietQR tự động* hoặc *Tiền mặt*.
  8. Mã tham chiếu giao dịch ngân hàng: Transaction Reference ID (từ VietQR Napas/SePay).
  9. Thời điểm ghi nhận: Giờ, ngày tháng năm theo múi giờ `Asia/Ho_Chi_Minh`.
  10. Trạng thái: *Đã xác nhận tự động qua cổng ngân hàng*.
  11. Dòng ghi chú pháp lý bắt buộc: *"Biên nhận này được tạo tự động bởi hệ thống TingRoster làm bằng chứng thanh toán nội bộ, không có giá trị thay thế hóa đơn điện tử theo quy định của cơ quan Thuế."*

### 1.2. Loại B: Chi Tiết Thanh Toán & Đối Soát (Payment Allocation Proof)
- **Mục đích:** Bằng chứng kỹ thuật chứng minh dòng tiền ngân hàng đã được gạch nợ thành công vào hóa đơn tương ứng.
- **Các trường thông tin:**
  - Ngân hàng thụ hưởng: Tên ngân hàng, Số tài khoản, Chủ tài khoản.
  - Ngân hàng gửi & Tên người chuyển: (trích xuất từ nội dung biến động số dư).
  - Nội dung chuyển khoản thực tế: Chứa cú pháp nhận diện `TR...`.
  - Số tiền biến động: So sánh với số tiền cần thu (Khớp 100%, Thừa, hoặc Thiếu).
  - Mã đối soát duy nhất: `providerTransactionId` (Lũy đẳng idempotency).

### 1.3. Loại C: Hóa Đơn Điện Tử Hợp Pháp (e-Invoice)
- **Điều kiện phát hành:**
  1. Cơ sở đã hoàn tất thủ tục đăng ký sử dụng HĐĐT với cơ quan Thuế.
  2. Workspace đã cấu hình kết nối API với Nhà cung cấp giải pháp HĐĐT được cấp phép (VNPT-Invoice, Viettel S-Invoice, MISA meInvoice, BKAV eHoadon).
  3. Có chữ ký số hợp lệ (USB Token hoặc Cloud HSM).
- **Hiện trạng tại TingRoster:**
  - Chưa tích hợp API trực tiếp với nhà cung cấp hóa đơn điện tử cụ thể.
  - **Quy tắc bắt buộc trên giao diện:** Hiển thị trạng thái *"Chưa kết nối cổng Hóa đơn điện tử"* kèm nút *"Cấu hình kết nối e-Invoice"*.
  - **Tuyệt đối không tự ý sinh file PDF giả lập tem nhãn Hóa đơn điện tử có mã CQT giả mạo**.

---

## 2. PHÂN BIỆT VỚI HÓA ĐƠN THU PHÍ PHẦN MỀM TINGROSTER

Cần phân định rành mạch giữa 2 luồng:
1. **Chứng từ TingRoster thu phí dịch vụ phần mềm:** Công ty Cổ phần Công nghệ TingRoster phát hành cho Chủ workspace khi họ nạp tiền ví hoặc nâng cấp gói PRO (Thuế suất GTGT phần mềm 0% hoặc 10% theo quy định, hiển thị trong mục `/billing`).
2. **Chứng từ khoản thu của Workspace:** Chủ workspace phát hành cho học sinh/khách thuê phòng (hiển thị trong mục `/invoices` và Trung tâm Tài liệu).
