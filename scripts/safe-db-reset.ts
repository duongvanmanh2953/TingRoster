import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSafeDbReset() {
  console.log('====================================================');
  console.log('   TINGROSTER SAFE DATABASE RESET & DEMO CLEANUP   ');
  console.log('====================================================');

  const databaseUrl = process.env.DATABASE_URL || '';

  // 1. Production Safeguard Check
  const isLocalOrDev = 
    databaseUrl.includes('localhost') || 
    databaseUrl.includes('127.0.0.1') || 
    databaseUrl.includes('tingroster-db') ||
    databaseUrl.includes('postgres:5432');

  const isConfirmed = process.argv.includes('--force') || process.env.CONFIRM_RESET === 'true';

  if (!isLocalOrDev) {
    console.error('❌ AN TOÀN BẢO VỆ: DATABASE_URL không phải môi trường cục bộ/dev!');
    console.error(`DATABASE_URL hiện tại: ${databaseUrl}`);
    console.error('Dừng ngay lập tức để bảo vệ dữ liệu người dùng thật.');
    process.exit(1);
  }

  if (!isConfirmed) {
    console.warn('⚠️ CẢNH BÁO: Script này sẽ dọn dẹp các tài khoản demo và dữ liệu test.');
    console.warn('Để xác nhận thực thi, hãy chạy lệnh với cờ: --force hoặc đặt CONFIRM_RESET=true');
    process.exit(0);
  }

  console.log('🔍 Kiểm tra dữ liệu hiện tại trước khi dọn dẹp:');
  const [userCount, groupCount, memberCount, invoiceCount] = await Promise.all([
    prisma.user.count(),
    prisma.group.count(),
    prisma.member.count(),
    prisma.invoice.count(),
  ]);

  console.log(`- Users: ${userCount}`);
  console.log(`- Groups/Spaces: ${groupCount}`);
  console.log(`- Members: ${memberCount}`);
  console.log(`- Invoices: ${invoiceCount}`);

  // 2. Identify and safely delete demo accounts and test fixtures
  const demoEmails = [
    'demo@tingroster.vn',
    'hocvien@tingroster.vn',
  ];

  console.log('\n🧹 Đang xóa các tài khoản demo và test fixture...');

  // Delete payment allocations for demo users
  await prisma.paymentAllocation.deleteMany({
    where: {
      invoice: {
        user: {
          OR: [
            { email: { in: demoEmails } },
            { email: { contains: 'test_' } },
            { email: { contains: 'chat_' } },
          ],
        },
      },
    },
  });

  // Delete invoices
  await prisma.invoice.deleteMany({
    where: {
      user: {
        OR: [
          { email: { in: demoEmails } },
          { email: { contains: 'test_' } },
          { email: { contains: 'chat_' } },
        ],
      },
    },
  });

  // Delete attendances
  await prisma.attendance.deleteMany({
    where: {
      group: {
        user: {
          OR: [
            { email: { in: demoEmails } },
            { email: { contains: 'test_' } },
            { email: { contains: 'chat_' } },
          ],
        },
      },
    },
  });

  // Delete members
  await prisma.member.deleteMany({
    where: {
      group: {
        user: {
          OR: [
            { email: { in: demoEmails } },
            { email: { contains: 'test_' } },
            { email: { contains: 'chat_' } },
          ],
        },
      },
    },
  });

  // Delete groups/workspaces
  await prisma.group.deleteMany({
    where: {
      user: {
        OR: [
          { email: { in: demoEmails } },
          { email: { contains: 'test_' } },
          { email: { contains: 'chat_' } },
        ],
      },
    },
  });

  // Delete transaction logs & automations
  await prisma.transactionLog.deleteMany({
    where: {
      user: {
        OR: [
          { email: { in: demoEmails } },
          { email: { contains: 'test_' } },
          { email: { contains: 'chat_' } },
        ],
      },
    },
  });

  await prisma.automationRule.deleteMany({
    where: {
      user: {
        OR: [
          { email: { in: demoEmails } },
          { email: { contains: 'test_' } },
          { email: { contains: 'chat_' } },
        ],
      },
    },
  });

  // Finally delete the demo users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: demoEmails } },
        { email: { contains: 'test_' } },
        { email: { contains: 'chat_' } },
      ],
    },
  });

  console.log(`✅ Đã xóa an toàn ${deletedUsers.count} tài khoản demo/test.`);

  // Verify DB clean state
  const remainingUsers = await prisma.user.count();
  console.log(`📊 Số lượng tài khoản còn lại trong cơ sở dữ liệu: ${remainingUsers}`);
  console.log('🎉 Hoàn tất dọn dẹp dữ liệu rác thành công. Database sẵn sàng cho User thật.');
}

runSafeDbReset()
  .catch((e) => {
    console.error('Lỗi khi thực thi reset an toàn:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
