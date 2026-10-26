# AGENTS.md — TingRoster Core Engineering & Collaboration Guide

## 1. Product Vision
**TingRoster** là nền tảng quản lý điểm danh, học phí và tự động đối soát giao dịch ngân hàng bằng VietQR hàng đầu tại Việt Nam dành cho:
- Giáo viên dạy thêm & Trung tâm giáo dục.
- Chủ câu lạc bộ thể thao (Pickleball, Cầu lông, Bóng đá, Gym).
- Chủ phòng trọ / căn hộ dịch vụ mini.

**Thông điệp sản phẩm:** "Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo."

---

## 2. Tech Stack
- **Framework:** Next.js 14+ (App Router, Server Components by default).
- **Ngôn ngữ:** TypeScript Strict Mode (Zero `any`).
- **Styling & UI:** Tailwind CSS, Lucide React, Radix UI primitive patterns.
- **ORM & Database:** Prisma ORM, PostgreSQL 16 (chạy trên Docker hoặc Cloud Postgres).
- **Validation:** Zod schemas trên mọi runtime boundary (API payload, webhooks, forms).
- **Authentication:** JWT HTTP-only Cookies & Password Hashing bằng bcrypt.
- **Testing:** Vitest (Unit & Integration tests).
- **Containerization:** Multi-stage Dockerfile, Docker Compose.

---

## 3. Design System & UX Standards
- **Thương hiệu:** SaaS hiệu suất cao (Productivity SaaS), phong cách tối giản, đáng tin cậy.
- **Màu sắc trạng thái tài chính (bắt buộc):**
  - Chưa đóng: `bg-rose-50 text-rose-700 border-rose-200`
  - Đóng thiếu: `bg-amber-50 text-amber-700 border-amber-200`
  - Đã đóng đủ: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Đóng thừa: `bg-blue-50 text-blue-700 border-blue-200`
- **Tiền tệ:** Tiền VND luôn là số nguyên (`Int`), định dạng qua hàm `formatVND()`.
- **Ngôn ngữ:** 100% tiếng Việt tự nhiên, trực quan, không dùng thuật ngữ backend nội bộ.

---

## 4. Cấu Trúc Thư Mục
```text
tingroster/
├── docs/                 # Kiến trúc, thiết kế, luồng người dùng & audit
├── prisma/
│   ├── schema.prisma     # Định nghĩa data models & enums
│   └── seed.ts           # Dữ liệu mẫu kiểm thử
├── public/               # Static assets & icons
├── src/
│   ├── app/              # Next.js App Router (pages & API route handlers)
│   ├── components/       # UI design system & domain components
│   ├── lib/              # Providers, auth, db singleton, utils, reconciliation
│   └── server/           # Domain services, policies, notifications, AI assistants
└── tests/                # Unit & Integration test suites
```

---

## 5. Security & Payment Integrity Rules
1. **Lũy đẳng (Idempotency):** Unique constraint `[provider, providerTransactionId]` tại database ngăn chặn cộng trùng tiền từ webhook.
2. **Giao dịch nguyên tử (`prisma.$transaction`):** Cập nhật hóa đơn, ghi nhật ký phân bổ (`PaymentAllocation`), và tạo outbox event trong cùng 1 transaction.
3. **Phân quyền chặt chẽ:** Tất cả API cá nhân phải kiểm tra quyền sở hữu `userId`.
4. **Bảo vệ dữ liệu công khai:** Cổng phụ huynh chỉ dùng `publicToken` ngẫu nhiên có độ dài an toàn; không hiển thị số điện thoại hoặc công nợ của học sinh khác.
5. **An toàn Secret:** Không commit API key, secret token vào git hoặc in ra console log.

---

## 6. AI Skills & Development Rules
- Luôn kiểm tra và kích hoạt các skills phù hợp: `frontend-design`, `code-expert`, `vercel-react-best-practices`, `security-review`, `code-review-expert`.
- Không tạo component hoặc nút bấm giả không hoạt động.
- Mọi màn hình phải có đủ 4 trạng thái: Loading, Empty, Error, Success.

---

## 7. Cách Chạy & Kiểm Thử
```bash
# Chạy Docker cụm đầy đủ (PostgreSQL 5433 + Next.js App 3001)
docker compose up -d

# Đồng bộ database & seed dữ liệu mẫu
$env:DATABASE_URL="postgresql://tingroster:tingroster_secret_password@localhost:5433/tingroster?schema=public"; npx prisma db push; npm run db:seed

# Chạy kiểm thử tự động
npm test

# Kiểm tra kiểu dữ liệu
npm run typecheck

# Build gói production
npm run build
```

---

## 8. Definition of Done (DoD)
- Không có lỗi TypeScript (`tsc --noEmit` exit 0).
- Tất cả unit & integration tests pass 100%.
- Không có nút bấm hoặc link chết.
- Đầy đủ thông báo, trạng thái phản hồi và hướng dẫn sử dụng.
- Docker container build và chạy trơn tru.
