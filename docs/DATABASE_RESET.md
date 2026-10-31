# TingRoster Database Reset & Data Sanitization Guide

Quy chuẩn an toàn về việc làm sạch cơ sở dữ liệu, dọn dẹp tài khoản kiểm thử và ngăn ngừa xóa nhầm dữ liệu môi trường Production.

---

## 1. Cơ Chế Bảo Vệ Ngăn Chặn Tai Nạn (Safety Safeguards)

Script `scripts/safe-db-reset.ts` được lập trình với 4 lớp kiểm tra an toàn bắt buộc:

1. **Phát hiện máy chủ Production qua Hostname:**
   - Nếu `DATABASE_URL` trỏ tới bất kỳ địa chỉ nào không phải `localhost`, `127.0.0.1` hoặc container nội bộ `postgres`, script sẽ **ngay lập tức hủy bỏ thực thi** với mã lỗi `ABORTED_PRODUCTION_DETECTED`.
2. **Cờ Xác Nhận Cố Ý (`--force`):**
   - Chỉ khi truyền tham số `--force`, script mới tiến hành xóa dữ liệu.
3. **Giữ Lại Schema & Migration History:**
   - Tuyệt đối **không** dùng `DROP DATABASE` hoặc `DROP SCHEMA`.
   - Giữ nguyên toàn bộ cấu trúc bảng, khóa ngoại, chỉ mục và bảng `_prisma_migrations`.
4. **Không Tự Động Re-seed Dữ Liệu Rác:**
   - Không chèn các tài khoản demo như `demo@tingroster.vn`, không sinh các giao dịch giả mạo.

---

## 2. Quy Trình Làm Sạch Dữ Liệu An Toàn

### Bước 1: Sao Lưu Cơ Sở Dữ Liệu (Backup)
Trước khi thực hiện bất kỳ thao tác xóa nào, hãy sao lưu:

```bash
# Đối với PostgreSQL chạy trong Docker container tingroster-db:
docker exec -t tingroster-db pg_dump -U tingroster tingroster > backup_before_reset_$(date +%Y%m%d_%H%M%S).sql
```

### Bước 2: Thực Hiện Reset Dữ Liệu Kiểm Thử

```bash
# Sử dụng script reset an toàn đã tích hợp
npm run db:clean
```

Kết quả thực hiện sẽ báo cáo chi tiết:
- Số lượng bản ghi đã xóa trên từng bảng (`AttendanceRecord`, `Invoice`, `Member`, `Group`, `User`, `AuditLog`, `EmailDeliveryLog`, v.v.).
- Trạng thái CSDL sạch sẽ sẵn sàng cho người dùng thật.

### Bước 3: Khởi Tạo Super Admin Duy Nhất

Sau khi làm sạch dữ liệu, tạo tài khoản Super Admin thực sự:

```bash
npm run bootstrap:admin
```

---

## 3. Khôi Phục Dữ Liệu Khi Cần Thiết (Restore Procedure)

Nếu cần khôi phục lại dữ liệu từ file backup:

```bash
cat backup_file.sql | docker exec -i tingroster-db psql -U tingroster -d tingroster
```
