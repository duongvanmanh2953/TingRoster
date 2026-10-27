# TingRoster --- UI/UX Master Brief for Antigravity

## Cách sử dụng

1.  Đặt file này trong thư mục gốc repository TingRoster.
2.  Mở project bằng Antigravity.
3.  Dán prompt ở cuối file vào Agent chat.
4.  Yêu cầu agent đọc file này và `AGENTS.md` trước khi sửa code.
5.  Bắt agent làm theo từng phase, chạy ứng dụng và kiểm tra screenshot;
    không chỉ tạo mockup.

------------------------------------------------------------------------

# 1. Vai trò và mục tiêu

Bạn là Principal Product Designer, UI/UX Designer, Design Systems
Architect, Senior Frontend Engineer, Accessibility Specialist và QA
Engineer.

Thiết kế lại TingRoster thành SaaS chất lượng cao cho gia sư/trung tâm
giáo dục, CLB thể thao và chủ nhà trọ nhỏ tại Việt Nam.

**Thông điệp sản phẩm:** "Điểm danh một chạm. Thu phí tự động. Đối soát
khỏi lo."

Luồng nghiệp vụ cốt lõi: Workspace → Thành viên → Điểm danh → Khoản
thu/hóa đơn → VietQR → Webhook ngân hàng → Đối soát → Báo cáo.

Không làm dashboard CRUD chung chung. Không dừng ở wireframe hoặc ảnh
tĩnh. Phải kiểm tra code hiện có, giữ lại logic đang chạy, xây design
system nhất quán, triển khai tương tác thật và kiểm thử các luồng quan
trọng.

# 2. Visual direction và design system

## Phong cách

-   Premium productivity SaaS, hiện đại, sáng, tinh gọn, đáng tin cậy.
-   Nền sáng, surface trắng, typography rõ, phân cấp thị giác mạnh.
-   Indigo/violet làm màu thương hiệu nhưng dùng tiết chế.
-   Tránh gradient phủ khắp nơi, neon, glassmorphism quá mức, shadow
    nặng, card lồng card, dashboard chỉ gồm nhiều KPI vô nghĩa.
-   Ưu tiên thông tin dễ đọc, thao tác nhanh và trạng thái dữ liệu rõ
    ràng.

## Màu

-   Primary: `#2538D9`
-   Accent violet: `#6D5CE8`
-   Main text: `#101828`
-   Secondary text: `#475467`
-   Canvas: `#F5F7FB`
-   Surface: `#FFFFFF`
-   Border: `#E4E7EC`
-   Success: `#067647`
-   Warning: `#B54708`
-   Danger: `#B42318`

Tạo design tokens dùng chung; không hardcode màu rải rác từng component.

## Typography --- đặc biệt quan trọng

-   Ưu tiên font **Be Vietnam Pro** có hỗ trợ tiếng Việt tốt. Nếu repo
    đã dùng font tương đương được cấu hình chuẩn, đánh giá trước khi
    thay.
-   Kiểm tra tải font thực tế, font-weight, fallback, dấu tiếng Việt,
    line-height và wrap trên mọi breakpoint.
-   Page title: 28--32px, semibold/bold.
-   Section title: 18--20px, semibold.
-   Body: 14px, line-height 1.5--1.6.
-   Label: 12--13px.
-   Số tiền quan trọng: 24--30px, semibold/bold.
-   Button: 14px, semibold.
-   Dùng tabular numerals cho tiền và cột số.
-   Không dùng quá nhiều cỡ chữ; không dùng font quá mảnh cho dữ liệu
    quan trọng.

## Layout

-   Desktop sidebar: 248px mở, 72px thu gọn.
-   Header: 64--72px.
-   Padding nội dung desktop: 24--32px.
-   Khoảng cách section: 20--24px; spacing system bội số 4px.
-   Card radius: 12--16px; border 1px trung tính.
-   Giới hạn max-width nội dung để tránh dòng quá dài.
-   Mọi component có state hover, focus, active, disabled, loading và
    error khi phù hợp.

## Shell

Sidebar gồm logo/workspace switcher, Tổng quan, Lớp học/CLB, Điểm danh,
Học phí & khoản thu, Giao dịch & đối soát, Báo cáo, AI & tự động hóa,
Cài đặt. Cuối sidebar có gói dịch vụ, trạng thái tích hợp và hồ sơ.
Header gồm breadcrumb, tiêu đề/ngữ cảnh, tìm kiếm toàn hệ thống, trợ
giúp, thông báo, avatar. Mobile không giữ sidebar desktop; dùng drawer
hoặc bottom navigation phù hợp.

# 3. Đặc tả từng màn hình

## 3.1 Landing page

-   Navigation: logo, Tính năng, Đối tượng sử dụng, Bảng giá, Hướng dẫn;
    CTA Đăng nhập và Bắt đầu miễn phí.
-   Hero headline: "Điểm danh một chạm. Thu phí tự động. Đối soát khỏi
    lo."
-   Mô tả ngắn lợi ích; CTA "Dùng thử miễn phí", "Xem cách hoạt động".
-   Hình sản phẩm thật dạng dashboard laptop + preview QR trên điện
    thoại, không phụ thuộc ảnh stock.
-   Các lợi ích: điểm danh nhanh, QR VietQR, đối soát tự động, nhắc phí.
-   Product tour mô tả: tạo lớp → điểm danh → tạo khoản thu → nhận tiền
    → đối soát.

## 3.2 Đăng nhập / đăng ký / đặt lại mật khẩu

-   Desktop có panel thương hiệu và form 400--440px; mobile tập trung
    form.
-   Email/số điện thoại theo backend thực tế, mật khẩu, hiện/ẩn, quên
    mật khẩu, đăng ký.
-   Chỉ hiển thị social login nếu được cấu hình thực sự.
-   Có loading, sai thông tin, chưa xác minh, mất kết nối, gửi reset
    thành công.

## 3.3 Onboarding wizard

Wizard 6 bước có progress, Back, Save and exit, Continue; cho quay lại
mà không mất dữ liệu: 1. Chọn mô hình: Lớp học/Gia sư, CLB thể thao, Nhà
trọ. 2. Tạo workspace và cấu hình cơ bản. 3. Thêm thành viên hoặc import
CSV/XLSX; có file mẫu và preview. 4. Cấu hình phí, chu kỳ, hạn thanh
toán. 5. Kết nối thanh toán/webhook; có thể bỏ qua và ghi rõ chưa kết
nối. 6. Review, xác nhận và tạo workspace. Sau onboarding đưa người dùng
vào dashboard đã có dữ liệu thật hoặc dữ liệu mẫu được gắn nhãn rõ.

## 3.4 Dashboard

Dashboard phải trả lời: hôm nay cần làm gì, tình hình thu tiền ra sao,
vấn đề nào cần xử lý. - Bộ lọc kỳ và workspace. - Tổng phải thu, đã thu,
còn phải thu, quá hạn/đang xác minh. - Biểu đồ thu theo thời gian. -
Trạng thái thu phí. - Giao dịch chưa khớp, webhook lỗi, khoản quá hạn,
việc cần xử lý. - Hoạt động gần đây: điểm danh, thanh toán, sửa khoản
thu. - Workspace nổi bật với tỷ lệ chuyên cần/thu phí. - AI insight có
căn cứ và link tới dữ liệu. Không bịa số liệu; không báo phần trăm tăng
trưởng nếu không có kỳ so sánh hợp lệ. Pending verification không được
tính là đã thu.

## 3.5 Quản lý workspace: lớp/CLB/nhà trọ

-   Danh sách có search, filter loại hình/trạng thái/tình trạng thu phí,
    sort, table/card view.
-   Thẻ gọn: tên, loại hình, người phụ trách, số thành viên, tỷ lệ thu,
    khoản quá hạn.
-   Tạo/sửa bằng drawer hoặc form riêng; nhóm trường rõ ràng.
-   Chi tiết workspace có tab Tổng quan, Điểm danh, Thành viên, Học phí,
    Giao dịch, Cài đặt.
-   Bộ lọc và ngữ cảnh workspace nhất quán giữa các tab.

## 3.6 Điểm danh hàng ngày

-   Chọn ngày, workspace, số thành viên, số đã điểm danh/vắng; Lưu điểm
    danh và Xuất Excel nếu hỗ trợ.
-   Bảng: checkbox, avatar/tên, trạng thái, buổi học, phí liên quan, ghi
    chú, hành động.
-   Trạng thái: Có mặt, Vắng, Nghỉ phép, Đến muộn.
-   Search không làm mất dữ liệu nhập; bulk actions có xác nhận.
-   Chỉ báo chưa lưu; báo thành công chỉ sau khi server xác nhận.
-   Cảnh báo mất mạng; ngăn bản ghi trùng theo thành viên/ngày/buổi.
-   Mobile đổi thành list card và có thanh lưu không che nội dung.

## 3.7 Chi tiết thành viên

-   Header: avatar, tên, trạng thái, workspace, thông tin liên hệ theo
    quyền.
-   KPI: phải thu, đã trả, còn thiếu, chuyên cần/số buổi.
-   Tabs: Tổng quan, Điểm danh, Khoản thu, Giao dịch, Lịch sử.
-   Có tạo khoản thu, gửi payment link, xem lịch sử.
-   Không lộ thông tin cá nhân hoặc giao dịch của người khác.

## 3.8 Học phí và khoản thu

-   KPI: tổng phải thu, đã thu, còn phải thu, quá hạn, đang xác minh.
-   Search/filter theo kỳ, workspace, thành viên, trạng thái, hạn thanh
    toán.
-   Bảng có mã, thành viên, nội dung, số tiền, đã thanh toán, còn lại,
    hạn, trạng thái, hành động.
-   Trạng thái phân biệt: Chưa thanh toán, Một phần, Đã thanh toán, Quá
    hạn, Đang xác minh, Đã hủy, Hoàn tiền nếu hỗ trợ.
-   Form tạo khoản thu: workspace, thành viên, nội dung, số tiền VND,
    hạn, kỳ, nội dung chuyển khoản.
-   Hỗ trợ tạo hàng loạt có preview số người/tổng tiền và báo lỗi từng
    bản ghi.

## 3.9 Cổng thanh toán VietQR công khai

-   Mobile-first, logo và tên đơn vị, nội dung khoản thu, số tiền lớn,
    QR rõ nét, ngân hàng nhận, tên chủ tài khoản, nội dung chuyển khoản.
-   Nút sao chép số tài khoản/nội dung; hướng dẫn 3 bước.
-   States: Chưa thanh toán, Đang xác minh, Thành công, Hết hạn/Lỗi.
-   Không yêu cầu login nếu nghiệp vụ cho phép link công khai; không
    tiết lộ dữ liệu thành viên khác.
-   QR phải được tạo từ dữ liệu thanh toán thực. Không dùng ảnh QR giả
    trong production.
-   Chỉ backend/provider xác thực mới được đánh dấu thanh toán thành
    công; client không tự xác nhận được.

## 3.10 Sports kiosk

-   Full-screen dark navy, touch-friendly, chữ lớn, tương phản cao;
    không sidebar quản trị.
-   Hiển thị tên CLB/sân, giờ, trạng thái mạng, vùng quét QR/nhập mã,
    check-in gần nhất.
-   Kết quả: hợp lệ, gói hết hạn, QR lỗi, đã check-in, mất mạng.
-   Chặn check-in trùng. Không hiển thị thông tin tài chính không cần
    thiết.
-   Chỉ hiển thị offline mode nếu thực sự được hỗ trợ.

## 3.11 Giao dịch và đối soát

-   Bộ lọc: tất cả, đã khớp, chưa khớp, cần xác minh, lỗi/trùng/đảo
    chiều khi hỗ trợ.
-   Danh sách giao dịch có thời gian, số tiền, nội dung chuyển khoản, mã
    giao dịch, trạng thái.
-   Detail dùng hai cột: giao dịch ngân hàng và khoản thu gợi ý.
-   Giải thích vì sao gợi ý match; nhiều kết quả thì cho người dùng
    chọn, không tự ghép mù quáng.
-   Hỗ trợ partial payment, overpayment, unmatched, duplicate webhook,
    reversal/refund.
-   Mọi thao tác tài chính thủ công cần xác nhận và audit log.
-   Không ghi nhận tiền hai lần khi webhook lặp.

## 3.12 Báo cáo và phân tích

-   Thu tiền theo thời gian, chuyên cần, công nợ quá hạn theo nhóm ngày,
    so sánh workspace.
-   Filter ngày, workspace, loại khoản thu, phương thức thanh toán.
-   Export CSV/XLSX chỉ khi đã implement.
-   AI insight phải dựa trên dữ liệu thật, hiển thị kỳ/bộ lọc và liên
    kết bản ghi.

## 3.13 AI Assistant và Import Assistant

-   AI chat có lịch sử, prompt gợi ý, câu trả lời có căn cứ và link tới
    bản ghi.
-   Ví dụ: lớp còn nợ nhiều nhất, khoản sắp đến hạn, tỷ lệ chuyên cần,
    giao dịch chưa khớp.
-   Hành động ghi dữ liệu phải có preview và xác nhận.
-   Import: upload CSV/XLSX → gợi ý mapping cột → preview → kiểm tra
    lỗi/trùng → xác nhận import → báo cáo thành công/thất bại.
-   Không ghi đè dữ liệu hiện có nếu chưa xác nhận.
-   AI provider cần abstraction; API key chỉ ở server. Mock chỉ ở
    development và phải được gắn nhãn.

## 3.14 Automation Center

-   Workflow trigger → condition → action.
-   Ví dụ nhắc học phí trước hạn 3 ngày.
-   Preview nội dung, test run, confirm enable, log, retry có kiểm soát,
    pause nhanh.
-   Chống gửi trùng; hiển thị trạng thái tích hợp, quota và phí nếu có.
-   Chỉ hiển thị kênh Zalo/Telegram/email/SMS đã tích hợp thật.

## 3.15 Settings, roles, audit

-   Workspace, user/roles, payment integrations, notifications,
    security, plan/usage, audit logs.
-   Quyền theo vai trò và tenant isolation.
-   Xóa workspace/ngắt thanh toán/đổi tài khoản nhận tiền phải có dialog
    nêu rõ hậu quả.
-   Không xóa lịch sử giao dịch đã phát sinh.

# 4. Responsive behavior

-   \<640px: mobile một cột, bottom nav phù hợp, bảng thành list/card,
    filter dùng bottom sheet, form full width, action bar tôn trọng safe
    area.
-   640--1023px: tablet, sidebar thu gọn, bảng/chart điều chỉnh, không
    overflow ngang.
-   ≥1024px: desktop shell, bảng và drawer đầy đủ.
-   Kiosk có layout riêng.
-   Test ở 1440×900, 1280×800, 768×1024, 390×844.

# 5. Micro-interactions và trạng thái bắt buộc

-   Hover/focus/active/disabled/loading.
-   Skeleton gần với hình dạng nội dung thật.
-   Toast ngắn gọn; thao tác tài chính có kết quả chi tiết.
-   Empty state hướng dẫn hành động đầu tiên.
-   Error state nêu vấn đề và bước xử lý.
-   Form validation đặt cạnh trường.
-   Unsaved changes warning.
-   Tôn trọng `prefers-reduced-motion`; animation nhỏ khoảng 150--220ms.
-   Không hiển thị thành công trước khi server xác nhận.

# 6. Kỹ thuật, thanh toán và bảo mật

-   Kiểm tra framework, routes, dependencies, API, auth, DB và component
    trước khi sửa.
-   Tái sử dụng logic đang chạy; không viết lại toàn bộ nếu không cần.
-   Tổ chức modular, component có thể tái sử dụng, TypeScript nghiêm
    ngặt theo quy ước repo.
-   VND lưu/tính dưới dạng integer hoặc kiểu số phù hợp, không dùng
    floating point tùy tiện.
-   Verify webhook phía server; idempotency và unique constraints.
-   Không xác nhận paid từ client.
-   Xử lý duplicate, partial, overpayment, reversal/refund.
-   Tenant isolation, authorization server-side, audit log.
-   Không expose secrets, bank credentials hoặc dữ liệu cá nhân.
-   Không giả lập integration production.

# 7. AI skills và hướng dẫn project

Kiểm tra skill thực sự có sẵn trong môi trường. Dùng skill phù hợp cho
frontend design, React best practices, accessibility, debugging, testing
và security. Không tuyên bố đã dùng skill/tool nếu không có hoặc chưa
chạy.

Tạo/cập nhật `AGENTS.md` với: - Design tokens và typography. - Component
conventions. - Accessibility. - Responsive requirements. - Testing
commands. - Payment/security constraints. - Quy tắc không dùng fake
interaction hoặc fake production data.

Nếu có skill frontend-design, vercel-react-best-practices,
sleek-design-mobile-apps, code-review-expert, web-design-guidelines,
systematic-debugging, test-driven-development hoặc security-review thì
đọc hướng dẫn trước khi dùng. Không cài đặt hay giả định skill tồn tại
nếu chưa kiểm tra.

# 8. Visual QA và functional QA

-   Chạy ứng dụng thật và xem screenshot khi tooling hỗ trợ.
-   Kiểm tra font tiếng Việt, dấu, font weight, clipping, overlap,
    spacing, table alignment, contrast, keyboard focus, mobile overflow,
    QR.
-   Chụp screenshot sau khi triển khai và sau khi sửa lỗi; không tuyên
    bố đã kiểm tra screenshot nếu chưa thực hiện.
-   Chạy lint, type-check, unit/integration/E2E tests theo scripts có
    trong repo.
-   Kiểm tra workflow end-to-end:
    1.  Đăng nhập.
    2.  Tạo workspace.
    3.  Thêm/import thành viên.
    4.  Điểm danh.
    5.  Tạo khoản thu.
    6.  Tạo payment link/QR khi tích hợp được cấu hình.
    7.  Nhận và verify webhook.
    8.  Đối soát giao dịch.
    9.  Kiểm tra hóa đơn và audit history.
    10. Kiểm tra báo cáo phản ánh đúng dữ liệu nguồn.

# 9. Quy trình thực thi bắt buộc

Phase A: Audit repository và ghi tài liệu. Phase B: Chốt typography,
design tokens, shell, button, input, table, badge, dialog, toast,
empty/loading/error states. Phase C: Hoàn thiện Dashboard + workspace +
member. Phase D: Hoàn thiện Attendance → Billing → VietQR →
Reconciliation. Phase E: Mobile và Sports Kiosk. Phase F: Reports, AI
Assistant, Import Assistant, Automation. Phase G: Visual QA, functional
QA, sửa lỗi, chạy tests.

Sau mỗi phase: - Liệt kê file đã sửa. - Nêu tính năng đã hoạt động và
tính năng còn thiếu. - Chạy checks liên quan. - Không đánh dấu done nếu
chưa kiểm chứng. - Tiếp tục triển khai thay vì chỉ đưa ra kế hoạch.

# 10. Prompt khởi chạy cho Antigravity

Đọc toàn bộ `TINGROSTER_UI_UX_MASTER_PROMPT.md` và `AGENTS.md` trước khi
sửa code. Sau đó audit repository hiện tại, ghi lại framework, routes,
design hiện tại, font đang dùng, API và các tính năng đã hoạt động. Bắt
đầu Phase A rồi Phase B; không sửa hàng loạt màn hình trước khi
typography và design system được chốt.

Ưu tiên sửa dứt điểm vấn đề font tiếng Việt và tính nhất quán UI trước.
Tiếp theo triển khai app shell và Dashboard, sau đó làm end-to-end
workflow Điểm danh → Khoản thu → VietQR → Đối soát. Giữ nguyên business
logic đang chạy. Không thay thế ứng dụng bằng static mockup, không bịa
dữ liệu production, không tạo nút giả.

Hãy tự kiểm tra skill khả dụng, đọc skill liên quan, chạy ứng dụng, kiểm
tra screenshot nếu có thể, sửa các lỗi nhìn thấy và chạy
lint/type-check/tests. Làm theo từng phase và tiếp tục thực hiện; không
dừng ở việc viết kế hoạch. Cuối cùng báo cáo cụ thể những gì đã
implement, các lệnh kiểm tra đã chạy, kết quả thực tế và các giới hạn
còn lại.
