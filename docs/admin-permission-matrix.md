# TingRoster Platform Admin — Permission & Role Matrix

## 1. Phân Cấp Quyền Hạn (RBAC Architecture)

Hệ thống phân chia rõ ràng giữa quyền quản trị nền tảng (Platform Roles) và quyền tại cơ sở khách hàng (Workspace Roles).

| Role Code | Tên vai trò | Quyền hạn & Phạm vi | Thao tác tài chính cho phép |
|---|---|---|---|
| `SUPER_ADMIN` | Quản trị viên Tối cao | Toàn quyền kiểm soát hệ thống, phân quyền admin, cấu hình biểu phí | Cộng tiền ví dịch vụ (có lý do), xem sổ cái, điều chỉnh cấu hình |
| `OPS_ADMIN` | Vận hành & Kỹ thuật | Giám sát webhook, restart jobs, theo dõi SLA, xử lý gateway | Không được sửa số dư ví dịch vụ |
| `FINANCE_ADMIN` | Kế toán & Đối soát | Quản lý sổ cái ví cước, duyệt đơn nạp tiền, theo dõi MRR và đối soát | Tạo bút toán ghi sổ cái `CreditLedgerEntry` (append-only) |
| `SUPPORT_ADMIN` | Chăm sóc Khách hàng | Tiếp nhận ticket, gia hạn trial 30 ngày (có lý do), hỗ trợ kỹ thuật | Xem thông tin masked, không xem PII nhạy cảm, không sửa tiền |
| `WORKSPACE_OWNER` | Chủ cơ sở (Khách hàng) | Toàn quyền tại workspace của mình (lớp học, phòng trọ, hóa đơn VietQR) | Nạp tiền vào ví dịch vụ để duy trì TingRoster |
| `WORKSPACE_STAFF` | Nhân viên cơ sở | Điểm danh học viên, tạo hóa đơn thu tiền học/tiền phòng | Không thấy số dư ví TingRoster của chủ cơ sở |
| `MEMBER_PAYER` | Học viên / Khách thuê | Quét mã VietQR thanh toán tiền học/tiền trọ | Miễn phí 100%, không cần tài khoản TingRoster |

---

## 2. Nguyên Tắc Bảo Mật & Thao Tác Nhạy Cảm (Sensitive Action Guards)
1. **Append-Only Credit Ledger:** Tuyệt đối không cho phép chạy lệnh `UPDATE user_balance` trực tiếp. Mọi biến động phải tạo mới `CreditLedgerEntry` với các trường `amount`, `balanceAfter`, `reason`, `adminUserId`.
2. **Masked PII (Bảo vệ thông tin cá nhân):** Số điện thoại và email của người dùng được che mặc định (VD: `098***4321`, `minh***@gmail.com`).
3. **Audit Trail Bắt Buộc:** Mọi hành động nhạy cảm (Cộng tiền ví, Gia hạn trial, Khóa cơ sở, Thay đổi biểu phí) bắt buộc phải nhập lý do giải trình và được lưu vết tại bảng `AuditLog`.
