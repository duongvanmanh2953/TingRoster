# HÀNH TRÌNH TRẢI NGHIỆM CỦA OWNER (OWNER USER JOURNEYS)

Tài liệu này phân tích chi tiết hành trình tác nghiệp hàng ngày của 3 nhóm Owner điển hình trong hệ sinh thái TingRoster.

---

## 1. HÀNH TRÌNH 1: THẦY CÔ GIÁO DẠY THÊM & CHỦ TRUNG TÂM GIÁO DỤC

### Bối cảnh:
Cô Mai quản lý 3 lớp Toán (Lớp 10, Lớp 11, Lớp 12), tổng cộng 75 học sinh. Vào đầu tháng, cô cần thu học phí và hàng ngày cần điểm danh điểm trừ số buổi.

### Các bước trải nghiệm chính:
1. **Buổi sáng — Điểm danh buổi học:**
   - Cô mở TingRoster trên điện thoại hoặc máy tính bảng lúc vào lớp.
   - Chọn lớp "Toán 12 Nâng cao", nhấn vào nút **"Điểm danh một chạm"**.
   - Mặc định tất cả học sinh hiển thị trạng thái "Có mặt". Cô Mai chỉ cần gõ vào 2 học sinh vắng để chuyển thành "Nghỉ có phép".
   - Bấm "Lưu điểm danh". Hệ thống lưu dữ liệu an toàn và tự động cập nhật số buổi học còn lại của gói học viên.

2. **Đầu tháng — Phát hành học phí & Gửi mã VietQR:**
   - Vào mục **"Khoản thu & Công nợ"** -> Bấm **"Tạo đợt thu học phí hàng loạt"**.
   - Chọn lớp 12, nhập số tiền 1.200.000 đ/tháng, ngày hết hạn ngày 10 hàng tháng.
   - Hệ thống tự động sinh 25 mã VietQR động có sẵn số tiền và cú pháp chuẩn `TR-xxxx`.
   - Bấm **"Gửi thông báo học phí"** qua Zalo ZNS. Phụ huynh nhận tin nhắn có kèm link mở hóa đơn và quét VietQR trên ứng dụng ngân hàng.

3. **Tự động đối soát & gạch nợ:**
   - Phụ huynh chuyển tiền, SePay/Casso đẩy webhook vào TingRoster.
   - Hệ thống so khớp mã `TR...`, tự động đánh dấu hóa đơn sang **"Đã thanh toán"**, gửi thông báo "Ting!" tới cô Mai.
   - Cô Mai không cần phải mở sao kê ngân hàng đối chiếu từng dòng mất hàng giờ như trước.

---

## 2. HÀNH TRÌNH 2: CHỦ NHÀ TRỌ & CĂN HỘ DỊCH VỤ MINI

### Bối cảnh:
Anh Tuấn sở hữu dãy trọ 16 phòng tại TP. Thủ Đức. Tiền phòng gồm: Tiền thuê cố định (3.500.000 đ), Tiền điện (3.800 đ/kWh), Tiền nước (20.000 đ/khối), Tiền rác/wifi (150.000 đ).

### Các bước trải nghiệm chính:
1. **Ngày 25 hàng tháng — Nhập chỉ số điện nước:**
   - Anh Tuấn đi kiểm tra công tơ, mở TingRoster vào phòng trọ số 201.
   - Nhập chỉ số điện mới: 1.450 (chỉ số cũ 1.320 -> dùng 130 kWh).
   - Nhập chỉ số nước mới: 85 (chỉ số cũ 78 -> dùng 7 khối).
   - Hệ thống tự động tính thành tiền chi tiết và tạo khoản thu tổng tiền phòng tháng đó.

2. **Gửi hóa đơn & Biên nhận thu tiền:**
   - Khách thuê mở link trên điện thoại, thấy rõ từng dòng: Tiền nhà, tiền điện, tiền nước.
   - Khách bấm mở ứng dụng ngân hàng quét VietQR chuyển khoản.
   - Ngay khi tiền vào tài khoản ngân hàng của anh Tuấn, khách nhận được **Biên nhận thu tiền nội bộ (Internal Receipt)** có mã tra cứu rõ ràng để an tâm lưu trữ.

3. **Quản lý công nợ & Hợp đồng thuê:**
   - Anh Tuấn mở Dashboard, xem biểu đồ Aging công nợ: Phòng 304 nợ quá hạn 8 ngày.
   - Anh Tuấn bấm nút "Gửi nhắc nợ lịch sự" để hệ thống tự động gửi tin nhắn mẫu nhã nhặn.
   - Kiểm tra tab "Hợp đồng sắp hết hạn" để chuẩn bị hỏi khách tái ký tiếp năm tới.

---

## 3. HÀNH TRÌNH 3: CHỦ CÂU LẠC BỘ THỂ THAO (PICKLEBALL, CẦU LÔNG, GYM)

### Bối cảnh:
Anh Long quản lý CLB Cầu Lông với 120 hội viên sinh hoạt theo gói tháng hoặc thẻ 10 buổi.

### Các bước trải nghiệm chính:
1. **Hội viên đến sân check-in:**
   - Hội viên quét mã QR tại quầy tiếp tân hoặc nhân viên điểm danh trên màn hình Kiosk.
   - Hệ thống hiển thị số buổi còn lại trong thẻ tập (ví dụ: Còn 3/10 buổi).

2. **Hội viên gia hạn gói tập:**
   - Khi hội viên hết buổi, nhân viên tạo đợt gia hạn gói tập mới.
   - Mã VietQR hiển thị ngay trên màn hình để hội viên quét trả tiền trong 10 giây.
   - Tiền về STK anh Long, thẻ tập tự động cộng thêm 10 buổi mới.

3. **Xem báo cáo hiệu suất:**
   - Anh Long xem biểu đồ khung giờ cao điểm để biết khung 18:00 – 21:00 luôn kín sân, từ đó điều chỉnh bảng giá giờ vàng và giờ thấp điểm.
