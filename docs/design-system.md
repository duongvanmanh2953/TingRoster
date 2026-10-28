# TINGROSTER — TÀI LIỆU HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM & UI TOKENS)

---

## 1. TRIẾT LÝ THIẾT KẾ

**Định vị:** *Premium Operational SaaS — Calm, Precise, Confident (Bình tĩnh, Chính xác, Đáng tin cậy).*

- **Tính chất sản phẩm:** Là công cụ làm việc trực tiếp với dòng tiền và dữ liệu quản lý hàng ngày của giáo viên, chủ nhà trọ và chủ CLB. Thiết kế phải ưu tiên sự rõ ràng, tính tổ chức cao, loại bỏ các chi tiết trang trí rườm rà (no gratuitous gradients, no excessive shadows).
- **Phân cấp thị giác (Visual Hierarchy):** Dữ liệu tài chính quan trọng nhất phải nổi bật ngay lập tức khi mở màn hình, có nhãn trạng thái đi kèm text rõ ràng, không chỉ dựa vào màu sắc đơn thuần.

---

## 2. BẢNG MÀU CHUẨN MỰC (DESIGN COLOR TOKENS)

### 2.1. Màu Thương Hiệu & Giao Diện
- **Primary Brand:** `#3344D6` (Royal Indigo / Deep Blue)
- **Primary Soft:** `#EEF2FF` (Nền nút hover hoặc active pill)
- **Accent Violet:** `#7667EA`
- **Canvas (Nền App Light):** `#F5F7FB`
- **Surface (Card / Thẻ nền Light):** `#FFFFFF`
- **Border Neutral:** `#E4E7EC`
- **Text Chính (Primary):** `#111827`
- **Text Phụ (Secondary):** `#475467`
- **Text Làm mờ (Muted):** `#667085`

### 2.2. Màu Sắc Trạng Thái Nghiệp Vụ & Tài Chính (Chuẩn AGENTS.md)
| Trạng thái | Mã Hex | Tailwind Token | Ý nghĩa áp dụng |
| :--- | :--- | :--- | :--- |
| **Thành công / Đã thu đủ** | `#067647` | `bg-emerald-50 text-emerald-700 border-emerald-200` | Hóa đơn đã thanh toán 100%, Webhook khớp |
| **Cảnh báo / Quá hạn nhẹ** | `#B54708` | `bg-amber-50 text-amber-700 border-amber-200` | Đóng thiếu, nợ quá hạn 1-7 ngày, sắp hết hạn |
| **Nguy hiểm / Quá hạn nặng**| `#B42318` | `bg-rose-50 text-rose-700 border-rose-200` | Chưa đóng, nợ quá hạn >30 ngày, Webhook lỗi |
| **Thông tin / Đóng thừa** | `#175CD3` | `bg-blue-50 text-blue-700 border-blue-200` | Đóng thừa tiền, hệ thống đang xử lý, link QR |

---

## 3. TYPOGRAPHY TIẾNG VIỆT & TABULAR NUMERALS

- **Font chữ chính:** `Be Vietnam Pro` (Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold).
- **Fallback chuẩn:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- **Cấu hình Tabular Numerals (`tnum`):**
  * Tất cả các số tiền VND và mã giao dịch đều được áp dụng thuộc tính CSS: `font-feature-settings: "tnum" 1, "cv01" 1; font-variant-numeric: tabular-nums;`.
  * Đảm bảo các con số có cùng bề ngang, các cột tiền trong bảng và thẻ KPI thẳng tắp, không bị thụt thò khi cập nhật số liệu.
- **Thang kích thước chữ (Type Scale):**
  * Page Title: `28px – 32px` (font-bold)
  * Section Title: `18px – 22px` (font-bold)
  * Body Text: `14px – 15px` (font-normal / line-height: 1.5 - 1.6)
  * Caption & Label: `12px – 13px` (font-semibold)
  * KPI Primary Metric: `26px – 30px` (font-bold, mono tnum)

---

## 4. QUY CHUẨN THÀNH PHẦN MATERIAL UI & TAILWIND

1. **Buttons (MuiButton):**
   - Variant Contained: Nền `#3344D6`, text trắng, bo góc `10px`, hover `#2535B8`, không viết hoa toàn bộ (text-transform: none), font-semibold.
   - Variant Outlined: Viền `#E4E7EC`, text `#344054`, hover `#F9FAFB`.
2. **Inputs (MuiOutlinedInput / TextField):**
   - Chiều cao chuẩn 40px - 44px, viền bo `10px`, màu viền `#E4E7EC`, focus ring `#3344D6`.
3. **Card & Surface Containers:**
   - Bo góc `12px – 16px`, viền `1px solid #E4E7EC`, đổ bóng mờ tinh tế (`box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06)`).
4. **Dialogs & Popups:**
   - Bo góc `16px – 20px`, backdrop mờ, tự động đóng khi nhấp chuột ra ngoài (click outside backdrop), hỗ trợ cả Light và Dark Mode.
5. **Responsive Breakpoints:**
   - Mobile: `390px` và `430px`
   - Tablet: `768px`
   - Laptop: `1280px`
   - Desktop: `1440px+`
