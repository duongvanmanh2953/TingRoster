import { PrismaClient, GroupType, BillingCycle, MemberStatus, AttendanceStatus, InvoiceStatus, ProviderType, TransactionDirection, ProcessingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TingRoster development data...');

  // 1. Create or upsert Demo User
  const passwordHash = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@tingroster.vn' },
    update: {
      passwordHash,
      bankId: 'MB',
      bankAccountNo: '0987654321',
      bankAccountName: 'NGUYEN VAN TUAN',
    },
    create: {
      email: 'demo@tingroster.vn',
      name: 'Thầy Nguyễn Văn Tuấn',
      passwordHash,
      bankId: 'MB',
      bankAccountNo: '0987654321',
      bankAccountName: 'NGUYEN VAN TUAN',
      planType: 'PRO',
    },
  });

  console.log(`User created: ${user.email} (${user.id})`);

  // Clean up previous test seed data for this user to allow re-seeding
  await prisma.paymentAllocation.deleteMany({ where: { invoice: { userId: user.id } } });
  await prisma.invoice.deleteMany({ where: { userId: user.id } });
  await prisma.attendance.deleteMany({ where: { group: { userId: user.id } } });
  await prisma.member.deleteMany({ where: { group: { userId: user.id } } });
  await prisma.group.deleteMany({ where: { userId: user.id } });
  await prisma.transactionLog.deleteMany({ where: { userId: user.id } });
  await prisma.automationRule.deleteMany({ where: { userId: user.id } });

  // 2. Create Group 1: Lớp Toán 12A
  const classGroup = await prisma.group.upsert({
    where: { slug: 'lop-toan-12a' },
    update: {},
    create: {
      userId: user.id,
      name: 'Lớp Toán 12A Thầy Tuấn',
      slug: 'lop-toan-12a',
      description: 'Luyện thi THPT Quốc Gia - Lịch học Thứ 3 và Thứ 5 hàng tuần',
      defaultFee: 600000,
      billingCycle: BillingCycle.MONTHLY,
      groupType: GroupType.CLASS,
      isActive: true,
      publicPortalEnabled: true,
    },
  });

  // Create Group 2: CLB Cầu Lông
  const sportsGroup = await prisma.group.upsert({
    where: { slug: 'clb-cau-long' },
    update: {},
    create: {
      userId: user.id,
      name: 'CLB Cầu Lông TingRoster',
      slug: 'clb-cau-long',
      description: 'Sân 3 và 4 Cầu Lông Kỳ Hòa - Sinh hoạt Thứ 2, 4, 6',
      defaultFee: 50000,
      billingCycle: BillingCycle.PER_SESSION,
      groupType: GroupType.SPORTS_CLUB,
      isActive: true,
      publicPortalEnabled: true,
    },
  });

  // 3. Add Members for Class
  const studentNames = [
    { name: 'Nguyễn Văn An', phone: '0912345678', parent: 'Bác Bình' },
    { name: 'Trần Thị Mai', phone: '0987654321', parent: 'Cô Lan' },
    { name: 'Lê Hoàng Nam', phone: '0933221100', parent: 'Chú Hùng' },
    { name: 'Phạm Quỳnh Anh', phone: '0944556677', parent: 'Cô Hạnh' },
    { name: 'Vũ Đức Minh', phone: '0966778899', parent: 'Bác Thắng' },
  ];

  const students = [];
  for (const s of studentNames) {
    const member = await prisma.member.create({
      data: {
        groupId: classGroup.id,
        name: s.name,
        phone: s.phone,
        parentName: s.parent,
        status: MemberStatus.ACTIVE,
      },
    });
    students.push(member);
  }

  // Add Players for Sports Club
  const playerNames = [
    'Đặng Tuấn Kiệt',
    'Hoàng Yến Nhi',
    'Bùi Quốc Bảo',
    'Ngô Gia Huy',
  ];
  for (const p of playerNames) {
    await prisma.member.create({
      data: {
        groupId: sportsGroup.id,
        name: p,
        status: MemberStatus.ACTIVE,
      },
    });
  }

  // 4. Add Sample Attendance for today and past days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < students.length; i++) {
    await prisma.attendance.create({
      data: {
        groupId: classGroup.id,
        memberId: students[i].id,
        date: today,
        isPresent: i !== 3, // 4th student absent
        status: i !== 3 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT_CHARGED,
      },
    });
  }

  // 5. Create Sample Invoices
  // Student 0: UNPAID
  const inv0 = await prisma.invoice.create({
    data: {
      groupId: classGroup.id,
      memberId: students[0].id,
      userId: user.id,
      title: 'Học phí Tháng 10/2026 - Nguyễn Văn An',
      amountDue: 600000,
      amountPaid: 0,
      paymentCode: 'TR84920',
      status: InvoiceStatus.UNPAID,
      dueDate: new Date(Date.now() + 5 * 86400000),
    },
  });

  // Student 1: PARTIAL (paid 300,000 / 600,000)
  const inv1 = await prisma.invoice.create({
    data: {
      groupId: classGroup.id,
      memberId: students[1].id,
      userId: user.id,
      title: 'Học phí Tháng 10/2026 - Trần Thị Mai',
      amountDue: 600000,
      amountPaid: 300000,
      paymentCode: 'TR55123',
      status: InvoiceStatus.PARTIAL,
      dueDate: new Date(Date.now() + 5 * 86400000),
    },
  });

  // Student 2: PAID (paid 600,000 / 600,000)
  const inv2 = await prisma.invoice.create({
    data: {
      groupId: classGroup.id,
      memberId: students[2].id,
      userId: user.id,
      title: 'Học phí Tháng 10/2026 - Lê Hoàng Nam',
      amountDue: 600000,
      amountPaid: 600000,
      paymentCode: 'TR99887',
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
    },
  });

  // 6. Create sample TransactionLogs
  // Matched transaction for inv1
  const tx1 = await prisma.transactionLog.create({
    data: {
      userId: user.id,
      provider: ProviderType.SEPAY,
      providerTransactionId: 'SP_9001',
      rawPayload: JSON.stringify({ note: 'Sample SePay webhook' }),
      matchedInvoiceId: inv1.id,
      amount: 300000,
      content: 'TR55123 chuyen tien hoc Mai',
      direction: TransactionDirection.IN,
      transactionDate: new Date(),
      processingStatus: ProcessingStatus.PROCESSED,
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      transactionLogId: tx1.id,
      invoiceId: inv1.id,
      amount: 300000,
    },
  });

  // Unmatched transaction (needs manual assign)
  await prisma.transactionLog.create({
    data: {
      userId: user.id,
      provider: ProviderType.SEPAY,
      providerTransactionId: 'SP_9002',
      rawPayload: JSON.stringify({ note: 'Unmatched content' }),
      amount: 600000,
      content: 'Phu huynh An nop hoc phi thang 10',
      direction: TransactionDirection.IN,
      transactionDate: new Date(),
      processingStatus: ProcessingStatus.UNMATCHED,
      failureReason: 'Không tìm thấy mã TR trong nội dung chuyển khoản',
    },
  });

  // 8. Create Demo Member User (hocvien@tingroster.vn)
  const memberUser = await prisma.user.upsert({
    where: { email: 'hocvien@tingroster.vn' },
    update: {
      passwordHash,
    },
    create: {
      email: 'hocvien@tingroster.vn',
      name: 'Nguyễn Văn An',
      passwordHash,
      bankId: 'MB',
      bankAccountNo: '0912345678',
      bankAccountName: 'NGUYEN VAN AN',
      planType: 'FREE',
    },
  });

  // Link member student[0] to memberUser
  await prisma.member.update({
    where: { id: students[0].id },
    data: { userId: memberUser.id },
  });

  // Also add student[0] into Sports Club to demonstrate multi-group membership!
  await prisma.member.create({
    data: {
      groupId: sportsGroup.id,
      userId: memberUser.id,
      name: 'Nguyễn Văn An',
      phone: '0912345678',
      status: MemberStatus.ACTIVE,
    },
  });

  // Update inv0 with itemized line items
  await prisma.invoice.update({
    where: { id: inv0.id },
    data: {
      metadata: JSON.stringify({
        lineItems: [
          { id: '1', name: 'Học phí ôn thi THPT QG Tháng 10', qty: 8, unit: 'buổi', unitPrice: 75000, discount: 0, total: 600000, note: 'Lịch học Thứ 3 & Thứ 5 lúc 18h30' },
          { id: '2', name: 'Tài liệu & Đề thi thử Chuyên đề Hàm số', qty: 1, unit: 'bộ', unitPrice: 50000, discount: 0, total: 50000, note: 'Đã phát bản in tại phòng học' },
          { id: '3', name: 'Học bổng khuyến khích thành tích xuất sắc', qty: 1, unit: 'suất', unitPrice: -50000, discount: 0, total: -50000, note: 'Thưởng điểm 9.5 bài khảo sát đầu năm' },
        ],
        partialPaymentAllowed: true,
        minPartialAmount: 200000,
        documentType: 'INTERNAL_STATEMENT',
        statementNumber: 'BK-2026-10-001',
      }),
    },
  });

  // 9. Seed Chat Conversations & Messages
  const classConv = await prisma.conversation.create({
    data: {
      groupId: classGroup.id,
      workspaceId: user.id,
      type: 'ANNOUNCEMENT',
      title: 'Kênh Thông báo Lớp Toán 12A',
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        conversationId: classConv.id,
        senderId: user.id,
        senderName: 'Thầy Nguyễn Văn Tuấn',
        senderRole: 'TEACHER',
        content: '📢 Thông báo: Thứ 5 tuần này lớp sẽ có bài kiểm tra giữa kỳ 45 phút chuyên đề Hình học không gian. Các em nhớ mang theo compa và máy tính bỏ túi nhé!',
        isAnnouncement: true,
      },
      {
        conversationId: classConv.id,
        senderId: user.id,
        senderName: 'Thầy Nguyễn Văn Tuấn',
        senderRole: 'TEACHER',
        content: 'Đã gửi phiếu điểm danh và bảng kê học phí tháng 10 vào cổng học viên. Các phụ huynh vui lòng kiểm tra và chuyển khoản qua mã QR định danh TR84920.',
        isAnnouncement: true,
      },
    ],
  });

  const sportsConv = await prisma.conversation.create({
    data: {
      groupId: sportsGroup.id,
      workspaceId: user.id,
      type: 'GROUP',
      title: 'Nhóm Thảo luận CLB Cầu Lông',
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        conversationId: sportsConv.id,
        senderId: user.id,
        senderName: 'Chủ nhiệm CLB Tuấn',
        senderRole: 'OWNER',
        content: 'Thứ 4 tuần này sân 3-4 Kỳ Hòa có lịch giao lưu với CLB Phú Thọ từ 18:00 - 20:30. Ai đăng ký đánh đôi thì để lại tin nhắn nhé!',
        isAnnouncement: false,
      },
      {
        conversationId: sportsConv.id,
        senderId: memberUser.id,
        senderName: 'Nguyễn Văn An',
        senderRole: 'MEMBER',
        content: 'Em đăng ký 1 slot đánh đôi nam nhé anh ơi!',
        isAnnouncement: false,
      },
    ],
  });

  // 10. Seed Support Ticket
  await prisma.supportTicket.create({
    data: {
      ticketCode: 'TK-84912',
      userId: memberUser.id,
      category: 'BILLING',
      subject: 'Xin cấp biên nhận điện tử để cơ quan phụ huynh quyết toán',
      description: 'Phụ huynh em cần biên nhận nộp học phí tháng 9 có mã giao dịch và thông tin cơ sở đào tạo để thanh toán công tác phí. Nhờ thầy/quản trị viên hỗ trợ xuất file PDF giúp em ạ.',
      priority: 'NORMAL',
      status: 'IN_PROGRESS',
      adminNote: 'Đã tạo chứng từ nội bộ, gửi lại file qua email cho phụ huynh trong ngày hôm nay.',
    },
  });

  // 11. Seed Legal & Policy Documents
  await prisma.policyDocument.upsert({
    where: { policyType: 'TERMS' },
    update: {},
    create: {
      policyType: 'TERMS',
      title: 'Điều Khoản Dịch Vụ Nền Tảng TingRoster',
      version: '2.4',
      summary: 'Quy định quyền, nghĩa vụ của Người khởi tạo Workspace và Thành viên tham gia nhóm.',
      content: `# Điều Khoản Dịch Vụ TingRoster (Phiên bản 2.4)
1. **Phạm vi áp dụng**: TingRoster cung cấp công cụ phần mềm SaaS quản lý điểm danh, đối soát chuyển khoản ngân hàng qua VietQR và truyền thông nội bộ.
2. **Quyền riêng tư & Bảo vệ dữ liệu**: Nền tảng cam kết bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP. Mọi thông tin danh tính, số điện thoại đều được che chắn an toàn.
3. **Trách nhiệm tài chính (Zero-Custody)**: TingRoster KHÔNG giữ hộ tiền học phí hoặc tiền phòng. Các giao dịch được thực hiện trực tiếp giữa người nộp và tài khoản ngân hàng của cơ sở.
4. **Quy tắc ứng xử trong kênh trò chuyện**: Nghiêm cấm phát tán nội dung vi phạm pháp luật, quấy rối hoặc thư rác trên kênh giao tiếp của nhóm.`,
    },
  });

  await prisma.policyDocument.upsert({
    where: { policyType: 'REFUND' },
    update: {},
    create: {
      policyType: 'REFUND',
      title: 'Chính Sách Hoàn Phí & Xử Lý Giao Dịch',
      version: '1.8',
      summary: 'Quy chế phân định hoàn tiền cước phần mềm TingRoster và hoàn trả học phí nội bộ của cơ sở.',
      content: `# Chính Sách Hoàn Phí (Phiên bản 1.8)
1. **Hoàn tiền dịch vụ TingRoster**: Các giao dịch nạp ví cước dịch vụ (500đ/giao dịch) được bảo lưu vĩnh viễn và không hết hạn. Khách hàng có quyền yêu cầu rút số dư ví còn lại sau khi trừ phí đối soát ngân hàng theo quy định.
2. **Hoàn trả học phí / tiền cơ sở**: Quyết định hoàn trả học phí hoặc tiền cọc phòng thuộc thẩm quyền trực tiếp của Chủ Workspace theo nội quy và hợp đồng dịch vụ riêng của cơ sở. TingRoster không can thiệp vào thỏa thuận dân sự này.
3. **Quy trình khiếu nại**: Người dùng có thể tạo Ticket tại Trung tâm Hỗ trợ để được đối soát lịch sử giao dịch trong vòng 24 giờ làm việc.`,
    },
  });

  console.log('Seed completed successfully with Member Portal & Policies!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
