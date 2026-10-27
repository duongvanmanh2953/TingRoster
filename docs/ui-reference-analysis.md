# Phân Tích Thiết Kế Giao Diện UI/UX Tham Chiếu — TingRoster

> Tài liệu phân tích đối chiếu từ ảnh tham chiếu tổng quan `00-overview.png`, 5 ảnh chi tiết chuyên sâu mới cập nhật (`FiscalPro Dashboard`, `Pulse Analytics`, `Untitled UI Members`, `Skolaro Attendance`, `Olvy Member Detail`) và tài liệu đặc tả `TINGROSTER_UI_UX_MASTER_PROMPT.md`.

---

## 1. Tình Trạng & Đối Chiếu Tài Nguyên Hình Ảnh

### 1.1. Ảnh tổng quan `00-overview.png`
- Thể hiện kiến trúc tổng thể của 10 phân hệ SaaS TingRoster, định vị phong cách Light Theme, Canvas `#F5F7FB`, Sidebar Dark Navy `#0B0F19`, Primary Royal Blue `#2538D9`.

### 1.2. Phân tích trực quan 5 ảnh tham chiếu chuyên sâu mới:
1. **Ảnh 1 — FiscalPro Dashboard (Bảng giao dịch tài chính & KPI):**
   - Bố cục 4 thẻ KPI tài chính sắc nét: Icon tròn, chỉ số lớn, badge tăng trưởng xanh/đỏ rõ ràng.
   - Bảng **Recent Transactions** với tiêu đề phân cấp mạnh, nút "View all" ở góc phải, các cột `INVOICE`, `CLIENT`, `AMOUNT`, `STATUS`, `DATE`.
   - Trạng thái thanh toán dạng pill bo tròn: `Paid` (xanh ngọc nhạt), `Pending` (vàng nhạt), `Overdue` (đỏ hồng nhạt).
2. **Ảnh 2 — Pulse Analytics (Dashboard SaaS cao cấp):**
   - Tích hợp micro sparkline bar chart trong từng thẻ KPI.
   - Biểu đồ tăng trưởng doanh thu 2 đường cong gradient kèm đường gióng hover và tooltip tương tác.
   - Donut chart phân bổ nguồn thu gọn gàng với legend tỷ lệ phần trăm rõ nét.
3. **Ảnh 3 — Untitled UI Members (Quản lý thành viên chuẩn quốc tế):**
   - **Thanh KPI ngang 5 số:** `128 Members`, `36 Guests`, `8 Pending`, `872 Seats`, `0 Archived`.
   - Thanh lọc gồm Search input và Dropdown `Member type: View all`, kèm 2 nút CTA `+ Invite members` và `Export CSV`.
   - Bảng dữ liệu có Avatar, tên, email, đa nhãn phân loại (Admin, Billing owner, Pending), menu 3 chấm thao tác và phân trang dưới chân.
4. **Ảnh 4 — Skolaro Attendance (Ma trận điểm danh học sinh & CLB):**
   - Hàng tóm tắt số liệu ngày: `Total Present`, `Total Absent`, `Total Leave`, `Percentage %`.
   - Bộ chọn ngày và bộ chọn lớp học.
   - Nút hành động nổi bật: `Mark Attendance`.
   - Ma trận trạng thái theo ngày: Ô màu xanh `P` (Có mặt), đỏ `A` (Vắng), xanh dương `H` (Nghỉ phép).
5. **Ảnh 5 — Olvy User Details (Hồ sơ cá nhân & Dòng thời gian hoạt động):**
   - Bố cục 2 cột: Cột trái chứa các thẻ chi tiết người dùng; Cột phải chứa dòng thời gian dọc (Activity Timeline) với các mốc ngày tháng (`Mar 14`, `Feb 21`...) thể hiện lịch sử điểm danh, nộp tiền và ghi chú kiểm toán.

---

## 2. Design System Đồng Bộ

- **Màu sắc:** Canvas `#F5F7FB`, Surface `#FFFFFF`, Border `#E4E7EC`, Brand `#2538D9`, Accent `#6D5CE8`.
- **Trạng thái tài chính (AGENTS.md):**
  - Chưa đóng: `bg-rose-50 text-rose-700 border-rose-200`
  - Đóng thiếu / Cần xử lý: `bg-amber-50 text-amber-700 border-amber-200`
  - Đã đóng đủ: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Đóng thừa: `bg-blue-50 text-blue-700 border-blue-200`
- **Font chữ:** `Be Vietnam Pro` (weights: 400, 500, 600, 700, 800) với `font-feature-settings: "tnum" 1` cho số tiền VND.

---

## 3. Bản Đồ Ánh Xạ Route & Kế Hoạch Triển Khai

| Phân hệ | Route Codebase | Ảnh Tham Chiếu Trực Tiếp | Trọng tâm thiết kế & Trạng thái |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `src/app/(dashboard)/dashboard/page.tsx` | FiscalPro & Pulse | 4 KPI, biểu đồ doanh thu, donut lớp, 3 feeds nghiệp vụ, mô phỏng Ting! • **Đã hoàn thành** |
| **Lớp học / CLB** | `src/app/(dashboard)/groups/page.tsx` | 00-overview & Pulse | Thẻ lớp học, học phí, sĩ số, switch Card/Table, Drawer tạo lớp • **Đã hoàn thành** |
| **Thành viên** | `src/app/(dashboard)/members/page.tsx` | Untitled UI (Members) | KPI strip 5 số, bảng dữ liệu, lọc lớp, trạng thái nợ, pagination • **Đã hoàn thành** |
| **Điểm danh** | `src/app/(dashboard)/attendance/page.tsx` | Skolaro Attendance | Matrix P/A/L/T, tóm tắt sĩ số/chuyên cần, dải tuần 7 ngày, lưu 1 chạm • **Đã hoàn thành** |
| **Chi tiết học viên** | `src/app/(dashboard)/members/[id]/page.tsx` | Olvy User Details | 2 cột: Thông tin học viên + Timeline điểm danh & đóng học phí • **Sẵn sàng** |
| **Học phí & Hóa đơn** | `src/app/(dashboard)/invoices/page.tsx` | FiscalPro Table | Bảng hóa đơn, tạo hàng loạt, trạng thái nợ, xuất biên nhận • **Sẵn sàng** |
| **VietQR Public Portal** | `src/app/p/[token]/page.tsx` | 00-overview Screen 7 | Mobile-first, VietQR chuẩn MB, copy số TK/nội dung, hướng dẫn 4 bước • **Sẵn sàng** |
| **Kiosk tại sân** | `src/app/kiosk/page.tsx` | 00-overview Screen 8 | Full-screen Dark Navy, check-in 1s, chuông Ting báo thành công • **Sẵn sàng** |
| **Đối soát VietQR** | `src/app/(dashboard)/transactions/page.tsx` | 00-overview Screen 9 | Giao diện 2 cột đối soát ngân hàng - hóa đơn, phát hiện thừa/thiếu • **Sẵn sàng** |

---

## 4. Nhật Ký Triển Khai Thực Tế

### Đợt 1: Khóa Design System & Dashboard Tổng Quan
- Chuẩn hóa typography font `Be Vietnam Pro` tiếng Việt, cấu hình `tnum` cho số tiền VND.
- Đưa toàn bộ theme sang Light Productivity SaaS (Canvas `#F5F7FB`, Surface `#FFFFFF`, Border `#E4E7EC`, Sidebar Dark Navy `#0B0F19`).
- Xây dựng Dashboard hoàn chỉnh với 4 KPI tài chính, 2 biểu đồ phân bổ, danh sách sắp đến hạn và 3 khối dữ liệu nghiệp vụ hành động.

### Đợt 2: Quản Lý Lớp Học, Thành Viên & Điểm Danh 1 Chạm
1. **Quản lý lớp học & CLB ([src/app/(dashboard)/groups/page.tsx](file:///c:/Users/manhd/Downloads/TingRoster/src/app/(dashboard)/groups/page.tsx)):**
   - 4 Thẻ KPI: Tổng số lớp, Đang hoạt động, Sĩ số học viên, Tình trạng cổng QR.
   - Chế độ hiển thị linh hoạt Card View / Table View.
   - Thẻ lớp học hiển thị học phí, sĩ số, sao chép nhanh link cổng phụ huynh `/p/[slug]`.
   - Modal tạo lớp mới với tự động sinh slug tiếng Việt chuẩn SEO.
2. **Quản lý thành viên ([src/app/(dashboard)/members/page.tsx](file:///c:/Users/manhd/Downloads/TingRoster/src/app/(dashboard)/members/page.tsx)):**
   - Dải KPI 5 số liệu theo đúng mẫu tham chiếu **Untitled UI (Members)**: Tổng học viên, Đang hoạt động, Chưa đóng học phí, Đã nộp đủ, Tỷ lệ chuyên cần.
   - Bảng dữ liệu chuyên nghiệp: Avatar, tên, SĐT bảo mật, badge lớp, badge trạng thái tài chính chuẩn `AGENTS.md`, số buổi chuyên cần, phân trang và menu thao tác.
   - Nâng cấp API backend [src/app/api/members/route.ts](file:///c:/Users/manhd/Downloads/TingRoster/src/app/api/members/route.ts) để hỗ trợ tìm kiếm và liên kết hóa đơn.
3. **Điểm danh 1 chạm ([src/app/(dashboard)/attendance/page.tsx](file:///c:/Users/manhd/Downloads/TingRoster/src/app/(dashboard)/attendance/page.tsx)):**
   - Áp dụng chuẩn **Skolaro Attendance** & `00-overview.png`:
   - Dải lịch tuần 7 ngày chọn nhanh, nút Ngày trước / Ngày sau / Hôm nay.
   - Hàng tóm tắt sĩ số: Sĩ số lớp, Có mặt (P), Vắng mặt (A), Nghỉ phép (L), Tỷ lệ chuyên cần %.
   - Bảng học sinh với bộ nút chọn 1-chạm (Có mặt / Vắng / Phép / Học bù) lưu trực tiếp vào cơ sở dữ liệu với phản hồi tức thì.
   - Nút hành động nhanh: "Điểm danh cả lớp Có mặt" hàng loạt qua Prisma Transaction.
