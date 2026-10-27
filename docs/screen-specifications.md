# Screen Specifications — TingRoster SaaS

> Đặc tả giao diện chi tiết cho 12 màn hình trọng tâm theo bộ ảnh tham chiếu UI/UX và tài liệu `TINGROSTER_UI_UX_MASTER_PROMPT.md`.

---

## 1. Landing Page (`src/app/page.tsx`)
- **Mục tiêu:** Giới thiệu giá trị sản phẩm "Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.", minh họa trải nghiệm thực tế và chuyển đổi khách hàng đăng ký dùng thử.
- **Header:**
  - Logo TingRoster chuẩn thương hiệu (Royal Blue `#2538D9` + Electric Violet `#6D5CE8`).
  - Menu điều hướng: Tính năng, Đối tượng sử dụng, Bảng giá, Hướng dẫn, Kiosk tại sân.
  - CTA: "Đăng nhập" (Ghost button) & "Bắt đầu miễn phí" (Primary royal blue).
- **Hero:**
  - Headline 3 dòng phân cấp mạnh mẽ.
  - Subtitle giải thích tự động hóa VietQR cho giáo viên, CLB thể thao, chủ nhà trọ.
  - CTA kép: "Dùng thử miễn phí" + "Xem cách hoạt động" (Video/tour).
  - Preview tương tác: Mockup laptop hiển thị Dashboard + Điện thoại hiển thị hóa đơn VietQR Napas 24/7.
  - 3 Callout tags vẽ tay/gắn kết nối: "Quản lý dễ dàng", "Thu phí tự động", "Đối soát khỏi lo".
- **4 Lợi ích cốt lõi (1 hàng 4 cột):**
  1. *Điểm danh nhanh:* Chỉ 1 chạm, tự động tính buổi học.
  2. *QR VietQR:* Quét mã mọi ngân hàng, tự điền tiền và nội dung.
  3. *Đối soát tự động:* Webhook ngân hàng khớp tiền trong 0.2s.
  4. *Nhắc phí thông minh:* Gửi nhắc nợ qua Zalo/SMS.
- **3 Nhóm đối tượng ("Dành cho bạn"):**
  1. Giáo viên dạy thêm: Quản lý sĩ số, học phí theo buổi.
  2. Chủ CLB thể thao: Kiosk quét QR tại sân, gói tập, hội viên.
  3. Chủ nhà trọ nhỏ: Theo dõi số phòng, điện nước, thu tiền phòng.
- **Workflow 5 bước:** Tạo workspace → Điểm danh → Tạo khoản thu → Quét VietQR → Đối soát Ting!
- **Bộ tạo âm thanh Ting!** mô phỏng âm thanh nhận tiền ngân hàng thời gian thực.
- **Bảng giá:** Khởi đầu (Miễn phí), Chuyên nghiệp (199.000đ/tháng), Chuỗi (499.000đ/tháng).
- **FAQ & Footer Banner:** Nhận diện thương hiệu TingRoster, liên kết nhanh và bản quyền.

---

## 2. Đăng Nhập (`src/app/(auth)/login/page.tsx`)
- **Bố cục:** Thẻ container 2 cột bo tròn 24px trên nền canvas `#F5F7FB`.
- **Cột trái (Dark Navy `#0B0F19`):**
  - Logo TingRoster trắng.
  - Tiêu đề: "Quản lý thông minh - Kết nối bền vững".
  - 4 cam kết giá trị: Tiết kiệm thời gian, Tăng tỷ lệ thu phí, Giảm sai sót, Bảo mật tuyệt đối.
- **Cột phải (Surface trắng `#FFFFFF`):**
  - Tiêu đề: "Chào mừng bạn quay lại!".
  - Input: Email hoặc số điện thoại.
  - Input: Mật khẩu (kèm nút ẩn/hiện mắt và liên kết "Quên mật khẩu?").
  - Nút submit: "Đăng nhập" (Primary Blue).
  - Phân cách: "Hoặc đăng nhập với".
  - Social buttons: Google & Apple.
  - Nút chuyển: "Chưa có tài khoản? Đăng ký ngay".
  - Thanh chọn tài khoản mẫu 1-chạm (demo@tingroster.vn / 123456).

---

## 3. Onboarding Wizard (`src/app/(dashboard)/onboarding/page.tsx`)
- **Thanh tiến trình 6 bước:**
  1. Mô hình → 2. Tạo lớp/CLB → 3. Thành viên → 4. Khoản thu → 5. Thanh toán → 6. Hoàn tất.
- **Bước 1 (Chọn mô hình):**
  - "Bạn đang quản lý mô hình nào?"
  - 3 thẻ lựa chọn lớn: Lớp học / Gia sư (Xanh dương), CLB thể thao (Xanh ngọc), Nhà trọ (Hổ phách).
- **Bước 2 - 5:**
  - Nhập tên Workspace & đường dẫn (slug).
  - Nhập danh sách thành viên ban đầu hoặc dán nhiều dòng.
  - Nhập mức học phí mặc định theo tháng.
  - Cấu hình ngân hàng nhận tiền VietQR (MB, VCB, Techcombank...).
- **Bước 6:**
  - Thẻ review thông tin trước khi hoàn tất.
- **Chân trang:** Nút "Bỏ qua" góc trái và nút "Tiếp tục →" góc phải.

---

## 4. Dashboard Tổng Quan (`src/app/(dashboard)/dashboard/page.tsx`)
- **Header:** Lời chào cá nhân hóa "Chào buổi sáng, Nguyễn Văn Minh!", thời gian thực và bộ chọn kỳ ("Tháng 4/2025").
- **4 Thẻ KPI chính:**
  1. Tổng phải thu: `48.500.000đ` (Badge tăng trưởng).
  2. Đã thu: `32.750.000đ` (+78% cùng kỳ).
  3. Còn phải thu: `15.750.000đ` (Màu đỏ hồng nổi bật).
  4. Cần xử lý / Tỷ lệ thu: `04` giao dịch chờ đối soát hoặc `68%` tỷ lệ hoàn thành.
- **Phần đồ thị:**
  - Biểu đồ sóng SVG dòng tiền theo thời gian (Tuần / Tháng).
  - Donut chart tỷ lệ hoàn thành theo lớp.
  - Danh sách khoản thu sắp đến hạn (cảnh báo 2 ngày, 5 ngày).
- **Phần hoạt động & đối soát:**
  - Giao dịch vừa nhận: Hiển thị avatar thành viên, số tiền nhận (+300.000đ) và mã chuyển khoản.
  - Giao dịch cần xử lý: Cảnh báo chưa gán hoặc chuyển sai nội dung.
  - Lớp/CLB nổi bật: Tỷ lệ chuyên cần và tỷ lệ thu phí.

---

## 5. Quản Lý Lớp Học & CLB (`src/app/(dashboard)/groups/page.tsx`)
- **Thanh công cụ:** Ô tìm kiếm, bộ lọc loại hình (Lớp học, CLB, Nhà trọ), nút tạo mới `+ Tạo mới`.
- **Chuyển đổi giao diện:** Dạng thẻ (Grid view) và dạng bảng (Table view).
- **Nội dung thẻ:**
  - Icon phân loại (Mũ cử nhân, Vợt cầu lông, Ngôi nhà).
  - Tên lớp, người phụ trách, số lượng học sinh / phòng.
  - Mức học phí định kỳ.
  - Thanh tiến độ thu phí (Progress bar) trực quan (78%, 92%, 65%, 100%).
  - Số lượng khoản thu quá hạn.
  - Nút hành động trực tiếp: "Điểm danh", menu tùy chọn.

---

## 6. Điểm Danh Hàng Ngày (`src/app/(dashboard)/attendance/page.tsx`)
- **Thanh điều hướng:** Bộ chọn ngày (DatePicker kèm dải tuần 7 ngày), bộ chọn lớp học/workspace.
- **Thanh thống kê nhanh (Matrix pills):**
  - Sĩ số lớp: `48`
  - Có mặt (P): `42`
  - Vắng mặt (A): `6`
  - Tỷ lệ chuyên cần: `88%`
- **Thao tác nhanh:** "Xuất Excel", "Lưu điểm danh", "Thêm học viên".
- **Bảng điểm danh:**
  - Cột thành viên: Avatar (Ảnh/Initials đa sắc) + Tên học sinh + SĐT.
  - Nút điểm danh 1-chạm: `✓ Có mặt` (Xanh lá), `✕ Vắng` (Đỏ hồng), `Nghỉ phép` (Vàng).
  - Số buổi học lũy kế (VD: `17/20 buổi`).
  - Mức phí buổi tương ứng.
  - Trạng thái lưu: Báo đã đồng bộ server hoặc chỉ báo chưa lưu.

---

## 7. Chi Tiết Thành Viên (`src/app/(dashboard)/members/[id]/page.tsx`)
- **Thẻ hồ sơ:**
  - Avatar khổ lớn (`size="2xl"`), tên "Nguyễn Văn A", nhãn "Đang hoạt động".
  - Lớp trực thuộc, Email, Số điện thoại.
  - 4 chỉ số: Phải thu, Đã thanh toán, Còn thiếu, Chuyên cần (%).
- **Thanh tab điều hướng:** Tổng quan, Điểm danh, Khoản thu, Giao dịch, Lịch sử.
- **Bố cục 2 cột:**
  - Cột trái: Thông tin cá nhân (Ngày sinh, phụ huynh, địa chỉ, nút "Chỉnh sửa").
  - Cột phải: Dòng thời gian hoạt động gần đây (Thanh toán 500k, Điểm danh buổi 18, Tạo khoản thu).

---

## 8. Trung Tâm Học Phí & Khoản Thu (`src/app/(dashboard)/invoices/page.tsx`)
- **Thanh chỉ số tài chính:** Tổng phải thu, Đã thu, Còn phải thu, Quá hạn.
- **Bộ lọc & tìm kiếm:** Theo mã chuyển khoản (TR84920), tên học viên, lớp học, trạng thái nợ.
- **Bảng hóa đơn:**
  - Mã thu: `TR84920` (Font mono, Royal Blue).
  - Học viên: Avatar + Tên + SĐT.
  - Lớp/Nhóm trực thuộc.
  - Số tiền phải thu & Đã thu (Font mono).
  - Badge trạng thái tài chính (AGENTS.md):
    - Đã đóng đủ: `bg-emerald-50 text-emerald-700 border-emerald-200`
    - Đóng thiếu: `bg-amber-50 text-amber-700 border-amber-200`
    - Chưa đóng: `bg-rose-50 text-rose-700 border-rose-200`
  - Hạn nộp & nút sao chép link thanh toán VietQR gửi phụ huynh.

---

## 9. Cổng Thanh Toán Công Khai VietQR (`src/app/p/[slug]/page.tsx`)
- **Thiết kế:** Mobile-first, không hiển thị sidebar quản trị để phụ huynh/hội viên tập trung quét mã.
- **Header:** Logo thương hiệu TingRoster và tên đơn vị thu.
- **Nội dung thẻ thanh toán:**
  - Tên khoản thu và người nộp.
  - Số tiền thanh toán cỡ lớn nổi bật.
  - Ảnh mã VietQR Napas 24/7 quét được bởi mọi ứng dụng ngân hàng.
  - Thông tin chuyển khoản chi tiết kèm nút sao chép 1-chạm (Số tài khoản, Chủ tài khoản, Nội dung chuyển khoản).
  - Hướng dẫn chuyển khoản 3 bước.
  - Cảnh báo: "Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động đối soát."

---

## 10. Sports Kiosk Check-in (`src/app/kiosk/[groupId]/page.tsx`)
- **Giao diện:** Dark Navy `#070A12` phong cách Kiosk thể thao ban đêm với đường viền Neon cyan `#00D2FF`.
- **Header:** Tên CLB/Sân, đồng hồ thời gian thực kỹ thuật số (`16:24`), trạng thái "Đang kết nối", nút bật/tắt chuông Ting.
- **Khu vực trung tâm (Trái):**
  - Khung quét QR phát sáng Neon.
  - Tiêu đề: "Quét mã QR để check-in".
  - Thanh tìm kiếm và chọn nhanh hội viên check-in 1-chạm.
  - Khi check-in thành công: Phát âm thanh Ting! và hiển thị banner chào mừng thành viên.
- **Khu vực danh sách (Phải):**
  - "Check-in gần đây": Danh sách avatar, tên hội viên, giờ vào (`16:20`, `16:15`...), huy hiệu "Thành công".
- **Chân trang:** "Chỉ hiển thị thông tin cần thiết. Bảo mật dữ liệu thành viên."

---

## 11. Giao Dịch & Đối Soát (`src/app/(dashboard)/transactions/page.tsx`)
- **4 Thẻ số lượng:** Giao dịch nhận được (125), Đã khớp (124), Chưa khớp (4), Lỗi (0).
- **Bộ lọc:** Tất cả giao dịch, Giao dịch chưa khớp (kèm huy hiệu cảnh báo).
- **Bảng giao dịch ngân hàng:**
  - Thời gian, Cổng (MBBank, Vietcombank kèm logo ngân hàng), Nội dung chuyển khoản, Số tiền (+500.000đ), Trạng thái khớp lệnh.
  - Nút thao tác: "Gán hóa đơn" cho các giao dịch chưa khớp.
- **Bảng đối chiếu 2 cột (Modal đối soát):**
  - Cột 1: Thông tin giao dịch ngân hàng thực tế.
  - Cột 2: AI Đề xuất hóa đơn trùng khớp kèm tỷ lệ tin cậy (%) và lý do phân tích.
  - Nút "Xác nhận gạch nợ" để cập nhật hóa đơn nguyên tử.

---

## 12. Báo Cáo & Phân Tích (`src/app/(dashboard)/reports/page.tsx`)
- Biểu đồ tăng trưởng dòng tiền học phí theo chu kỳ.
- Báo cáo phân loại công nợ theo độ tuổi (Dưới 30 ngày, 30-60 ngày, quá hạn).
- Tỷ lệ chuyên cần trung bình giữa các lớp.
- Tính năng xuất báo cáo Excel/CSV.
