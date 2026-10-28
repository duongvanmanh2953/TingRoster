# BẢNG KIỂM KÊ VÀ AUDIT THỰC TRẠNG WORKSPACE CHO OWNER TINGROSTER

Tài liệu này đánh giá toàn diện hiện trạng của ứng dụng dành cho **Owner — Người sở hữu và trực tiếp quản lý cơ sở** (Gia sư, Giáo viên, Chủ phòng trọ, Chủ CLB Thể thao).

---

## 1. BẢNG KIỂM KÊ CHI TIẾT CÁC MODULE CHO OWNER

| Module | Existing state | Current route | Backend / API | UI / UX problems | Business gap | Data gap | Priority | Dependencies | Acceptance criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Tổng quan (Owner Dashboard)** | Đã nâng cấp | `/dashboard` | `GET /api/dashboard/summary` | Cần thêm widget cảnh báo phòng trọ/CLB theo ngành | Đã có 4 KPI tối cao, biểu đồ dòng tiền & aging | Cần drill-down sâu vào từng khoản quá hạn | **P0** | Database | 4 KPI chuẩn, filter kỳ động, không cộng pending vào đã thu |
| **2. Quản lý Workspace** | Đã có | `/groups`, `/groups/[id]` | `GET, POST /api/groups` | Trang chi tiết cần tab hóa đa phân hệ rõ ràng | Chưa hỗ trợ cấu hình giá điện/nước riêng cho nhà trọ | Phân loại `CLASS`, `RENTAL`, `SPORTS_CLUB` | **P0** | Database | Tạo/sửa workspace, quản lý thành viên theo nhóm |
| **3. Thành viên & Khách thuê** | Đã có | `/members`, `/members/[id]` | `GET, POST /api/members` | Danh sách còn thiếu preview import XLSX | Cần quản lý chu kỳ gia hạn gói tập / hợp đồng thuê | Thiếu trường ngày bắt đầu/kết thúc hợp đồng thuê | **P0** | Database | CRUD thành viên, xem lịch sử công nợ & điểm danh |
| **4. Điểm danh & Lịch hoạt động** | Đã có | `/attendance`, `/calendar` | `GET, POST /api/attendance` | Điểm danh nhanh cần tối ưu chạm trên mobile | Chưa có cơ chế điểm danh trừ buổi cho thẻ tập CLB | Tỷ lệ chuyên cần tính theo buổi đã tổ chức | **P0** | Database | Điểm danh 1 chạm, chống trùng bản ghi tại server |
| **5. Khoản thu & Công nợ** | Đã có | `/invoices` | `GET, POST /api/invoices` | Chưa có bộ lọc nợ quá hạn theo aging buckets | Chưa có module hủy hóa đơn có nhập lý do bắt buộc | Trạng thái: DRAFT, UNPAID, PARTIAL, PAID, OVERDUE | **P0** | Database | Sinh mã VietQR động chứa tiền & mã TR-xxxx |
| **6. Giao dịch & Đối soát VietQR** | Đã có | `/transactions` | `GET /api/transactions` | Giao dịch chưa khớp cần giao diện gán thủ công 1 chạm | Thiếu cảnh báo giao dịch chuyển thiếu/thừa tiền | Lũy đẳng webhook: unique `[provider, providerTxId]` | **P0** | SePay / Casso | Webhook tự động gạch nợ trong transaction nguyên tử |
| **7. Hóa đơn & Chứng từ (Documents)** | Cần bổ sung | `/invoices` (tab Chứng từ) | Chưa có API riêng | Dễ nhầm biên nhận nội bộ với hóa đơn điện tử VAT | **Chưa có Document Center tập trung** | Phân định rõ Internal Receipt vs E-Invoice | **P0** | E-invoice Provider | Có trang tra cứu biên nhận nội bộ, tải PDF receipt |
| **8. Trung tâm Xuất dữ liệu (Export)** | Phân tán | Nhiều trang | Chưa có backend export chuẩn | Nút xuất dữ liệu nằm rải rác, thiếu filter phạm vi | **Chưa có Export Center tập trung** | Cần xuất CSV/XLSX dữ liệu bàn giao kế toán | **P1** | Backend | Cho phép xuất file CSV/XLSX theo kỳ có preview số dòng |
| **9. Báo cáo Chuyên sâu Owner** | Đã có | `/reports` | `GET /api/reports` | Cần bổ sung tab báo cáo nhà trọ & CLB thể thao | Thiếu phân tích công suất phòng / giờ cao điểm CLB | Phân biệt doanh thu thu tiền với lợi nhuận kế toán | **P1** | Database | Báo cáo thu tiền, công nợ aging, chuyên cần |
| **10. AI Assistant & Tự động hóa** | Đã có | `/ai-assistant`, `/automations` | `POST /api/ai/query` | Cần hỗ trợ các câu hỏi thực tế về nợ và lớp học | AI chưa có cơ chế sinh bản nháp nhắc nợ lịch sự | Dữ liệu context bị giới hạn theo quyền Owner | **P2** | Gemini API | Trả lời chính xác số liệu, có trích dẫn nguồn |
| **11. Gói dịch vụ & Số dư TingRoster** | Đã có | `/billing` | `GET /api/wallet` | Staff có thể thấy nếu không kiểm soát quyền chặt | **Chỉ Owner/Billing Admin được thấy** | Phân định ranh giới tiền nạp app vs tiền học phí | **P0** | RBAC | Nhân viên quản lý thường (Staff) bị ẩn hoàn toàn |
| **12. Thông báo & Trợ giúp** | Đã hoàn thiện | `/notifications`, `/help` | Client state | Giao diện đã chuẩn Material UI | Cần kết nối webhook push notification thực tế | Lưu lịch sử thông báo chưa đọc/đã đọc | **P1** | Database | Hộp thư thông báo 4 phân loại, đánh dấu đã đọc |

---

## 2. PHÂN TÍCH GAP NGHIỆP VỤ & KỸ THUẬT LÕI CẦN BỔ SUNG NGAY

### Gap 1: Thiếu Trung tâm Hóa đơn & Chứng từ tập trung (`Document & Invoice Center`)
- **Vấn đề:** Hiện tại người dùng chỉ xem được danh sách hóa đơn thu tiền trong `/invoices`. Khi khách hàng yêu cầu gửi chứng từ biên nhận hoặc hỏi về hóa đơn điện tử, Owner không có nơi tra cứu tập trung.
- **Giải pháp:** Xây dựng phân hệ **Chứng từ & Biên nhận** với định chế rõ ràng:
  1. *Biên nhận nội bộ (Internal Receipt):* Có mã tra cứu, số tiền, tài khoản nhận, mã tham chiếu VietQR, tải PDF xem trước.
  2. *Hóa đơn điện tử (E-Invoice):* Hiển thị trạng thái "Chưa kết nối nhà cung cấp e-Invoice" trung thực, không giả lập tạo PDF hóa đơn đỏ có giá trị pháp lý.

### Gap 2: Thiếu Trung tâm Xuất dữ liệu tập trung (`Export Center`)
- **Vấn đề:** Việc xuất dữ liệu đang thực hiện đơn lẻ từng nút ở các trang mà không có bộ lọc kỳ, không chọn được định dạng (CSV, XLSX) và không có dữ liệu chuẩn bàn giao cho kế toán.
- **Giải pháp:** Xây dựng **Trung tâm Xuất Báo cáo & Bàn giao Kế toán** với bộ lọc ngày, chọn nhóm workspace, chọn định dạng và tải file thật về máy.

### Gap 3: AI Assistant chưa có các kịch bản nghiệp vụ chuyên sâu cho Owner
- **Vấn đề:** AI Assistant chỉ nhận câu hỏi tự do chung chung.
- **Giải pháp:** Bổ sung các phím tắt tác vụ nhanh (Quick Prompts):
  - "Những khoản nào quá hạn hơn 7 ngày?"
  - "Tóm tắt tình hình thu tiền tháng này."
  - "Soạn thảo tin nhắn Zalo nhắc nợ học phí/tiền trọ lịch sự."
  - "Danh sách giao dịch VietQR chưa khớp cần đối soát."
