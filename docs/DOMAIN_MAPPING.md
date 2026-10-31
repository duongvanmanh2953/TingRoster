# TingRoster Domain Mapping & Reverse Proxy Guide

Hướng dẫn chi tiết cấu hình gán tên miền (domain mapping), DNS records và Reverse Proxy Nginx cho toàn bộ hệ thống TingRoster.

---

## 1. Bảng Phân Bổ Tên Miền (Domain Matrix)

| Subdomain Mục Tiêu | Dịch Vụ Phía Sau | Port Nội Bộ | Chức Năng Chính |
| :--- | :--- | :--- | :--- |
| `tingroster.vn` | `app-landing` | `3000` | Trang chủ marketing, tính năng, bảng giá, đăng ký, đăng nhập |
| `www.tingroster.vn` | `app-landing` | `3000` | Alias canonical trỏ về trang chủ |
| `admin.tingroster.vn` | `app-admin` | `4000` | Bảng điều khiển quản trị Platform (Super Admin & Admin) |
| `owner.tingroster.vn` | `app-owner` | `4001` | Cổng quản lý của chủ lớp học, CLB thể thao, chủ nhà trọ |
| `app.tingroster.vn` | `app-owner` | `4001` | Alias thay thế cho chủ cơ sở |
| `member.tingroster.vn` | `app-member` | `4002` | Cổng học viên, phụ huynh, người thuê phòng tra cứu nợ |
| `student.tingroster.vn` | `app-member` | `4002` | Alias phụ cho cổng học viên |
| `kiosk.tingroster.vn` | `app-kiosk` | `4003` | Màn hình Kiosk quét mã tại chỗ |
| `api.tingroster.vn` | `app-api` | `4100` | Cổng tiếp nhận Webhook ngân hàng & API di động |

---

## 2. Cấu Hình Bản Ghi DNS Nhà Đăng Ký (DNS Records)

Cấu hình các bản ghi sau trên trang quản trị tên miền của bạn (Cloudflare, Namecheap, PA Việt Nam, MatBao):

```dns
Type    Name        Value               TTL     Proxy Status
A       @           <SERVER_IP>         Auto    DNS only / Proxied
CNAME   www         tingroster.vn       Auto    DNS only / Proxied
CNAME   admin       tingroster.vn       Auto    DNS only / Proxied
CNAME   owner       tingroster.vn       Auto    DNS only / Proxied
CNAME   app         tingroster.vn       Auto    DNS only / Proxied
CNAME   member      tingroster.vn       Auto    DNS only / Proxied
CNAME   student     tingroster.vn       Auto    DNS only / Proxied
CNAME   kiosk       tingroster.vn       Auto    DNS only / Proxied
CNAME   api         tingroster.vn       Auto    DNS only / Proxied
```

---

## 3. Cấu Hình Nginx Reverse Proxy Mẫu (SSL HTTPS)

TingRoster đã đính kèm sẵn cấu hình reverse proxy tại thư mục `nginx/conf.d/tingroster.conf`.
Để kích hoạt SSL tự động bằng Certbot:

```bash
# Cài đặt Certbot trên máy chủ Linux
sudo apt install -y certbot python3-certbot-nginx

# Cấp chứng chỉ SSL Wildcard hoặc Multi-domain
sudo certbot --nginx -d tingroster.vn -d www.tingroster.vn -d admin.tingroster.vn -d owner.tingroster.vn -d app.tingroster.vn -d member.tingroster.vn -d student.tingroster.vn -d kiosk.tingroster.vn -d api.tingroster.vn
```

### Khối Cấu Hình SSL Nginx Mẫu:

```nginx
server {
    listen 443 ssl http2;
    server_name admin.tingroster.vn;

    ssl_certificate /etc/letsencrypt/live/tingroster.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tingroster.vn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 4. Local Testing Với File Hosts

Để kiểm thử toàn bộ các subdomain tại môi trường phát triển máy cá nhân, thêm các dòng sau vào `/etc/hosts` (Linux/Mac) hoặc `C:\Windows\System32\drivers\etc\hosts`:

```text
127.0.0.1 tingroster.local
127.0.0.1 admin.tingroster.local
127.0.0.1 owner.tingroster.local
127.0.0.1 member.tingroster.local
127.0.0.1 kiosk.tingroster.local
127.0.0.1 api.tingroster.local
```
