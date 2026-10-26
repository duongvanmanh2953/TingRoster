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

  // 7. Seed Automation Rules
  await prisma.automationRule.createMany({
    data: [
      {
        userId: user.id,
        name: 'Cảnh báo Telegram khi có giao dịch chưa khớp',
        trigger: 'ON_UNMATCHED_TRANSACTION',
        action: 'TELEGRAM_ALERT',
        isEnabled: true,
        lastRunAt: new Date(),
        lastRunStatus: 'SUCCESS',
      },
      {
        userId: user.id,
        name: 'Nhắc hạn đóng học phí trước 2 ngày',
        trigger: 'ON_PAYMENT_DUE',
        action: 'AUTO_REMINDER',
        isEnabled: true,
        lastRunAt: new Date(Date.now() - 86400000),
        lastRunStatus: 'SUCCESS',
      },
      {
        userId: user.id,
        name: 'Tổng kết thu phí cuối ngày lúc 21h00',
        trigger: 'ON_DAILY_SUMMARY',
        action: 'TELEGRAM_ALERT',
        isEnabled: true,
        lastRunAt: new Date(Date.now() - 43200000),
        lastRunStatus: 'SUCCESS',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
