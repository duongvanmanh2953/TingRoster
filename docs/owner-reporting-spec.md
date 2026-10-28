# ĐẶC TẢ HỆ THỐNG BÁO CÁO DÀNH CHO OWNER (OWNER REPORTING SPEC)

Tài liệu này định nghĩa cấu trúc dữ liệu, công thức toán học và cách thức trình bày các báo cáo vận hành và tài chính của Owner.

---

## 1. NGUYÊN TẮC BÁO CÁO QUẢN TRỊ TINGROSTER

1. **Báo cáo Quản trị Vận hành (Internal Management Reports):** Đây là công cụ giúp Chủ cơ sở theo dõi dòng tiền thu được và nợ tồn đọng. **Không tự xưng là Báo cáo tài chính pháp định hay Sổ cái kế toán nhà nước**.
2. **Loại trừ tiền Đang xác minh (Pending) khỏi số Đã thu:** Tiền đã nhận chỉ bao gồm các giao dịch đã có biến động số dư ngân hàng và đối soát thành công.
3. **Các Aging Buckets loại trừ lẫn nhau:** Một khoản nợ chỉ nằm trong đúng một khoảng thời gian quá hạn, không bị đếm trùng lặp.

---

## 2. DANH MỤC CÁC BÁO CÁO LÕI DÀNH CHO OWNER

### 2.1. Báo Cáo Thu Tiền (Cash Inflow Report)
- **Mục đích:** Theo dõi tổng số tiền thực tế đã thu về tài khoản ngân hàng trong kỳ chọn lọc.
- **Metrics cốt lõi:**
  - `totalAccrualDue`: Tổng nghĩa vụ phải thu phát sinh trong kỳ.
  - `totalCashCollected`: Tổng tiền thực thu đã gạch nợ thành công (Chuyển khoản VietQR + Tiền mặt đã xác nhận).
  - `collectionRate`: Tỷ lệ thu tiền = `(totalCashCollected / totalAccrualDue) * 100%`.
  - `onTimeCollectionRate`: Tỷ lệ thu đúng hạn trước `dueDate`.
- **Phân rã (Breakdown):**
  - Theo thời gian (Ngày / Tuần / Tháng / Quý).
  - Theo từng lớp học / dãy nhà trọ / gói câu lạc bộ.
  - Theo phương thức thanh toán (VietQR tự động chiếm ~95%, Tiền mặt ~5%).

### 2.2. Báo Cáo Công Nợ & Aging (Debt & Aging Report)
- **Mục đích:** Phân loại công nợ theo mức độ rủi ro thời gian để có chiến lược nhắc phí phù hợp.
- **4 Aging Buckets loại trừ nhau:**
  1. *Chưa đến hạn:* Khoản thu có ngày hạn `dueDate >= ngày hiện tại`.
  2. *Quá hạn 1 – 7 ngày:* Giai đoạn nhắc nhở nhẹ nhàng (Friendly Reminder qua Zalo).
  3. *Quá hạn 8 – 30 ngày:* Giai đoạn cảnh báo ngừng cung cấp dịch vụ / đình chỉ buổi học.
  4. *Quá hạn trên 30 ngày:* Nợ xấu khó đòi, cần liên hệ trực tiếp phụ huynh/khách thuê.
- **Top 10 người nợ nhiều nhất:** Danh sách học viên/khách thuê có tổng dư nợ cao nhất trong cơ sở để ưu tiên xử lý.

### 2.3. Báo Cáo Chuyên Cần & Buổi Học (Attendance & Session Report)
- **Mục đích:** Đánh giá mức độ tham gia của học viên và số buổi đã tổ chức.
- **Metrics cốt lõi:**
  - `attendanceRate`: Tỷ lệ có mặt = `(Số lượt có mặt / Tổng số lượt điểm danh) * 100%`.
  - `totalSessionsHeld`: Tổng số buổi học/buổi tập đã diễn ra trong tháng.
  - Danh sách học viên vắng > 3 buổi trong tháng: Cảnh báo nguy cơ học lực giảm sút hoặc bỏ học để giáo viên liên hệ gia đình.
- **Quy tắc đạo đức:** *Không tự suy diễn năng lực học tập từ số liệu chuyên cần thuần túy*.

### 2.4. Báo Cáo Cho Nhà Trọ & Bất Động Sản Cho Thuê (Rental Property Report)
- **Metrics đặc thù:**
  - `occupancyRate`: Tỷ lệ lấp đầy phòng = `(Số phòng đang có khách thuê / Tổng số phòng) * 100%`.
  - `rentCollectionRate`: Tỷ lệ thu tiền phòng tháng hiện tại.
  - Phân tích chi phí dịch vụ: Tiền điện (kWh), tiền nước (khối), tiền rác/wifi tách biệt với tiền thuê nhà gốc.
  - Cảnh báo hợp đồng thuê sắp hết hạn: Danh sách phòng còn dưới 15 ngày hết hạn hợp đồng để chuẩn bị tái ký.

### 2.5. Báo Cáo Cho Câu Lạc Bộ Thể Thao (Sports Club Report)
- **Metrics đặc thù:**
  - Khung giờ cao điểm (Peak Hours Heatmap): Khung 17:30 – 21:00 có tỷ lệ check-in cao nhất.
  - Tình trạng gói tập: Số hội viên đang hoạt động, số gói sắp hết hạn (dưới 7 ngày hoặc còn dưới 2 buổi tập).
  - Tỷ lệ tái đăng ký (Retention Rate): Tỷ lệ hội viên mua thêm gói mới sau khi hết gói cũ.

### 2.6. Báo Cáo Dữ Liệu Bàn Giao Kế Toán (Accounting Handover Data)
- **Cấu trúc bảng xuất CSV / Excel:**
  1. `Mã chứng từ`: Mã hóa đơn TingRoster `TR-...`.
  2. `Ngày giao dịch`: `YYYY-MM-DD HH:mm`.
  3. `Họ tên người nộp`: Tên học sinh / Khách thuê.
  4. `Khoản mục thu`: Học phí lớp 12 / Tiền phòng 201.
  5. `Số tiền thực thu (VND)`: Định dạng số nguyên chuẩn `tnum`.
  6. `Ngân hàng & STK nhận`: MBBank 9999xxxx.
  7. `Mã tham chiếu ngân hàng (Bank Ref)`: FT...
  8. `Trạng thái đối soát`: Đã khớp tự động.
- **Ghi chú bắt buộc:** Báo cáo xuất ra mang tính chất nhật ký thu tiền làm căn cứ cung cấp cho kế toán viên lập sổ sách thuế, không tự ý thay thế tờ khai thuế chính thức.
