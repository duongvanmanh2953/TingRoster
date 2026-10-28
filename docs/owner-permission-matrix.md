# MA TRẬN PHÂN QUYỀN WORKSPACE (OWNER PERMISSION MATRIX)

Tài liệu này định nghĩa ma trận phân quyền chi tiết (RBAC) áp dụng chặt chẽ từ giao diện người dùng đến các API Route Handlers phía máy chủ.

---

## 1. CÁC VAI TRÒ TRONG HỆ THỐNG WORKSPACE

1. **Workspace Owner (Chủ Cơ Sở):**
   - Người sáng lập workspace, chịu trách nhiệm pháp lý và tài chính cao nhất.
   - Có toàn quyền với mọi dữ liệu, phân quyền nhân viên và quản lý gói cước TingRoster.

2. **Billing Admin (Quản Trị Thanh Toán Phần Mềm):**
   - Được Owner ủy quyền quản lý số dư ví dịch vụ TingRoster, nạp tiền, nâng cấp gói và xem hóa đơn phần mềm TingRoster.
   - Không được xóa workspace hoặc can thiệp vào tài khoản ngân hàng riêng của Owner.

3. **Workspace Manager (Quản Lý Cơ Sở / Trợ Lý Giảng Dạy / Trưởng Khu Trọ):**
   - Quản lý vận hành hàng ngày: lớp học, học viên, khách thuê phòng, điểm danh, tạo đợt thu học phí/tiền phòng.
   - Được xem báo cáo vận hành, đối soát giao dịch VietQR của cơ sở.
   - **Không được truy cập số dư ví TingRoster hoặc cấu hình nạp tiền gói cước**.

4. **Workspace Staff (Nhân Viên Vận Hành / Điểm Danh / Thu Ngân):**
   - Thực hiện các tác vụ cụ thể: điểm danh học viên, tạo khoản thu lẻ, xem trạng thái đóng tiền.
   - **Bị giới hạn:** Không được export toàn bộ cơ sở dữ liệu nhạy cảm, không được xóa dữ liệu lịch sử, không được xem mục Billing.

5. **Member / Payer (Học Viên, Phụ Huynh, Khách Thuê Phòng):**
   - Chỉ có thể truy cập qua link hóa đơn công khai bảo mật với `publicToken` ngẫu nhiên.
   - Tuyệt đối không nhìn thấy công nợ, số điện thoại hay thông tin của các học viên/khách thuê khác.

---

## 2. MA TRẬN QUYỀN HẠN CHI TIẾT

| Chức năng / Tác vụ | Owner | Billing Admin | Manager | Staff | Payer | Enforce Layer |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Xem Dashboard KPI Doanh thu & Dòng tiền** | ✓ | ✗ | ✓ | ✗ | ✗ | UI & API |
| **Tạo, sửa, xóa Workspace / Lớp học / Phòng** | ✓ | ✗ | Sửa/Tạo | ✗ | ✗ | Server API |
| **Thêm, sửa, import danh sách Thành viên** | ✓ | ✗ | ✓ | Thêm/Sửa | ✗ | Server API |
| **Thực hiện Điểm danh & Sửa điểm danh** | ✓ | ✗ | ✓ | ✓ | ✗ | Server API |
| **Tạo đợt thu tiền & Sinh link VietQR** | ✓ | ✗ | ✓ | ✓ | ✗ | Server API |
| **Gạch nợ thủ công (khi nhận tiền mặt)** | ✓ | ✗ | ✓ | Cần duyệt | ✗ | Server API + Audit |
| **Hủy hóa đơn khoản thu có ghi lý do** | ✓ | ✗ | ✓ | ✗ | ✗ | Server API + Audit |
| **Gán giao dịch VietQR chưa khớp nội dung** | ✓ | ✗ | ✓ | ✗ | ✗ | Server API + Audit |
| **Xem Báo cáo Tổng hợp Dòng tiền & Công nợ** | ✓ | ✗ | ✓ | ✗ | ✗ | UI & API |
| **Xuất dữ liệu Bàn giao Kế toán (Export)** | ✓ | ✗ | Giới hạn | ✗ | ✗ | Server API + Audit |
| **Xem Biên nhận thu tiền nội bộ** | ✓ | ✗ | ✓ | ✓ | Chỉ của mình | Public Token |
| **Xem Số dư ví nạp & Quản lý Gói TingRoster** | **✓** | **✓** | **✗ (Ẩn)** | **✗ (Ẩn)** | **✗ (Ẩn)** | **UI & Server Route** |
| **Nạp tiền ví dịch vụ TingRoster (Top-Up)** | **✓** | **✓** | **✗** | **✗** | **✗** | **Server API** |
| **Cấu hình STK ngân hàng nhận tiền VietQR** | ✓ | ✗ | ✗ | ✗ | ✗ | Server API |
| **Phân quyền & Mời nhân viên vào Workspace** | ✓ | ✗ | ✗ | ✗ | ✗ | Server API |

---

## 3. NGUYÊN TẮC ENFORCEMENT PHÍA SERVER

1. **Không bảo mật bằng cách ẩn giao diện:** Mọi API Endpoint (ví dụ `/api/wallet`, `/api/settings/bank`, `/api/invoices/cancel`) đều kiểm tra session và vai trò người dùng trong JWT/Database.
2. **Nguyên tắc đặc quyền tối thiểu (Least Privilege):** Nhân viên (Staff) chỉ được cấp quyền thao tác trên đúng lớp học hoặc phân khu được chỉ định.
3. **Audit Log cho hành động tài chính nhạy cảm:** Mọi thao tác hủy khoản thu, gạch nợ thủ công tiền mặt, xuất toàn bộ dữ liệu thành viên đều được ghi nhật ký vào bảng `AdminAuditLog` kèm IP và ID người thao tác.
