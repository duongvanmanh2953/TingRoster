# KIẾN TRÚC THÔNG TIN DÀNH CHO OWNER (OWNER INFORMATION ARCHITECTURE)

Tài liệu này xác định bản đồ điều hướng tổng thể của Workspace App, được thiết kế tối ưu hóa cho **Chủ cơ sở (Workspace Owner)** nhằm quản lý hoạt động vận hành, tài chính và nhân sự một cách mượt mà nhất.

---

## 1. BẢN ĐỒ ĐIỀU HƯỚNG TỔNG THỂ (SITEMAP)

```text
TINGROSTER WORKSPACE APP (OWNER CONSOLE)
├── 1. Tổng quan (/dashboard)
│   ├── KPI Header (4 chỉ số tối cao)
│   ├── Hàng đợi việc cần xử lý ngay (Task Center)
│   ├── Biểu đồ dòng tiền thu & aging công nợ
│   └── Hoạt động gần đây (Audit Activity Feed)
├── 2. Quản lý Workspace (/groups)
│   ├── Danh sách Lớp học / Dãy trọ / CLB
│   └── Chi tiết Workspace (/groups/[id])
│       ├── Tab Tổng quan
│       ├── Tab Thành viên
│       ├── Tab Điểm danh & Lịch
│       ├── Tab Khoản thu & Công nợ
│       └── Tab Cài đặt nhóm
├── 3. Quản lý Thành viên (/members)
│   ├── Danh sách học viên / Khách thuê
│   ├── Hồ sơ chi tiết (/members/[id])
│   ├── Import danh sách (CSV / Excel preview)
│   └── Xuất danh bạ theo quyền
├── 4. Lịch & Hoạt động (/calendar & /attendance)
│   ├── Lịch học / Lịch tập / Lịch thu tiền
│   ├── Bảng điểm danh một chạm
│   └── Lịch sử và tỷ lệ chuyên cần
├── 5. Khoản thu & Công nợ (/invoices)
│   ├── Danh sách đợt thu & hóa đơn
│   ├── Tạo khoản thu đơn lẻ / Tạo hàng loạt
│   ├── Quản lý công nợ theo aging buckets
│   └── Lịch sử gửi tin nhắc phí (Zalo ZNS / SMS)
├── 6. Giao dịch & Đối soát VietQR (/transactions)
│   ├── Lịch sử biến động số dư ngân hàng
│   ├── Giao dịch chưa khớp nội dung (Unmatched)
│   └── Đối soát và gán nợ thủ công có audit
├── 7. Hóa đơn & Chứng từ Tài liệu (/documents) [NEW]
│   ├── Tab Tất cả chứng từ
│   ├── Tab Biên nhận thu tiền nội bộ (Internal Receipts)
│   ├── Tab Chứng từ thanh toán ngân hàng (Payment Proofs)
│   └── Cổng kết nối Hóa đơn điện tử (e-Invoice Status)
├── 8. Báo cáo Chuyên sâu (/reports)
│   ├── Báo cáo dòng tiền thu
│   ├── Báo cáo công nợ quá hạn
│   ├── Báo cáo chuyên cần học tập
│   ├── Báo cáo phòng trọ & tỷ lệ lấp đầy
│   └── Báo cáo câu lạc bộ & hội viên
├── 9. Trung tâm Xuất dữ liệu (/export) [NEW]
│   ├── Xuất danh sách thành viên
│   ├── Xuất lịch sử điểm danh
│   ├── Xuất chi tiết các khoản thu
│   └── Xuất Dữ liệu bàn giao kế toán (CSV/Excel)
├── 10. AI & Tự động hóa (/ai-assistant & /automations)
│   ├── AI Operations Workbench (Hỏi đáp dòng tiền & nợ)
│   ├── Soạn thảo lời nhắc nợ lịch sự
│   └── Cấu hình bot tự động hóa nhắc phí
├── 11. Gói dịch vụ & Số dư TingRoster (/billing) [OWNER-ONLY]
│   ├── Trạng thái Dùng thử 30 ngày (Free Trial)
│   ├── Số dư ví dịch vụ TingRoster (Platform Credits)
│   ├── Đơn nạp tiền duy trì (Top-Up VietQR)
│   └── Quản lý nâng cấp gói cước PRO
├── 12. Hộp thư Thông báo (/notifications)
│   ├── Thông báo thanh toán thành công
│   ├── Cảnh báo giao dịch chưa khớp
│   └── Nhắc nhở vận hành & an ninh
├── 13. Trung tâm Trợ giúp (/help)
│   ├── Hướng dẫn kết nối VietQR SePay/Casso
│   ├── Câu hỏi thường gặp (FAQ)
│   └── Kênh hỗ trợ kỹ thuật trực tiếp
└── 14. Cài đặt Cơ sở (/settings)
    ├── Hồ sơ cơ sở & Tên thương hiệu
    ├── Cấu hình tài khoản ngân hàng nhận tiền
    ├── Quản lý nhân viên & Phân quyền (RBAC)
    └── Mẫu nội dung thông báo Zalo/SMS
```

---

## 2. QUY TẮC HIỂN THỊ THEO NGÀNH NGHỀ & QUYỀN HẠN

1. **Thích ứng theo loại hình cơ sở:**
   - Khi cơ sở đăng ký loại hình **Lớp học / Gia sư**, nhãn hiển thị là "Học viên", "Điểm danh buổi học", "Học phí".
   - Khi cơ sở là **Nhà trọ / Cho thuê**, nhãn hiển thị là "Phòng trọ", "Khách thuê", "Tiền phòng & Điện nước", "Hạn hợp đồng".
   - Khi cơ sở là **CLB Thể thao**, nhãn hiển thị là "Hội viên", "Gói tập", "Lượt check-in", "Khung giờ tập".

2. **Bảo vệ quyền hạn Owner & Billing Admin:**
   - Mục `/billing` (Gói dịch vụ & Số dư ví TingRoster) hoàn toàn ẩn khỏi Sidebar đối với nhân viên (Staff / Manager) để tránh lộ thông tin cước phí nội bộ của chủ cơ sở.
