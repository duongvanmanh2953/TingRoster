# TingRoster — Kiến Trúc Thông Tin & Điều Hướng (Giai đoạn B)

## 1. Sơ Đồ Điều Hướng Hệ Thống (Sitemap)

```text
TingRoster App
├── Public Portal (Không cần đăng nhập)
│   ├── /                          # Trang chủ giới thiệu sản phẩm & giải pháp
│   ├── /p/[slug]                  # Cổng phụ huynh: xem học phí, quét VietQR
│   └── /kiosk/[groupId]           # Chế độ Kiosk iPad đặt tại sân thể thao
│
├── Authentication
│   ├── /login                     # Đăng nhập
│   └── /register                  # Đăng ký tài khoản
│
└── Dashboard Workspace (Bảo vệ bởi Auth Session)
    ├── /onboarding                # Wizard dẫn dắt người dùng mới (7 bước)
    ├── /dashboard                 # Tổng quan: KPI thu phí, dòng tiền, cảnh báo
    │
    ├── Quản lý Vận hành
    │   ├── /groups                # Danh sách lớp học / câu lạc bộ
    │   │   └── /groups/[id]       # Chi tiết lớp: Tổng quan, Điểm danh, Thành viên, Học phí, Giao dịch
    │   ├── /attendance            # Sổ điểm danh ma trận hàng ngày (Daily Roster)
    │   └── /members/[id]          # Hồ sơ học viên: lịch sử điểm danh & hóa đơn
    │
    ├── Quản trị Tài chính
    │   ├── /invoices              # Trung tâm hóa đơn & tạo đợt thu hàng loạt
    │   └── /transactions          # Trung tâm đối soát ngân hàng & gán thủ công
    │
    ├── Phân tích & Tự động hóa
    │   ├── /reports               # Báo cáo doanh thu, tỷ lệ thu đúng hạn, công nợ
    │   └── /automations           # Trung tâm quy tắc tự động hóa & nhật ký
    │
    └── Hỗ trợ & Thiết lập
        ├── /help                  # Trung tâm trợ giúp: Hướng dẫn, FAQ, Glossary
        └── /settings              # Cài đặt tài khoản ngân hàng & Webhook SePay/Casso
```

---

## 2. Phân Cấp Trực Quan Trên Thanh Điều Hướng (Sidebar Hierarchy)

Sidebar được phân nhóm logic rõ ràng, tránh hiển thị một danh sách phẳng lộn xộn:

1. **Tổng Quan:**
   - Bảng điều khiển (`/dashboard`)
2. **Lớp Học & Thành Viên:**
   - Lớp & Câu lạc bộ (`/groups`)
   - Điểm danh hôm nay (`/attendance`)
3. **Thu Phí & Đối Soát:**
   - Phiếu thu & Đợt thu (`/invoices`)
   - Lịch sử đối soát (`/transactions`)
4. **Phân Tích & Mở Rộng:**
   - Báo cáo & Thống kê (`/reports`)
   - Tự động hóa (`/automations`)
5. **Hệ Thống:**
   - Hướng dẫn sử dụng (`/help`)
   - Cài đặt tài khoản (`/settings`)
