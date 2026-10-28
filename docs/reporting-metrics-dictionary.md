# TINGROSTER — TỪ ĐIỂN CHỈ SỐ BÁO CÁO VÀ VẬN HÀNH (METRICS DICTIONARY)

---

## 1. NHÓM CHỈ SỐ THU TIỀN & CÔNG NỢ (WORKSPACE APP)

| Tên chỉ số (VN) | Mã nội bộ | Định nghĩa chuẩn xác | Công thức tính toán | Lưu ý kế toán |
| :--- | :--- | :--- | :--- | :--- |
| **Tổng phải thu trong kỳ** | `totalAccrualDue` | Tổng số tiền học phí, tiền phòng hoặc phí sinh hoạt phát sinh trên toàn bộ hóa đơn có hiệu lực trong kỳ đã chọn. | $\sum (\text{Invoice.amountDue})$ của các hóa đơn có `status != VOID`. | Ghi nhận theo nguyên tắc kế toán dồn tích (Accrual basis). KHÔNG tính các hóa đơn đã hủy (VOID). |
| **Đã thu được xác nhận** | `totalCashCollected` | Tổng số tiền thực tế đã chảy vào tài khoản ngân hàng của chủ cơ sở và được hệ thống đối soát gạch nợ thành công. | $\sum (\text{Invoice.amountPaid})$. | Ghi nhận theo nguyên tắc dòng tiền thực tế (Cash basis). Tiền đang pending hoặc chưa khớp KHÔNG được tính vào đây. |
| **Còn phải thu (Dư nợ)** | `remainingReceivables` | Tổng số tiền học viên hoặc khách thuê còn thiếu tính đến thời điểm hiện tại. | $\max(0, \text{totalAccrualDue} - \text{totalCashCollected})$. | Thể hiện tổng công nợ chưa thu hồi được. |
| **Nợ quá hạn** | `overdueReceivables` | Tổng số tiền của các hóa đơn đã vượt quá ngày đến hạn thanh toán (`dueDate < now`) nhưng chưa nộp đủ. | $\sum (\text{Invoice.remainingDebt})$ với các hóa đơn có `dueDate < now`. | Là chỉ số rủi ro thanh khoản cần ưu tiên nhắc nợ sớm. |
| **Tỷ lệ thu tiền (%)** | `collectionRate` | Phần trăm số tiền đã thu thành công so với tổng số tiền phải thu trong kỳ. | $\left( \frac{\text{totalCashCollected}}{\text{totalAccrualDue}} \right) \times 100\%$. | Đạt từ 90% trở lên là mức thu hồi công nợ tốt. |

---

## 2. NHÓM CHỈ SỐ PHÂN BỔ TUỔI NỢ (AGING SCHEDULE BUCKETS)

*Quy tắc bắt buộc: Các nhóm tuổi nợ là **loại trừ lẫn nhau (Mutually Exclusive)**, một hóa đơn chỉ thuộc về duy nhất một nhóm.*

| Nhóm tuổi nợ | Mã Bucket | Điều kiện thời gian | Hành động vận hành tương ứng |
| :--- | :--- | :--- | :--- |
| **Chưa đến hạn** | `CURRENT` | `dueDate >= now` hoặc chưa có ngày đến hạn | Theo dõi bình thường, hiển thị trên cổng VietQR phụ huynh. |
| **Quá hạn 1–7 ngày** | `OVERDUE_1_7` | `1 <= (now - dueDate) <= 7` ngày | Gửi tin nhắn Zalo ZNS / SMS nhắc nhở nhẹ nhàng lần 1. |
| **Quá hạn 8–30 ngày** | `OVERDUE_8_30` | `8 <= (now - dueDate) <= 30` ngày | Gửi cảnh báo nhắc nợ lần 2, gọi điện trực tiếp hoặc gửi thông báo giấy. |
| **Quá hạn trên 30 ngày** | `OVERDUE_OVER_30`| `(now - dueDate) > 30` ngày | Nợ khó đòi, chuyển sang trạng thái tạm dừng dịch vụ hoặc xử lý cá biệt. |

---

## 3. NHÓM CHỈ SỐ NỀN TẢNG SAAS (PLATFORM ADMIN CONSOLE)

| Tên chỉ số SaaS | Mã nội bộ | Định nghĩa kỹ thuật | Phân định doanh thu |
| :--- | :--- | :--- | :--- |
| **Tổng GMV Hệ thống (System GMV / GTV)** | `systemGmv` | Tổng giá trị giao dịch VietQR Napas luân chuyển qua toàn bộ hệ thống giữa học sinh và các chủ cơ sở. | **KHÔNG PHẢI DOANH THU TINGROSTER.** Đây là lưu lượng giao dịch mà phần mềm hỗ trợ xử lý. |
| **Doanh thu định kỳ (MRR)** | `platformMrr` | Doanh thu định kỳ hàng tháng từ phí duy trì tài khoản PRO và phí nạp dịch vụ ví của các chủ workspace. | **LÀ DOANH THU SAAS CỦA TINGROSTER.** |
| **Số dư ví lưu ký (Platform Float)** | `platformFloat` | Tổng số dư ví dịch vụ (`serviceBalance`) hiện đang được người dùng nạp sẵn trên hệ thống. | **LÀ KHOẢN NỢ PHẢI TRẢ DỊCH VỤ (Doanh thu chưa thực hiện).** Chỉ chuyển thành doanh thu khi dịch vụ được tiêu thụ. |
| **Tỷ lệ chuyển đổi dùng thử (%)** | `trialConversionRate` | Tỷ lệ phần trăm các cơ sở chuyển đổi từ gói dùng thử 30 ngày sang trạng thái nạp tiền duy trì trả phí. | $\left( \frac{\text{Số Tenant nạp tiền}}{\text{Tổng Tenant hết hạn dùng thử}} \right) \times 100\%$. |
| **Độ trễ đối soát (Webhook Latency)** | `webhookLatencyMs` | Thời gian từ khi Ngân hàng phát tín hiệu webhook đến khi TingRoster gạch nợ hóa đơn thành công. | Mục tiêu: $< 300\text{ ms}$. |
