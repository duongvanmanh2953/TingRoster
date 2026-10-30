# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Chủ cơ sở & Người quản trị**: Giáo viên dạy thêm, chủ trung tâm đào tạo, chủ CLB thể thao (Pickleball, Cầu lông, Bóng đá, Gym), chủ phòng trọ / căn hộ mini. Cần quản lý trực quan, loại bỏ công việc ghi chép sổ sách thủ công.
- **Học viên, Phụ huynh & Khách thuê**: Tra cứu lịch học, buổi tập, hóa đơn và đóng học phí/tiền phòng một chạm qua mã VietQR trên trình duyệt di động mà không cần cài thêm app.
- **Nhân viên / Lễ tân / Huấn luyện viên**: Điểm danh học viên nhanh chóng, hỗ trợ màn hình Kiosk tự phục vụ tại cửa ra vào.

## Product Purpose
TingRoster là giải pháp chuyển đổi số toàn diện kết hợp:
1. Điểm danh và kiểm soát lịch học/lịch tập một chạm.
2. Tự động phát hành thông báo hóa đơn, học phí, tiền dịch vụ.
3. Đối soát tức thì các giao dịch chuyển khoản VietQR Napas trực tiếp vào tài khoản ngân hàng cá nhân hoặc doanh nghiệp (Zero-touch Reconciliation).

**Thông điệp cốt lõi:** *"Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo."*

## Positioning
Nền tảng quản lý vận hành SaaS hiệu suất cao đầu tiên tại Việt Nam thích ứng linh hoạt đa lĩnh vực (Lớp học, Thể thao, Cho thuê phòng, Chấm công nhân sự) tích hợp sẵn cơ chế đối soát VietQR tự động mà không qua trung gian cổng thanh toán, bảo mật tuyệt đối dòng tiền của chủ cơ sở.

## Operating Context
- **Thiết bị**: Máy tính người quản lý (Dashboard đầy đủ), Màn hình máy tính bảng Kiosk đặt tại quầy/cửa ra vào, Smartphone của phụ huynh/học sinh qua link Portal an toàn.
- **Nhịp độ sử dụng**: Cực kỳ nhanh vào đầu buổi học/ca tập (cao điểm điểm danh) và đầu tháng (cao điểm thu tiền & đối soát).
- **Độ tin cậy**: Xử lý webhook SePay/VietQR tức thời, giao dịch nguyên tử (`prisma.$transaction`) đảm bảo an toàn tuyệt đối.

## Capabilities and Constraints
- **Không gian đa năng (Multi-Space Architecture)**: Tách biệt hoàn toàn dữ liệu giữa các lớp học, câu lạc bộ, tòa nhà cho thuê; mỗi không gian có màu sắc nhận diện và bộ tính năng riêng.
- **Đối soát tự động (VietQR Auto-Reconciliation)**: Nhận diện mã hóa đơn/học viên trong nội dung chuyển khoản, tự động phân bổ (`PaymentAllocation`), cập nhật trạng thái hóa đơn ngay lập tức.
- **Kiosk tự phục vụ**: Hỗ trợ quét mã QR học sinh hoặc nhập mã định danh để điểm danh không cần tiếp xúc.
- **Cổng thông tin phụ huynh (Parent/Student Portal)**: Truy cập không cần mật khẩu thông qua `publicToken` bảo mật cao, không để lộ PII hoặc thông tin công nợ của người khác.
- **Ràng buộc kỹ thuật**: Next.js 14+ (App Router), PostgreSQL, Prisma ORM, TypeScript Strict Mode (zero `any`), 100% tiếng Việt tự nhiên chuẩn xác.

## Brand Commitments
- **Tên sản phẩm**: TingRoster
- **Phong cách**: Hiện đại, năng động, thanh lịch, tin cậy cao (Productivity SaaS).
- **Bảng màu chủ đạo**:
  - Primary Brand: Royal Blue (`#2538D9`)
  - Accent Violet: Modern Violet (`#6D5CE8`)
  - Dark Surface & Sidebar: Dark Navy (`#0B0F19`)
  - Light Canvas: Soft Slate (`#F5F7FB`)
- **Typography**: Phông chữ Be Vietnam Pro hỗ trợ tiếng Việt toàn diện, số tiền VND luôn hiển thị tabular numerals (`tnum`).
- **Màu sắc trạng thái tài chính**:
  - Đã đóng đủ: Emerald (`#10B981`)
  - Đóng thiếu: Amber (`#F59E0B`)
  - Chưa đóng: Rose (`#F43F5E`)
  - Đóng thừa: Indigo (`#6366F1`)

## Evidence on Hand
- Toàn bộ các luồng chức năng thực tế đã hoàn thiện: Bảng điều khiển tài chính, Quản lý không gian, Quản lý thành viên, Điểm danh & Kiosk QR, Hóa đơn & Biểu phí, Đối soát giao dịch SePay/VietQR, Báo cáo phân tích thu chi & tuổi nợ.

## Product Principles
1. **Toàn vẹn tài chính là tối thượng (Financial Integrity First)**: Tuyệt đối không cộng trùng tiền, chống phân tán dòng tiền, mọi phân bổ đều có bằng chứng giao dịch và nhật ký rõ ràng.
2. **Một chạm là xong (Frictionless Speed)**: Giảm thiểu thao tác dư thừa, tốc độ tải và phản hồi mượt mà dưới 100ms.
3. **Phân hóa màu sắc trực quan (Semantic Color Hierarchy)**: Mỗi loại không gian và trạng thái tài chính có màu sắc nhận diện đặc trưng, loại bỏ giao diện đơn điệu một màu.
4. **Độ tương phản cao & Dễ đọc (High-Contrast Clarity)**: Tuyệt đối không dùng chữ xám mờ trên nền sáng hoặc chữ tối trên nền tối, tuân thủ WCAG AA.

## Accessibility & Inclusion
- Đạt chuẩn WCAG AA: Tỷ lệ tương phản chữ và nền tối thiểu 4.5:1.
- Tương thích hoàn hảo cả Light Theme và Dark Theme.
- Kích thước phần tử tương tác tối thiểu 44x44px trên thiết bị di động.
