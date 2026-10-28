# TINGROSTER — TỔNG HỢP CĂN CỨ PHÁP LÝ & GIẢ ĐỊNH TUÂN THỦ (COMPLIANCE ASSUMPTIONS)

---

## 1. MỤC TIÊU VÀ TÍNH CHẤT PHÁP LÝ

Tài liệu này xác định các căn cứ pháp luật hiện hành và các giả định tuân thủ của nền tảng TingRoster tại thị trường Việt Nam. 
> **Lưu ý quan trọng:** Các báo cáo tài chính hiển thị trong Workspace App (`/reports`) là **Báo cáo Quản trị Vận hành Nội bộ**, không tự động thay thế tờ khai thuế chính thức hoặc báo cáo tài chính pháp định nếu chưa được kiểm toán viên hoặc cơ quan quản lý thuế xác nhận.

---

## 2. DANH MỤC CĂN CỨ PHÁP LUẬT VIỆT NAM

### 2.1. Pháp luật Kế toán & Quản lý Thuế
1. **Luật Kế toán số 88/2015/QH13:**
   - Quy định về tính trung thực, liên tục và bất biến của chứng từ, sổ kế toán.
   - Sổ cái tài khoản (`CreditLedgerEntry`) và sổ giao dịch (`Transaction`) tuân thủ nguyên tắc không được xóa sửa hồi tố (append-only ledger).
2. **Luật Quản lý thuế số 108/2025/QH15 & Luật Quản lý thuế số 38/2019/QH14:**
   - Quy định về thời hạn kê khai, trách nhiệm giải trình và lưu trữ dữ liệu giao dịch điện tử tối thiểu 5–10 năm.
3. **Luật Thuế Giá trị gia tăng (GTGT) số 48/2024/QH15 & Luật sửa đổi số 149/2025/QH15:**
   - Xác định biểu thuế suất GTGT cho các loại hình dịch vụ phần mềm SaaS, dịch vụ giáo dục và hoạt động cho thuê tài sản.

### 2.2. Chế độ Thuế & Kế toán cho Hộ/Cá nhân kinh doanh
1. **Thông tư số 40/2021/TT-BTC & Thông tư 100/2021/TT-BTC của Bộ Tài chính:**
   - **Ngưỡng doanh thu tính thuế:** Cá nhân/hộ kinh doanh có doanh thu trong năm dương lịch từ **100.000.000 VNĐ trở xuống** được **MIỄN 100% THUẾ GTGT VÀ THUẾ TNCN**.
   - **Tỷ lệ thuế tính trên doanh thu (đối với doanh thu > 100 triệu):**
     * *Dịch vụ giáo dục, dạy học thêm, CLB thể dục thể thao:* 5% thuế GTGT + 2% thuế TNCN = **Tổng 7%**.
     * *Hoạt động cho thuê tài sản (nhà trọ, phòng trọ, căn hộ mini):* 5% thuế GTGT + 5% thuế TNCN = **Tổng 10%**.
   - **Biểu mẫu áp dụng:** Bảng kê hoạt động kinh doanh theo **Mẫu số 01-1/BK-HDKD**.
2. **Thông tư số 88/2021/TT-BTC:** Chế độ kế toán cho hộ, cá nhân kinh doanh (Mẫu sổ S1-HKD theo dõi doanh thu, Mẫu S2-HKD theo dõi công nợ).

### 2.3. Hóa đơn, Chứng từ Điện tử & Nghị định mới
1. **Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC (kèm cập nhật Nghị định 254/2026/NĐ-CP & Thông tư 91/2026/TT-BTC):**
   - Quy định về việc xuất hóa đơn điện tử, chứng từ thu tiền có mã của cơ quan thuế hoặc biên lai thu tiền điện tử có mã tra cứu công khai.
   - Khi chưa kết nối trực tiếp với nhà cung cấp hóa đơn điện tử (VNPT-Invoice, Viettel, MISA meInvoice), TingRoster hiển thị **Phiếu thu điện tử có QR tra cứu đối soát minh bạch**. Không giả mạo hóa đơn VAT có mã cơ quan thuế.

### 2.4. Bảo vệ Dữ liệu Cá nhân & Quyền Riêng Tư
1. **Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15 & Nghị định 356/2025/NĐ-CP (cùng Nghị định 13/2023/NĐ-CP):**
   - **Nguyên tắc Tối thiểu hóa dữ liệu (Data Minimization):** Chỉ thu thập tên, số điện thoại cần thiết để phục vụ điểm danh và gạch nợ học phí.
   - **Bảo vệ học viên nhỏ tuổi:** Thông tin liên lạc ưu tiên lưu trữ SĐT phụ huynh, bảo vệ bí mật đời sống cá nhân trẻ em.
   - **Bảo mật hiển thị:** Che mờ số điện thoại trên giao diện công cộng, mã hóa token thanh toán, không công khai công nợ của học sinh này cho học sinh khác thấy.

---

## 3. GIẢ ĐỊNH KINH DOANH VÀ CHÍNH SÁCH 30 NGÀY DÙNG THỬ

1. **Dùng thử 30 ngày (Free Trial):**
   - Tặng 30 ngày dùng thử PRO hoặc nạp sẵn số dư trải nghiệm khi khởi tạo workspace.
   - Trial kết thúc KHÔNG tự động trừ tiền trong thẻ tín dụng nếu không có sự đồng thuận rõ ràng từ người dùng.
   - Hết hạn trial: Tài khoản chuyển sang trạng thái chờ nạp tiền duy trì, dữ liệu học viên/lớp học vẫn được bảo toàn nguyên vẹn, không bị xóa.
2. **Chính sách Thu phí Người quản lý:**
   - Chỉ có chủ workspace mới cần nạp tiền duy trì dịch vụ sau thời hạn dùng thử.
   - Người học, phụ huynh, khách thuê phòng được sử dụng cổng thanh toán VietQR Napas 24/7 hoàn toàn miễn phí.
