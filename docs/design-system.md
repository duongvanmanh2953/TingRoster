# TingRoster — Design System & Visual Tokens

## 1. Bản Sắc Thiết Kế (Brand Identity)
- **Định vị:** Premium Productivity SaaS cho giáo dục & câu lạc bộ thể thao tại Việt Nam.
- **Phong cách:** Sáng sủa, hiện đại, tối giản, đáng tin cậy. Nền sáng (Canvas `#F5F7FB`), bề mặt trắng (`#FFFFFF`), kết hợp Sidebar Dark Navy (`#0B0F19`) tương phản cao.
- **Tính cách:** Thông minh, Đáng tin cậy, Gọn gàng, Thân thiện.
- **Tránh:** Gradient lòe loẹt, giao diện admin generic rẻ tiền, các card lồng card vô nghĩa.

---

## 2. Bảng Màu Ngữ Nghĩa (Semantic Color Palette)

```css
:root {
  /* Nền và Bề mặt */
  --bg-canvas: #F5F7FB;         /* Canvas nền sáng dịu mắt */
  --surface-card: #FFFFFF;      /* Trắng tinh khiết: Bề mặt card chính */
  --surface-muted: #F1F5F9;     /* Slate 100: Bề mặt phụ hoặc input background */
  --border-neutral: #E4E7EC;    /* Viền card và bảng */

  /* Màu thương hiệu & Điểm nhấn */
  --primary-brand: #2538D9;     /* Royal Indigo Blue: Nút chính, logo, điểm nhấn */
  --primary-hover: #1E2DB8;     /* Indigo hover state */
  --accent-violet: #6D5CE8;     /* Tím hiện đại: Điểm nhấn, icon */

  /* Văn bản */
  --text-primary: #101828;      /* Tiêu đề, số tiền chính */
  --text-secondary: #475467;    /* Nhãn phụ, mô tả */
  --text-muted: #98A2B3;        /* Placeholder, metadata */

  /* Trạng thái tài chính cốt lõi (Bắt buộc nhất quán theo AGENTS.md) */
  --status-unpaid-bg: #FFF1F2;  /* Rose 50 */
  --status-unpaid-text: #BE123C;/* Rose 700 */
  --status-unpaid-border: #FECDD3; /* Rose 200 */

  --status-partial-bg: #FFFBEB; /* Amber 50 */
  --status-partial-text: #B45309;/* Amber 700 */
  --status-partial-border: #FDE68A; /* Amber 200 */

  --status-paid-bg: #ECFDF5;    /* Emerald 50 */
  --status-paid-text: #047857;  /* Emerald 700 */
  --status-paid-border: #A7F3D0;/* Emerald 200 */

  --status-overpaid-bg: #EFF6FF;/* Blue 50 */
  --status-overpaid-text: #1D4ED8; /* Blue 700 */
  --status-overpaid-border: #BFDBFE; /* Blue 200 */
}
```

---

## 3. Thang Typography & Phân Cấp Chữ (Be Vietnam Pro)
- **Gia đình font:** `Be Vietnam Pro`, `sans-serif` (hỗ trợ tiếng Việt hoàn hảo, không lệch dấu).
- **Page Title:** `text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight`
- **Section Title:** `text-base sm:text-lg font-bold text-[#101828]`
- **Card Subtitle:** `text-xs text-[#475467] font-medium`
- **Chỉ số tài chính lớn (KPIs):** `text-2xl sm:text-3xl font-extrabold font-mono tracking-tight`
- **Mã giao dịch / Mã thanh toán:** `font-mono font-bold text-xs tracking-wider`
- **Nội dung body:** `text-sm text-[#475467] leading-relaxed`

---

## 4. Quy Chuẩn Tương Tác & Công Thái Học (Ergonomics)
- Mọi nút bấm, tab và mục chọn trên giao diện di động phải đạt kích thước tối thiểu **44x44px**.
- Trạng thái `hover`, `active:scale-95`, `disabled:opacity-50` phải có hiệu ứng mượt mà (150ms-220ms).
- Phím tắt bàn phím và outline `focus:ring-2 focus:ring-[#2538D9]` đầy đủ cho Accessibility (a11y).
- Toasts và thông báo thành công biến mất sau 3.5 giây.
