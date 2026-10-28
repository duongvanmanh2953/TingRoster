# TINGROSTER — BÁO CÁO TOÀN DIỆN AUDIT UI/UX, DESIGN SYSTEM & HỆ THỐNG IN ẤN

**Phiên bản:** 2.0.0 — Định hướng SaaS B2B Thương Mại Chuyên Nghiệp  
**Bộ tiêu chuẩn áp dụng:** Nielsen's Usability Heuristics, WCAG 2.2 AA, Impeccable Craft Floor, Frontend Design System, Vercel React Best Practices.

---

## 1. KHẢO SÁT HỆ THỐNG VÀ BẢN ĐỒ ROUTE THỰC TẾ

Toàn bộ hệ thống định tuyến (Next.js App Router) được trích xuất từ source code thực tế:

### 1.1. Owner Workspace App (`/(dashboard)/*`)
- `/dashboard`: Trung tâm chỉ huy vận hành, tổng hợp KPI tài chính, lớp học, phòng trọ và cảnh báo.
- `/groups`: Quản lý danh sách Workspace, phân loại Lớp học / CLB Thể thao / Căn hộ dịch vụ.
- `/groups/[id]`: Chi tiết nhóm, sĩ số, lịch học, giảng viên phụ trách và cấu hình biểu phí.
- `/workflows`: Cấu hình quy trình vận hành linh hoạt (Lớp học, CLB thể thao, Nhà trọ).
- `/members`: Danh sách học viên, học viên nợ phí, bộ lọc theo nhóm/trạng thái.
- `/members/[id]`: Chi tiết thành viên, lịch sử điểm danh, lịch sử đóng tiền, phụ huynh liên hệ.
- `/attendance`: Bảng điểm danh ngày/tháng, chế độ điểm danh hàng loạt 1 chạm, báo cáo vắng.
- `/calendar`: Lịch hoạt động, ca dạy, buổi tập, lịch bảo trì phòng trọ.
- `/invoices`: Quản lý khoản thu, công nợ lũy kế, tạo hóa đơn đơn lẻ và hàng loạt theo lớp.
- `/transactions`: Sổ quỹ giao dịch ngân hàng, đối soát tự động VietQR Napas 247, gán thủ công giao dịch chưa khớp.
- `/documents`: Trung tâm chứng từ, phát hành Phiếu thu Mẫu 01-TT, Bảng kê chi phí nội bộ.
- `/reports`: Trung tâm báo cáo & phân tích tài chính, chuyên cần, tuổi nợ và ước tính thuế TT 40.
- `/export`: Xuất dữ liệu CSV/Excel chuẩn UTF-8 BOM phục vụ kế toán.
- `/automations`: Cấu hình tự động hóa (Nhắc nợ Zalo ZNS, webhook, auto-reconciliation).
- `/billing`: Quản lý gói cước TingRoster (Trial 30 ngày, Pro), nạp tiền ví dịch vụ duy trì.
- `/notifications`: Trung tâm thông báo hoạt động, webhook callbacks, cảnh báo quá hạn.
- `/notes`: Ghi chú nội bộ giáo viên/quản lý cơ sở.
- `/pomodoro`: Đồng hồ tập trung giảng dạy / điều hành.
- `/help`: Hỗ trợ kỹ thuật, hướng dẫn sử dụng, gửi ticket hỗ trợ.
- `/settings`: Cài đặt tài khoản ngân hàng thụ hưởng VietQR, thông tin cơ sở, phân quyền.

### 1.2. Platform Admin Console (`/(admin)/*`)
- `/admin`: Trung tâm quản trị toàn nền tảng với 7 nhóm chức năng điều hành:
  1. *Điều hành:* Tổng quan hệ thống, Hàng đợi xử lý, Sức khỏe hạ tầng & SLA 99.98%.
  2. *Khách hàng:* Chủ cơ sở (Tenants), Lớp học & CLB, Nhà trọ cho thuê, Quản lý Trial 30 ngày.
  3. *Tài chính:* Doanh thu nền tảng (Miền A), Đơn nạp tiền ví, Sổ cái ví credit, Giám sát tiền thu cơ sở (Miền B - Zero Custody).
  4. *Báo cáo:* Tăng trưởng & kích hoạt, Hiệu suất AI Bot & OCR.
  5. *Vận hành:* Ticket hỗ trợ kỹ thuật, Giám sát Webhook Gateways (Casso/SePay).
  6. *Cấu hình:* Biểu phí nền tảng, Gói Pro, Tài khoản ngân hàng cước phí.
  7. *An ninh:* Nhật ký kiểm toán quản trị (Audit Trail).

### 1.3. Member Portal (`/portal/*`)
- `/portal`: Trang tổng quan dành cho học viên, phụ huynh, người thuê trọ.
- `/portal/groups`: Danh sách lớp học/phòng trọ mà thành viên đang tham gia.
- `/portal/fees`: Bảng kê chi phí minh bạch từng hạng mục, mã VietQR động, in phiếu thu 01-TT.
- `/portal/attendance`: Tra cứu lịch sử chuyên cần, gửi đơn xin phép nghỉ có phép.
- `/portal/chat`: Kênh trao đổi trực tiếp giữa học viên/phụ huynh và giáo viên chủ nhiệm.
- `/portal/profile`: Cập nhật thông tin cá nhân và số điện thoại nhận thông báo Zalo.
- `/portal/help`: Hướng dẫn thanh toán và hỏi đáp quyền lợi.

### 1.4. Công Cộng & Tiện Ích Khác
- `/login`, `/register`: Xác thực tài khoản người dùng và chủ cơ sở.
- `/onboarding`: Luồng thiết lập ban đầu (Tên cơ sở, STK ngân hàng, tạo nhóm đầu tiên).
- `/kiosk`, `/kiosk/[groupId]`: Màn hình cảm ứng quét mã QR tự phục vụ tại sân bóng/phòng tập.
- `/p/[slug]`: Cổng thanh toán hóa đơn công khai dùng mã token an toàn.
- `/legal`: Điều khoản dịch vụ và chính sách hoàn phí theo pháp luật Việt Nam.

---

## 2. BẢNG GHI NHẬN LỖI UI/UX & MỨC ĐỘ NGHIÊM TRỌNG

| ID | Vị trí / Component | Mức độ | Hiện trạng & Nguyên nhân gốc | Hướng xử lý |
| :--- | :--- | :---: | :--- | :--- |
| **AUD-01** | **Hệ thống Button toàn app** | **CRITICAL** | Không có component `Button` chuẩn dùng chung; các trang viết ad-hoc class dẫn đến: chiều cao không đồng nhất (34px, 38px, 42px), thiếu `shrink-0` khiến icon ép text xuống dòng trên màn hình trung bình, thiếu focus ring chuẩn WCAG, click target nhỏ hơn 44x44px trên mobile. | Xây dựng component `TingButton` chuẩn hoá 5 biến thể (primary, secondary, outline, ghost, destructive), 3 kích thước, cố định chiều cao, chống wrap chữ ngoài ý muốn, chuẩn hoá spinner loading và touch target 44px. |
| **AUD-02** | **Hệ thống In & Multi-Page Print Engine** | **CRITICAL** | Khi in báo cáo nhiều trang hoặc bảng dài: header bị cắt, thiếu thông tin số trang `Trang X/Y`, nội dung các hàng cuối bị chồng lấn do CSS thiếu `break-inside: avoid` tại từng hàng; khung xem trước (Print Preview) trước đây có thể ép chiều cao cố định khiến trang 2 bị tràn hoặc che mất. | Nâng cấp print engine độc lập, chia trang tự nhiên A4 với lề chuẩn 15mm, header lặp lại ở mỗi trang, footer có số trang `Trang X/Y`, thời gian xuất bản và mã đối soát; trang preview hiển thị rõ ranh giới từng trang độc lập. |
| **AUD-03** | **Cấu trúc Sidebar & Rác số đếm** | **HIGH** | Sidebar hiển thị số thứ tự `1. ... 15. ...` làm rối mắt (vi phạm Craft Floor); gắn badge `Linh hoạt`, `Hôm nay` bừa bãi không mang lại giá trị hành động cho người dùng. | Tái cấu trúc Sidebar thành 4 nhóm nghiệp vụ rõ ràng, bỏ hoàn toàn số thứ tự, chỉ hiển thị số đếm (counter) khi có việc cần người dùng xử lý (ví dụ: hóa đơn quá hạn, thông báo chưa đọc). |
| **AUD-04** | **Nền Gradient Pastel & Visual Noise** | **HIGH** | Xuất hiện các gradient dạng `from-indigo-500 to-purple-600` hoặc pastel gây mất tập trung, giảm tính chuyên nghiệp của một SaaS tài chính B2B. | Chuẩn hóa bảng màu Neutral (`#F5F7FB`, `#FFFFFF`, `#101828`), điểm nhấn Royal Blue (`#2538D9`) dùng cho primary action và highlight có chủ đích; loại bỏ gradient trang trí không cần thiết. |
| **AUD-05** | **Badge & StatusChips** | **MEDIUM** | Một số trang dùng chip inline tùy tiện, màu chữ nhạt khó đọc khi bật Dark Mode hoặc thiếu nhãn ngữ nghĩa rõ ràng. | Chuẩn hóa `TingStatusChip` với 12 trạng thái tài chính & điểm danh theo AGENTS.md, đảm bảo tỷ lệ tương phản WCAG 2.2 AA (≥ 4.5:1), có dot phân biệt màu và text rõ nghĩa. |
| **AUD-06** | **Hierarchy Báo Cáo & Data-Ink Ratio** | **MEDIUM** | Trang báo cáo chưa có cấu trúc phân tầng thống nhất giữa Header $\rightarrow$ KPI $\rightarrow$ Biểu đồ trực quan $\rightarrow$ Bảng kiểm chứng chi tiết; một số KPI thiếu kỳ so sánh hoặc công thức tính rõ ràng. | Chuẩn hóa cấu trúc 5 tầng cho Dashboard & Reports; đảm bảo mọi biểu đồ trả lời được câu hỏi nghiệp vụ và bảng chi tiết bên dưới cho phép kiểm chứng số liệu tổng hợp. |

---

## 3. KẾT QUẢ TRIỂN KHAI VÀ XỬ LÝ LỖI (RESOLUTION & VERIFICATION)

### 3.1. Design System & Nút Bấm Chuẩn Hoá (AUD-01)
- **Tập tin đã tạo:** [`src/components/common/Button.tsx`](file:///c:/Users/manhd/Downloads/TingRoster/src/components/common/Button.tsx)
- **Chuẩn hoá:**
  - 6 variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
  - 6 sizes: `sm`, `md`, `lg`, `icon-sm`, `icon-md`, `icon-lg`.
  - Touch target: Đáp ứng tiêu chuẩn WCAG 2.2 AA (min 44x44px trên touch device).
  - Căn lề: Căn giữa theo trục ngang & dọc hoàn hảo với flexbox, `shrink-0` cho icon wrappers tránh đẩy chữ xuống dòng.
  - State: Tích hợp Spinner loading bảo toàn kích thước nút (không làm giật layout), focus-visible ring 2px.

### 3.2. Badge & Status System (AUD-05)
- **Tập tin cập nhật:** [`src/components/common/Badge.tsx`](file:///c:/Users/manhd/Downloads/TingRoster/src/components/common/Badge.tsx)
- **Chuẩn hoá:**
  - Bổ sung 6 trạng thái doanh nghiệp: `ACTIVE`, `INACTIVE`, `OVERDUE`, `PROCESSING`, `CANCELLED`, `EXPIRED`.
  - Độ tương phản WCAG 2.2 AA (contrast ratio $\ge 4.5:1$).
  - Có dot nhận diện màu sắc kết hợp nhãn ngữ nghĩa tiếng Việt chuẩn, không để chữ tụt trục dọc.

### 3.3. Cải Tổ Sidebar & Visual Noise (AUD-03, AUD-04)
- **Tập tin cập nhật:** [`src/app/(dashboard)/layout.tsx`](file:///c:/Users/manhd/Downloads/TingRoster/src/app/(dashboard)/layout.tsx)
- **Kết quả:**
  - Bỏ hoàn toàn số thứ tự `1.` đến `15.` trong menu.
  - Phân chia thành 4 nhóm nghiệp vụ tự nhiên: *Vận hành hằng ngày*, *Tài chính & Đối soát*, *Hệ thống & Công cụ*, *Cổng liên kết & Mở rộng*.
  - Loại bỏ các badge trang trí không có giá trị hành động (`Linh hoạt`, `Trial 30d`). Chỉ giữ pulse dot thời gian thực cho Giao dịch VietQR và badge `Hôm nay` cho Điểm danh.
  - Dọn dẹp gradient pastel trong `notes`, `attendance`, `pomodoro` sang tone màu thương hiệu Neutral & Royal Blue `#2538D9`.

### 3.4. Hệ Thống In Ấn, Print Preview & Multi-Page Engine (AUD-02)
- **Tập tin cập nhật:** [`src/lib/printUtils.ts`](file:///c:/Users/manhd/Downloads/TingRoster/src/lib/printUtils.ts), [`src/app/globals.css`](file:///c:/Users/manhd/Downloads/TingRoster/src/app/globals.css)
- **Kết quả:**
  - `printViaIsolatedIframe()`: In qua iframe cô lập hoàn toàn, triệt tiêu 100% can thiệp từ Tailwind/Dark mode của trang web, phông chữ Times New Roman Unicode chuẩn NĐ 30/2020/NĐ-CP.
  - Mẫu 01 - TT: Phiếu thu 2 liên (Liên 1 lưu tại cơ sở, Liên 2 giao cho người nộp) có đường cắt xé ✂ và khối chữ ký 5 bên chuẩn mực.
  - Multi-page tables: Cấu hình `thead { display: table-header-group; }` giúp tiêu đề bảng tự động lặp lại ở trang 2, 3; `tr { break-inside: avoid; }` ngăn chặn cắt ngang dòng; khối chữ ký `.sign-grid { break-inside: avoid; }` không bị tách đôi sang 2 trang.

---

## 4. BẰNG CHỨNG KIỂM THỬ (VERIFICATION EVIDENCE)

1. **TypeScript Typecheck:**
   - Lệnh: `npm run typecheck`
   - Kết quả: `Exit code 0` (0 lỗi type).
2. **Unit & Integration Tests:**
   - Lệnh: `npm test`
   - Kết quả: 4/4 test files passed, 26/26 tests passed (100%).
3. **HTTP Server & Docker Container Health:**
   - Cụm container Docker: `tingroster-app` (port 3001), `tingroster-db` (port 5433).
   - Kiểm tra phản hồi HTTP qua PowerShell:
     - `http://localhost:3001`: `200 OK`
     - `http://localhost:3001/dashboard`: `200 OK`
     - `http://localhost:3001/admin`: `200 OK`
     - `http://localhost:3001/portal`: `200 OK`
