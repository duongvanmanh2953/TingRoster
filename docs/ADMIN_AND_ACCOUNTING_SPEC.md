# TINGROSTER — BẢN ĐẶC TẢ HỆ THỐNG QUẢN TRỊ ADMIN TỔNG & BÁO CÁO TÀI CHÍNH KẾ TOÁN

---

## PHẦN I: MASTER PROMPT CHO TRANG ADMIN TỔNG (PLATFORM ADMIN)

### 1. Bối cảnh & Vai trò của Nền tảng TingRoster
TingRoster là hệ thống Multi-tenant SaaS dành cho 3 nhóm khách hàng quản lý chính tại Việt Nam:
1. **Chủ phòng trọ / căn hộ dịch vụ mini:** Quản lý tiền phòng, điện nước, dịch vụ và đối soát tự động khi khách thuê quét mã VietQR.
2. **Giáo viên dạy thêm & Trung tâm giáo dục:** Quản lý danh sách học sinh, điểm danh từng buổi, thu học phí định kỳ theo tháng hoặc theo số buổi học thực tế.
3. **Chủ câu lạc bộ thể thao (Pickleball, Cầu lông, Bóng đá, Gym):** Quản lý thành viên câu lạc bộ, quỹ sinh hoạt, tiền sân, nước uống và điểm danh các trận đấu.

### 2. Mô hình Kinh doanh & Chính sách Thu phí (SaaS Billing Model)
- **Đối tượng chịu phí duy trì:** **CHỈ CÓ NGƯỜI QUẢN LÝ** (Chủ trọ, Thầy cô giáo, Chủ CLB) mới cần duy trì nạp tiền vào Ví dịch vụ TingRoster để hệ thống vận hành. Học viên, phụ huynh hoặc khách thuê nhà **HOÀN TOÀN MIỄN PHÍ**, chỉ quét mã VietQR để thanh toán tiền hóa đơn.
- **Chính sách Dùng thử Miễn phí 30 ngày (1 Tháng):**
  - Mọi tài khoản người quản lý khi đăng ký mới được tự động kích hoạt **Gói Dùng Thử 30 Ngày (PRO Trial)** không giới hạn tính năng.
  - Sau 30 ngày dùng thử, tài khoản chuyển sang trạng thái duy trì: Người quản lý nạp tiền vào ví dịch vụ để trừ dần theo phí duy trì hàng tháng hoặc phí micro-fee cực rẻ (500đ/giao dịch đối soát tự động VietQR, 100đ/tin nhắn nhắc nợ).
  - Nếu số dư ví = 0đ sau khi hết hạn 30 ngày dùng thử, hệ thống tạm dừng tính năng tự động đối soát VietQR và bot nhắc nợ, dữ liệu danh sách học sinh/khách thuê và điểm danh vẫn được lưu trữ an toàn.

### 3. Master Prompt cấu hình cho Trang Admin Tổng
```markdown
Bạn là Kiến trúc sư trưởng và Chuyên gia Frontend/Backend thiết kế Trang Quản Trị Tổng (Platform Admin Dashboard) cho nền tảng SaaS TingRoster. Hãy triển khai trang Admin với các tiêu chí tối thượng sau:

1. KIẾN TRÚC & PHÂN QUYỀN:
   - Route bảo mật: `/admin` (yêu cầu quyền SUPER_ADMIN hoặc PLATFORM_OPERATOR).
   - Thiết kế giao diện theo phong cách Enterprise FinTech: Nền tối Deep Navy/Slate kết hợp thẻ sáng tương phản cao, chuẩn font 'Be Vietnam Pro', màu thương hiệu Royal Blue `#2538D9`.
   - Có cơ chế Switch View nhanh về Dashboard người dùng để kiểm tra thực tế.

2. CÁC KHỐI CHỨC NĂNG BẮT BUỘC TRÊN TRANG ADMIN:
   A. Khối Chỉ Số Kinh Doanh SaaS (SaaS Key Metrics & Financial Float):
      - GTV Toàn Hệ Thống (Gross Transaction Volume): Tổng giá trị tiền hóa đơn mà học sinh/khách thuê đã chuyển khoản qua VietQR thành công.
      - MRR (Monthly Recurring Revenue): Doanh thu phí phần mềm định kỳ hàng tháng từ các chủ trọ, thầy cô giáo.
      - Platform Float (Số dư ví dịch vụ đang lưu ký): Tổng số tiền mà các người quản lý đang nạp sẵn trong ví TingRoster.
      - Tỷ lệ Chuyển đổi Dùng thử (Trial-to-Paid Conversion Rate %): Đo lường hiệu quả chuyển đổi từ 30-day Free Trial sang trả phí duy trì.
      - Tỷ lệ Rời bỏ (Tenant Churn Rate %) và Doanh thu trung bình mỗi người quản lý (ARPU).

   B. Quản Trị Người Dùng & Quản Trị Dùng Thử 30 Ngày (Tenants & Free Trial):
      - Phân loại rõ ràng người dùng theo nhóm ngành nghề: 
        + [CHỦ NHÀ TRỌ]
        + [GIÁO VIÊN / TRUNG TÂM]
        + [CHỦ CLB THỂ THAO]
      - Bộ lọc theo trạng thái dùng thử và gói cước:
        + Đang Dùng Thử 30 Ngày (hiển thị số ngày còn lại: Trial Days Left)
        + Sắp Hết Hạn Dùng Thử (<= 5 ngày còn lại - gắn cảnh báo vàng)
        + Đã Chuyển Đổi Trả Phí (Paid Converted)
        + Hết Hạn Chưa Nạp Tiền (Expired / Grace Period)
      - Thao tác Admin đối với từng Tenant:
        + Thao tác Nạp tiền / Cộng số dư thưởng ví dịch vụ (Service Balance Topup) kèm lý do audit.
        + Nút "Gia hạn thêm 30 ngày dùng thử" hỗ trợ khách hàng tiềm năng.
        + Khóa / Mở khóa tài khoản (Suspend / Activate).
        + Xem chi tiết tài khoản ngân hàng thụ hưởng, số nhóm, số học viên/khách thuê.

   C. Quản Trị Hạ Tầng Kết Nối Ngân Hàng & Webhooks (Banking Gateways):
      - Giám sát trạng thái hoạt động (Uptime) và độ trễ phản hồi (Latency ms) của các cổng Napas 247, VietQR, SeABank, MBBank, Vietcombank, TPBank.
      - Tỷ lệ đối soát thành công (Webhook Success Rate %) theo thời gian thực (mục tiêu >= 99.9%).
      - Nút "Kiểm tra kết nối tức thì" (Live Health Ping) có phản hồi trạng thái ngay lập tức.

   D. Nhật Ký Kiểm Toán & An Toàn Bảo Mật (Audit Logs):
      - Ghi nhận chi tiết mọi hành vi quan trọng: Thay đổi số dư ví, nâng cấp gói, cấu hình webhook, truy cập IP.
```

---

## PHẦN II: PHÂN TÍCH BÁO CÁO CHUẨN KẾ TOÁN & PHÁP LUẬT VIỆT NAM CHO USER QUẢN LÝ

### 1. Căn Cứ Pháp Lý Hiện Hành
Việc quản lý tài chính của Chủ nhà trọ, Giáo viên dạy thêm/Trung tâm, và Chủ câu lạc bộ thể thao tại Việt Nam chịu sự điều chỉnh của các văn bản quy phạm pháp luật sau:

1. **Thông tư số 40/2021/TT-BTC & Thông tư 100/2021/TT-BTC của Bộ Tài chính:**
   - **Ngưỡng doanh thu tính thuế:** Cá nhân, hộ kinh doanh có doanh thu trong năm dương lịch từ **100.000.000 VNĐ trở xuống** thuộc đối tượng **KHÔNG PHẢI NỘP THUẾ GTGT VÀ THUẾ TNCN**.
   - **Khi doanh thu trên 100.000.000 VNĐ/năm**, người nộp thuế phải nộp thuế theo tỷ lệ % tính trên tổng doanh thu thực tế phát sinh:
     - **Đối với Hoạt động Cho thuê tài sản (Cho thuê phòng trọ, căn hộ, mặt bằng):**
       + Thuế Giá trị gia tăng (GTGT): **5%**
       + Thuế Thu nhập cá nhân (TNCN): **5%**
       + **Tổng nghĩa vụ thuế: 10% trên doanh thu**.
     - **Đối với Dịch vụ Giáo dục, Đào tạo, Dạy kèm học sinh:**
       + Thuế Giá trị gia tăng (GTGT): **5%**
       + Thuế Thu nhập cá nhân (TNCN): **2%**
       + **Tổng nghĩa vụ thuế: 7% trên doanh thu**.
     - **Đối với Dịch vụ Thể dục thể thao, Cho thuê sân bãi (Pickleball, Cầu lông, Gym):**
       + Thuế Giá trị gia tăng (GTGT): **5%**
       + Thuế Thu nhập cá nhân (TNCN): **2%**
       + **Tổng nghĩa vụ thuế: 7% trên doanh thu**.

2. **Thông tư số 88/2021/TT-BTC của Bộ Tài chính (Chế độ Kế toán Hộ kinh doanh):**
   - Hộ kinh doanh, cá nhân kinh doanh áp dụng các mẫu biểu chứng từ kế toán:
     - **Mẫu số 01-1/BK-HDKD:** Bảng kê hoạt động kinh doanh (kê khai doanh thu theo từng tháng/quý).
     - **Mẫu số S1-HKD:** Sổ chi tiết doanh thu bán hàng hóa, dịch vụ.
     - **Mẫu số S2-HKD:** Sổ theo dõi tình hình thanh toán tiền lương, tiền công và các khoản nợ.

3. **Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC:**
   - Quy định về hóa đơn điện tử, chứng từ và biên lai thu tiền. Mỗi phiếu thu tiền/học phí phải có: Mã số tra cứu giao dịch, ngày giờ thu, nội dung nộp tiền, số tiền ghi bằng số và bằng chữ, mã QR tra cứu tính minh bạch.

---

### 2. Danh Mục 5 Báo Cáo Bắt Buộc & Biểu Đồ Thống Kê Trên Trang User Thường (`/reports`)

#### Báo Cáo 1: Sổ Quỹ Tiền Gửi & Đối Soát Giao Dịch Ngân Hàng (Cash Flow & VietQR Reconciliation)
- **Ý nghĩa kế toán:** Phản ánh toàn bộ dòng tiền thực tế chảy vào tài khoản ngân hàng của người quản lý thông qua kênh chuyển khoản VietQR Napas 247.
- **Dữ liệu chi tiết:**
  - Ngày giờ ghi có (Timestamp).
  - Mã tham chiếu ngân hàng (Bank Reference / FT Number).
  - Người chuyển & Nội dung chuyển khoản (chứa mã thanh toán định danh ví dụ `TR1082`).
  - Số tiền thực nhận, trạng thái đối soát: `ĐÃ ĐỐI SOÁT 100%`, `THỪA TIỀN`, `THIẾU TIỀN`.
- **Biểu đồ thống kê:**
  - Biểu đồ cột chồng (Stacked Bar Chart): Dòng tiền thu theo tuần / tháng so sánh với kế hoạch mục tiêu.

#### Báo Cáo 2: Phân Tích Công Nợ & Bảng Phân Bổ Tuổi Nợ (Aging Receivables Schedule)
- **Ý nghĩa kế toán:** Tuân thủ nguyên tắc kế toán dồn tích (Accrual Basis). Phân loại chính xác các khoản nợ phải thu theo các nhóm thời gian để có biện pháp nhắc nợ kịp thời:
  1. *Chưa đến hạn (Current / Not due):* Hạn nộp còn hiệu lực.
  2. *Quá hạn 1 - 7 ngày (Overdue 1–7 days):* Giai đoạn nhắc nợ nhẹ nhàng qua Zalo/Telegram.
  3. *Quá hạn 8 - 30 ngày (Overdue 8–30 days):* Giai đoạn cảnh báo nhắc nợ mạnh mẽ.
  4. *Quá hạn trên 30 ngày (Overdue >30 days):* Nợ khó đòi, cần liên hệ trực tiếp phụ huynh hoặc khách thuê.
- **Biểu đồ thống kê:**
  - Biểu đồ Donut/Vành khuyên: Tỷ trọng các nhóm tuổi nợ trong tổng công nợ.

#### Báo Cáo 3: Báo Cáo Ước Tính Thuế Hộ/Cá Nhân Kinh Doanh (Tax Compliance Tracker - TT 40/2021)
- **Ý nghĩa pháp lý:** Giúp chủ trọ, giáo viên, chủ CLB chủ động tuân thủ nghĩa vụ thuế, không bị bất ngờ trước các đợt quyết toán thuế hoặc thanh tra của Chi cục Thuế địa phương.
- **Tính năng đặc thù:**
  - **Thanh đo doanh thu lũy kế năm:** Hiển thị vị trí doanh thu hiện tại so với mốc **100.000.000 VNĐ**.
  - **Thông báo trạng thái thuế tự động:**
    + Nếu doanh thu năm <= 100 triệu: *"Doanh thu chưa vượt ngưỡng 100 triệu VNĐ/năm. Bạn được MIỄN 100% thuế GTGT & TNCN."*
    + Nếu doanh thu năm > 100 triệu: *"Đã vượt ngưỡng miễn thuế. Ước tính số thuế phải nộp = [Doanh thu] x [7% hoặc 10%]."*
  - **Công cụ tính toán linh hoạt:** Chọn loại hình (Cho thuê nhà trọ: 10% | Dạy học & CLB thể thao: 7%) để tính thuế dự kiến ngay tức thì.

#### Báo Cáo 4: Báo Cáo Chuyên Cần & Đối Soát Buổi Học / Buổi Tập (Attendance Analytics)
- **Ý nghĩa thực tế:**
  - Đối với thầy cô giáo: Tính học phí theo số buổi đi học thực tế; phát hiện học sinh nghỉ quá 20% số buổi để gửi cảnh báo sớm cho phụ huynh.
  - Đối với chủ nhà trọ: Theo dõi sự hiện diện khách thuê, quản lý tạm trú tạm vắng theo quy định của Công an phường/xã.
  - Đối với CLB thể thao: Đánh giá tần suất tham gia của hội viên, tính toán chi phí sân bãi và nước uống công bằng.
- **Biểu đồ thống kê:**
  - Heatmap ma trận chuyên cần theo thứ trong tuần (T2 - CN).
  - Bảng danh sách học viên/hội viên vắng nhiều (Early Warning System).

#### Báo Cáo 5: Bảng Kê Doanh Thu & Xuất Phiếu Thu Điện Tử (Electronic Receipt & Export)
- **Chuẩn hóa biểu mẫu:** Cho phép người dùng kết xuất nhanh bảng kê doanh thu theo chuẩn biểu mẫu Thuế (Mẫu số 01-1/BK-HDKD) để nộp hồ sơ kê khai thuế khi có yêu cầu.
- **Phiếu thu điện tử có QR tra cứu:** Phụ huynh và khách thuê có thể quét mã QR trên biên lai để xem đối soát minh bạch từ cổng công khai `tingroster.vn/p/[token]`.

---

## PHẦN III: HƯỚNG DẪN TRIỂN KHAI VÀO HỆ THỐNG MÃ NGUỒN TINGROSTER

1. **Backend Route Handler (`/api/reports`):**
   - Tính toán lũy kế doanh thu năm của User.
   - Trả về ngưỡng thuế 100.000.000 VNĐ và mức thuế ước tính (7% và 10%).
   - Bổ sung lịch sử đối soát giao dịch VietQR Napas (Sổ quỹ tiền gửi).

2. **Backend Route Handler (`/api/admin`):**
   - Bổ sung trường `trialDaysLeft`, `trialStatus` (TRIAL_ACTIVE, TRIAL_EXPIRING, CONVERTED, EXPIRED).
   - Thêm API POST hỗ trợ: Thao tác nạp tiền số dư dịch vụ (`CREDIT_BALANCE`), gia hạn thêm 30 ngày dùng thử (`EXTEND_TRIAL`).
   - Mở rộng chỉ số kinh doanh: SaaS GTV, MRR, Uptime tỷ lệ đối soát.

3. **Giao diện Người dùng (`/reports` & `/billing`):**
   - Đầy đủ các Tab: Thu Tiền, Chuyên Cần, Tuổi Nợ, Sổ Quỹ VietQR, Ước Tính Thuế TT 40.
   - Thể hiện rõ chính sách 30 ngày dùng thử miễn phí và thông điệp: "Chỉ người quản lý mới cần duy trì nạp tiền ví dịch vụ, học sinh & khách thuê hoàn toàn miễn phí."
