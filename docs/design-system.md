# TingRoster — Design System & Visual Tokens (Giai đoạn D)

## 1. Bản Sắc Thiết Kế (Brand Identity)
- **Định vị:** Premium Productivity SaaS cho giáo dục & câu lạc bộ thể thao tại Việt Nam.
- **Tính cách:** Thông minh, Đáng tin cậy, Gọn gàng, Thân thiện.
- **Tránh:** Gradient lòe loẹt, giao diện admin generic rẻ tiền, các card lồng card vô nghĩa.

---

## 2. Bảng Màu Ngữ Nghĩa (Semantic Color Palette)

```css
:root {
  /* Nền và Bề mặt */
  --bg-app: #f8fafc;           /* Slate 50: Nền tổng thể sạch sẽ, ấm áp */
  --surface-card: #ffffff;      /* Trắng: Bề mặt card chính */
  --surface-muted: #f1f5f9;     /* Slate 100: Bề mặt phụ hoặc input background */

  /* Màu thương hiệu & Điểm nhấn */
  --primary-brand: #4f46e5;     /* Indigo 600: Nút chính, logo, điểm nhấn */
  --primary-hover: #4338ca;     /* Indigo 700: Hover state */
  --primary-subtle: #eef2ff;    /* Indigo 50: Nền badge, active item */

  /* Trạng thái tài chính cốt lõi (Bắt buộc nhất quán) */
  --status-unpaid-bg: #fff1f2;  /* Rose 50 */
  --status-unpaid-text: #be123c;/* Rose 700 */
  --status-unpaid-border: #fecdd3; /* Rose 200 */

  --status-partial-bg: #fffbeb; /* Amber 50 */
  --status-partial-text: #b45309;/* Amber 700 */
  --status-partial-border: #fde68a; /* Amber 200 */

  --status-paid-bg: #ecfdf5;    /* Emerald 50 */
  --status-paid-text: #047857;  /* Emerald 700 */
  --status-paid-border: #a7f3d0;/* Emerald 200 */

  --status-overpaid-bg: #eff6ff;/* Blue 50 */
  --status-overpaid-text: #1d4ed8; /* Blue 700 */
  --status-overpaid-border: #bfdbfe; /* Blue 200 */
}
```

---

## 3. Thang Typography & Phân Cấp Chữ
- **Page Header:** `text-2xl font-black text-slate-900 tracking-tight`
- **Section Title:** `text-base font-bold text-slate-900`
- **Card Subtitle:** `text-xs text-slate-500 font-medium`
- **Chỉ số tài chính lớn (KPIs):** `text-2xl font-black font-mono`
- **Mã giao dịch / Mã thanh toán:** `font-mono font-bold text-xs tracking-wider`
- **Nội dung body:** `text-sm text-slate-700 leading-relaxed`

---

## 4. Quy Chuẩn Tương Tác & Công Thái Học (Ergonomics)
- Mọi nút bấm, tab và mục chọn trên giao diện di động phải đạt kích thước tối thiểu **44x44px**.
- Trạng thái `hover`, `active:scale-95`, `disabled:opacity-50` phải có hiệu ứng mượt mà.
- Phím tắt bàn phím và outline `focus:ring-2 focus:ring-indigo-500` đầy đủ cho Accessibility (a11y).
- Toasts và thông báo thành công biến mất sau 3.5 giây.
