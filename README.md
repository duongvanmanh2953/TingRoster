# TingRoster — Sổ Điểm Danh & Tự Động Đối Soát Thu Phí Bằng VietQR

> "Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo."

TingRoster là giải pháp SaaS All-in-One dành cho **Giáo viên dạy thêm**, **Chủ câu lạc bộ thể thao / sân cầu lông, bóng đá** và **Chủ nhà trọ**. Hệ thống tự động tạo mã VietQR theo chuẩn QuickLink, tích hợp Webhook SePay & Casso để gạch nợ tức thì trong vòng 5 giây mà không cần kiểm tra sao kê thủ công hay yêu cầu phụ huynh chụp màn hình chuyển khoản.

---

## 🚀 Tính năng nổi bật

1. **Điểm danh một chạm (Daily Roster Matrix):** Giao diện ma trận tối ưu chạm trên điện thoại & máy tính bảng. Tự động tính học phí theo buổi hoặc cố định tháng.
2. **Mã VietQR riêng biệt:** Mỗi học viên/thành viên có mã thanh toán ngẫu nhiên bảo mật (dạng `TR84920`). Quét mã có sẵn số tiền và nội dung chuyển khoản.
3. **Reconciliation Engine:**
   - Xử lý Webhook SePay & Casso nguyên tử (`prisma.$transaction`).
   - Idempotency chống cộng trùng khi webhook gửi lại.
   - Phân loại trạng thái: `UNPAID` (Chưa đóng), `PARTIAL` (Đóng thiếu), `PAID` (Đã đóng đủ), `OVERPAID` (Đóng thừa).
   - Giao dịch sai nội dung được đưa vào hàng đợi `UNMATCHED` để gán thủ công một chạm.
4. **Cổng phụ huynh công khai (`/p/[slug]`):** Phụ huynh mở link từ Zalo, chọn học viên và quét VietQR trực tiếp. Tự động hiển thị trạng thái "Đã đóng" ngay sau khi chuyển khoản.
5. **Chế độ Kiosk iPad tại sân (`/kiosk/[groupId]`):** Dành cho sân thể thao: Chạm tên người chơi, hiện QR lớn, phát âm thanh "Ting" chào mừng khi giao dịch thành công.
6. **Thông báo Telegram Bot:** Báo tức thì biến động thu phí về điện thoại cá nhân.

---

## 🐳 Triển khai với Docker (Khuyên dùng)

Hệ thống được đóng gói sẵn với Docker Compose bao gồm ứng dụng Next.js Standalone và cơ sở dữ liệu PostgreSQL 16:

### 1. Khởi động hệ thống với Docker Compose

```bash
docker compose up -d
```

Lệnh trên sẽ:
- Khởi động PostgreSQL 16 trên cổng `5432` với healthcheck.
- Build Dockerfile nhiều giai đoạn (Multi-stage build).
- Khởi chạy ứng dụng TingRoster trên cổng `http://localhost:3000`.

### 2. Chạy migration và seed dữ liệu mẫu trong Docker

```bash
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```

---

## 💻 Hướng dẫn chạy môi trường Development

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Thiết lập biến môi trường
Sao chép `.env.example` thành `.env`:
```bash
cp .env.example .env
```

### 3. Khởi tạo cơ sở dữ liệu
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Chạy dev server
```bash
npm run dev
```
Truy cập ứng dụng tại `http://localhost:3000`.

Tài khoản demo có sẵn:
- **Email:** `demo@tingroster.vn`
- **Mật khẩu:** `123456`

---

## 🧪 Kiểm thử (Testing)

Chạy bộ unit test kiểm tra sinh mã thanh toán, regex trích xuất, VietQR QuickLink, chuẩn hóa SePay/Casso và máy trạng thái tài chính:

```bash
npm test
```

Kiểm tra kiểu dữ liệu TypeScript nghiêm ngặt:
```bash
npm run typecheck
```

---

## 🔌 Cấu hình Webhook SePay & Casso

### SePay Webhook
- **Webhook URL:** `https://your-domain.com/api/webhooks/sepay`
- **Authorization:** Thêm API Key khớp với biến `SEPAY_WEBHOOK_API_KEY` trong `.env`.

### Casso Webhook
- **Webhook URL:** `https://your-domain.com/api/webhooks/casso`
- **Header:** `secure-token` khớp với biến `CASSO_WEBHOOK_SECURE_TOKEN` trong `.env`.
