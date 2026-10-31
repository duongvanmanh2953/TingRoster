# TingRoster Production Deployment Guide

Quy trình triển khai sản phẩm lên máy chủ VPS / Cloud (Ubuntu 22.04 / Debian 12 / AWS EC2 / DigitalOcean Droplet).

---

## 1. Chuẩn Bị Máy Chủ (Server Provisioning)

```bash
# 1. Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt Docker & Docker Compose Plugin
sudo apt install -y curl git ufw
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Cấu hình Firewall an toàn (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Nginx)
sudo ufw allow 443/tcp   # HTTPS (Nginx)
# Tuyệt đối KHÔNG mở công khai các cổng nội bộ 5432, 5433, 4000-4100 ra Internet!
sudo ufw enable
```

---

## 2. Tải Mã Nguồn & Cấu Hình Môi Trường

```bash
# Clone repository
git clone https://github.com/your-org/tingroster.git /opt/tingroster
cd /opt/tingroster

# Tạo file môi trường chính thức từ template
cp .env.example .env

# Chỉnh sửa các giá trị thực tế
nano .env
```

Các giá trị bắt buộc phải thay đổi trước khi chạy:
- `DATABASE_URL`: chuỗi kết nối an toàn với mật khẩu ngẫu nhiên phức tạp
- `JWT_SECRET`: sinh chuỗi bí mật ngẫu nhiên: `openssl rand -hex 32`
- `SMTP_*`: thông tin tài khoản SMTP gửi mail chính thức
- `NEXT_PUBLIC_*`: địa chỉ tên miền thực tế (`https://tingroster.vn`,...)

---

## 3. Khởi Chạy Dịch Vụ Với Docker Compose

```bash
# Xây dựng và khởi chạy toàn bộ cụm dịch vụ
docker compose -f docker-compose.multi.yml up -d --build

# Chạy migration database và khởi tạo Super Admin
docker compose -f docker-compose.multi.yml exec app-admin npx prisma db push
docker compose -f docker-compose.multi.yml exec app-admin npx tsx scripts/bootstrap-admin.ts
```

---

## 4. Kiểm Tra Sức Khỏe & Vận Hành (Health Checks)

1. Kiểm tra trạng thái các container:
   ```bash
   docker compose -f docker-compose.multi.yml ps
   ```
2. Kiểm tra log của hệ thống định tuyến Nginx:
   ```bash
   docker compose -f docker-compose.multi.yml logs -f nginx
   ```
3. Kiểm tra endpoint sức khỏe:
   ```bash
   curl -I http://localhost/api/health
   ```
