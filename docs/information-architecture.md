# TINGROSTER — KIẾN TRÚC THÔNG TIN & PHÂN CHIA HỆ THỐNG (INFORMATION ARCHITECTURE)

---

## 1. NGUYÊN TẮC PHÂN TÁCH HAI HỆ THỐNG RIÊNG BIỆT

Sản phẩm TingRoster bao gồm hai không gian phần mềm hoàn toàn riêng biệt về đối tượng người dùng, quyền hạn, mục tiêu vận hành và kiến trúc điều hướng:

```
                                  TINGROSTER PLATFORM
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 │                                                   │
        [ HỆ THỐNG 1 ]                                      [ HỆ THỐNG 2 ]
        WORKSPACE APP                                       PLATFORM ADMIN CONSOLE
  (Chủ lớp, Chủ trọ, Chủ CLB)                         (Đội ngũ Điều hành TingRoster)
  URL: /dashboard, /members, /reports...              URL: /admin
```

---

## 2. HỆ THỐNG 1: WORKSPACE APP (ỨNG DỤNG VẬN HÀNH HÀNG NGÀY)

Hệ thống menu chính gồm đúng **12 phân hệ nghiệp vụ** được tổ chức khoa học:

1. **Tổng quan (`/dashboard`):** Bàn làm việc trung tâm với 4 KPI tối cao, Biểu đồ doanh thu & Dòng tiền theo thời gian, Cơ cấu khoản thu, Phân bổ tuổi nợ, Action Queue (Việc cần làm ngay), và Lịch sử hoạt động.
2. **Workspace / Cơ sở (`/groups`):** Quản lý các nhóm, lớp học dạy thêm, khu phòng trọ hoặc các chi nhánh câu lạc bộ thể thao.
3. **Thành viên (`/members`):** Hồ sơ học viên, người thuê phòng trọ hoặc hội viên CLB; theo dõi lịch sử chuyên cần và trạng thái công nợ từng cá nhân.
4. **Điểm danh & Lịch biểu (`/attendance` & `/calendar`):** Ma trận điểm danh 1 chạm (Có mặt / Vắng / Nghỉ phép / Học bù), lịch dạy và lịch kiểm tra.
5. **Khoản thu & Công nợ (`/invoices`):** Tạo hóa đơn học phí/tiền trọ hàng loạt, cấp mã thanh toán `TRxxxxx`, mã QR VietQR động.
6. **Giao dịch & Đối soát (`/transactions`):** Lịch sử các giao dịch ngân hàng Napas 24/7 ghi có tự động, thuật toán đối soát gạch nợ tự động trong 0.2s.
7. **Trung tâm Báo cáo (`/reports`):** 5 báo cáo quản trị vận hành (Dòng tiền thực thu vs Doanh thu ghi nhận, Chuyên cần & Heatmap, Tuổi nợ 4 buckets, Ước tính thuế TT 40/2021, Sổ quỹ VietQR).
8. **AI & Tự động hóa (`/automations` & `/ai-assistant`):** Cấu hình bot nhắc nợ tự động qua Zalo ZNS / Telegram, trích xuất danh sách học sinh bằng AI OCR từ ảnh chụp sổ tay.
9. **Gói dịch vụ & Số dư TingRoster (`/billing`):** **CHỈ HIỂN THỊ CHO OWNER HOẶC BILLING ADMIN.** Quản lý số dư ví dịch vụ TingRoster (Prepaid credits), lịch sử trừ phí webhook/SMS, thông tin 30 ngày dùng thử miễn phí.
10. **Thông báo (`/notifications`):** Hộp thư cảnh báo hệ thống, biến động số dư, nhắc nhở công việc.
11. **Trợ giúp & Hướng dẫn (`/help`):** Hướng dẫn kết nối tài khoản ngân hàng, tạo mã VietQR, tài liệu sử dụng.
12. **Cài đặt (`/settings`):** Cấu hình tài khoản ngân hàng thụ hưởng (MBBank, Vietcombank...), thông tin cơ sở, mẫu tin nhắn Zalo.

---

## 3. HỆ THỐNG 2: PLATFORM ADMIN CONSOLE (TRUNG TÂM QUẢN TRỊ NỀN TẢNG)

Dành riêng cho đội ngũ vận hành TingRoster tại route `/admin`, bao gồm các nhóm quản trị:

- **Executive Overview & Action Queue:** Giám sát toàn cảnh sức khỏe doanh nghiệp SaaS (Tenants, Active, Trials, MRR, Platform Float, Uptime).
- **Quản trị Tenants & Workspaces:** Tra cứu toàn bộ cơ sở, lọc theo loại hình (Chủ nhà trọ, Giáo viên, CLB thể thao), xem số dư ví dịch vụ, tài khoản ngân hàng liên kết.
- **Quản trị Dùng thử 30 ngày (Trial Management):** Funnel chuyển đổi dùng thử, danh sách cơ sở sắp hết hạn, công cụ gia hạn thêm 30 ngày dùng thử có lưu lý do và audit log.
- **Quản trị Nạp tiền & Sổ cái Ví Nền tảng (Top-up & Credit Ledger):** Duyệt nạp tiền, điều chỉnh số dư ví dịch vụ, sổ cái bất biến append-only.
- **Giám sát Webhook Ngân hàng (Customer Collections Pipeline):** Giám sát lưu lượng Webhook VietQR Napas, độ trễ phản hồi (ms), tỷ lệ đối soát thành công (99.98%).
- **Hỗ trợ, Rủi ro & An ninh:** Quản lý ticket khiếu nại, phát hiện spam webhook hoặc lạm dụng API, Audit log chi tiết từng hành vi quản trị.
