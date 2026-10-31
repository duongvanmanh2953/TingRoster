# TingRoster Docker & Containerization Setup Guide

Hướng dẫn chi tiết về việc xây dựng, khởi chạy và vận hành hệ thống TingRoster bằng Docker và Docker Compose.

---

## 1. Yêu Cầu Tiên Quyết (Prerequisites)

- Docker Engine phiên bản `>= 24.0`
- Docker Compose phiên bản `>= 2.20`
- Đảm bảo các cổng không bị xung đột trên máy chủ: `5433` (Postgres local), `3000` (Landing), `4000` (Admin), `4001` (Owner), `4002` (Member), `4003` (Kiosk), `4100` (API), `80/443` (Nginx).

---

## 2. Các Chế Độ Vận Hành (Operating Modes)

### Chế độ A: Triển Khai Toàn Diện Đa Dịch Vụ (Multi-Service Production Architecture)
Sử dụng cấu hình `docker-compose.multi.yml` để phân tách từng dịch vụ chạy độc lập trên các cổng mục tiêu và tích hợp Nginx Reverse Proxy:

```bash
# 1. Khởi động cụm dịch vụ (Database + 6 Micro-applications + Nginx)
docker compose -f docker-compose.multi.yml up -d --build

# 2. Kiểm tra trạng thái sức khỏe các container
docker compose -f docker-compose.multi.yml ps

# 3. Xem nhật ký của một service cụ thể (ví dụ: app-admin hoặc nginx)
docker compose -f docker-compose.multi.yml logs -f app-admin
```

### Chế độ B: Chạy Cơ Sở Dữ Liệu Riêng Cho Development
Khi lập trình frontend/backend trực tiếp trên máy chủ máy phát triển:

```bash
# Chỉ chạy container PostgreSQL trên port 5433
docker compose up -d postgres

# Đồng bộ schema và tạo admin
npm run db:push
npm run bootstrap:admin

# Chạy giao diện theo cổng tùy chọn
npm run dev:landing   # Cổng 3000
npm run dev:admin     # Cổng 4000
npm run dev:owner     # Cổng 4001
```

---

## 3. Quản Lý Dữ Liệu & Volume Persistence

Dữ liệu PostgreSQL được lưu trữ bền vững tại Docker volume `pgdata`.

- **Kiểm tra volume:**
  ```bash
  docker volume inspect tingroster_pgdata
  ```
- **Sao lưu trực tiếp từ container đang chạy:**
  ```bash
  docker exec -t tingroster-db pg_dump -U tingroster tingroster > tingroster_backup_$(date +%F).sql
  ```
- **Xóa sạch toàn bộ volume (Chỉ dùng khi muốn reset môi trường dev hoàn toàn):**
  ```bash
  docker compose down -v
  ```

---

## 4. Tối Ưu Hóa Multi-stage Dockerfile

File `Dockerfile` của TingRoster được thiết kế 2 tầng:
1. **Builder Stage (`node:20-alpine`):** Cài đặt dependencies, sinh Prisma client và biên dịch Next.js sang chế độ Standalone (`output: 'standalone'`).
2. **Runner Stage (`node:20-alpine`):** Chỉ sao chép các file tĩnh (`public`, `.next/static`) và file thực thi tối giản `server.js`, chạy dưới quyền người dùng không có đặc quyền root (`nextjs:nodejs`), giúp giảm kích thước image xuống dưới 180MB và gia tăng tính bảo mật tuyệt đối.
