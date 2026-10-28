# TINGROSTER — RANH GIỚI VÀ PHÂN ĐỊNH HAI MIỀN TÀI CHÍNH (FINANCIAL DOMAIN BOUNDARIES)

---

## 1. NGUYÊN TẮC CỐT LÕI VÀ BẤT DI BẤT DỊCH

Trong hệ thống SaaS TingRoster, tồn tại **HAI MIỀN TÀI CHÍNH HOÀN TOÀN TÁCH BIỆT** về bản chất pháp lý, luồng tiền và ghi nhận kế toán. Tuyệt đối **KHÔNG ĐƯỢC PHÉP CỘNG GỘP**, bù trừ chéo, hoặc sử dụng dữ liệu của miền này để báo cáo cho miền kia.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HỆ THỐNG TINGROSTER                                    │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│       MIỀN A: PLATFORM CREDITS & LEDGER   │    MIỀN B: CUSTOMER COLLECTIONS & RECEIV.  │
│         (Dòng tiền SaaS của TingRoster)   │        (Dòng tiền của Chủ Lớp/Chủ Trọ)     │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Chủ tài khoản nạp tiền mua credit       │ • Học sinh / Khách thuê nộp tiền học/phòng │
│ • Dùng trừ phí dịch vụ phần mềm           │ • Chuyển TRỰC TIẾP vào STK của Chủ cơ sở   │
│ • TingRoster thu tiền vào tài khoản cty   │ • TingRoster KHÔNG GIỮ TIỀN NÀY (Zero Cust)│
│ • Ghi nhận Doanh thu SaaS cho TingRoster  │ • Ghi nhận Thu nhập cho Chủ Lớp/Chủ Trọ    │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. MIỀN A: PLATFORM CREDITS & LEDGER (TIỀN NẠP VÍ DỊCH VỤ SAAS)

### 2.1. Bản chất nghiệp vụ
- **Chủ thể nộp tiền:** Người quản lý workspace (Chủ nhà trọ, Giáo viên, Chủ CLB thể thao).
- **Mục đích:** Nạp sẵn số dư vào Ví dịch vụ TingRoster (Prepaid Service Credits) để hệ thống tự động trừ dần khi phát sinh dịch vụ:
  * Phí xử lý Webhook VietQR tự động: 50 đ/giao dịch.
  * Phí tin nhắn Zalo ZNS / SMS nhắc nợ: 200 đ/tin.
  * Phí trích xuất danh sách bằng AI OCR: 500 đ/lần.
  * Phí duy trì gói cước hàng tháng (sau khi hết 30 ngày dùng thử miễn phí).
- **Tài khoản thụ hưởng:** Tài khoản ngân hàng công ty của Nền tảng TingRoster.

### 2.2. Ghi nhận kế toán & Bút toán sổ cái (Credit Ledger)
- **Khi khách hàng nạp tiền (Top-up):** Tiền thực tế vào tài khoản TingRoster được ghi nhận là **Khoản nợ phải trả dịch vụ (Khách hàng trả tiền trước - Doanh thu chưa thực hiện)**. Đây **CHƯA PHẢI LÀ DOANH THU ĐƯỢC GHI NHẬN**.
- **Khi dịch vụ được sử dụng (Service Consumption):** Mỗi khi webhook đối soát thành công hoặc tin nhắn ZNS được gửi, hệ thống trừ credit và ghi nhận **Doanh thu cung cấp dịch vụ phần mềm (SaaS Revenue)** thực tế.
- **Tính chất kỹ thuật của Sổ cái (Ledger):**
  * Sổ cái `CreditLedgerEntry` là **Append-only (Chỉ ghi thêm, bất biến)**.
  * Tuyệt đối không xóa (`DELETE`), không sửa (`UPDATE`) các dòng bút toán lịch sử.
  * Mọi sai sót hoặc hoàn tiền phải được ghi nhận bằng dòng bút toán đảo (`REVERSAL` hoặc `ADJUSTMENT`) có liên kết tới `referenceId` của bút toán gốc.

---

## 3. MIỀN B: CUSTOMER COLLECTIONS (TIỀN HỌC PHÍ / TIỀN THUÊ NHÀ CỦA CHỦ CƠ SỞ)

### 3.1. Bản chất nghiệp vụ
- **Chủ thể nộp tiền:** Học sinh, phụ huynh, người thuê phòng trọ, hội viên CLB thể thao.
- **Chủ thể nhận tiền:** Số tài khoản ngân hàng cá nhân hoặc hộ kinh doanh của Chủ workspace (Ví dụ: MBBank, Techcombank, Vietcombank...).
- **Vai trò của TingRoster:**
  * TingRoster **KHÔNG PHẢI LÀ TRUNG GIAN THANH TOÁN (Non-custodial)**.
  * TingRoster không thu tiền học sinh, không giữ tiền hộ (Zero-escrow / Zero-float đối với tiền học phí).
  * Tiền chuyển trực tiếp từ tài khoản học sinh sang tài khoản chủ cơ sở qua kênh liên ngân hàng Napas 247.
  * TingRoster chỉ đóng vai trò là **Công cụ phần mềm tự động hóa đối soát**: Nhận webhook biến động số dư từ ngân hàng và gạch nợ hóa đơn tương ứng.

### 3.2. Báo cáo & Doanh thu của Chủ cơ sở
- **Tổng phải thu (Accrual Receivables):** Tổng giá trị học phí / tiền phòng phát sinh theo kỳ trên các hóa đơn chưa hủy.
- **Đã thu (Cash-in):** Tiền thực tế học sinh đã chuyển khoản thành công vào tài khoản của chủ cơ sở.
- **Còn nợ & Tuổi nợ (Aging Receivables):** Số tiền học sinh chưa đóng, phân theo khung quá hạn (1-7 ngày, 8-30 ngày, >30 ngày).

---

## 4. BẢNG PHÂN ĐỊNH RỦI RO & QUY TẮC BẢO VỆ DỮ LIỆU

| Tiêu chí | Miền A: Platform Credits (TingRoster) | Miền B: Customer Collections (Khách hàng) |
| :--- | :--- | :--- |
| **Ai nộp tiền?** | Chủ cơ sở (Giáo viên, Chủ trọ, Chủ CLB) | Học viên, phụ huynh, người thuê trọ |
| **Tiền chảy về đâu?** | Tài khoản công ty TingRoster | Tài khoản riêng của Chủ cơ sở |
| **Doanh thu của ai?** | Doanh thu phần mềm của TingRoster | Doanh thu hoạt động của Chủ cơ sở |
| **Tác động đến GMV / GTV?** | Là Platform Revenue (MRR / ARR) | Là System GMV (Tổng giá trị xử lý qua QR) |
| **Quyền truy cập trên UI?** | **CHỈ Owner / Billing Admin** | Toàn bộ nhân viên được phân quyền lớp |
| **Chính sách dùng thử 30 ngày?** | Được tặng 30 ngày miễn phí hoặc ví trải nghiệm | Không ảnh hưởng; học sinh luôn chuyển khoản 0đ phí |
