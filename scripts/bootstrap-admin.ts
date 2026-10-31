import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function bootstrapSuperAdmin() {
  console.log('====================================================');
  console.log('      TINGROSTER SUPER ADMIN BOOTSTRAP TOOL        ');
  console.log('====================================================');

  // Parse args
  const args = process.argv.slice(2);
  let email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  let name = process.env.BOOTSTRAP_ADMIN_NAME || 'Platform Administrator';
  let password = process.env.BOOTSTRAP_ADMIN_PASS;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) email = args[i + 1];
    if (args[i] === '--name' && args[i + 1]) name = args[i + 1];
    if (args[i] === '--password' && args[i + 1]) password = args[i + 1];
  }

  if (!email) {
    email = 'admin@tingroster.vn';
  }

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    console.log(`ℹ️ Tài khoản ${email} đã tồn tại trong hệ thống.`);
    if (existing.role !== Role.SUPER_ADMIN && existing.role !== Role.ADMIN) {
      console.log(`Đang nâng cấp vai trò thành SUPER_ADMIN...`);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: Role.SUPER_ADMIN,
          isEmailVerified: true,
          isActive: true,
          isLocked: false,
        },
      });
      console.log(`✅ Đã cấp quyền SUPER_ADMIN thành công cho ${email}.`);
    } else {
      console.log(`✅ Tài khoản đã có quyền Admin (${existing.role}). Không cần thay đổi.`);
    }
    return;
  }

  let generated = false;
  if (!password) {
    // Generate secure 16-character crypto password
    password = `TR!${crypto.randomBytes(8).toString('hex')}@${new Date().getFullYear()}`;
    generated = true;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const admin = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name,
      passwordHash,
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
      isLocked: false,
      serviceBalance: 10000000, // Initial platform float
      bankId: 'MB',
      bankAccountNo: '0987654321',
      bankAccountName: 'PLATFORM ADMIN',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'BOOTSTRAP_SUPER_ADMIN_CREATED',
      entityType: 'USER',
      entityId: admin.id,
      details: JSON.stringify({ email: admin.email, bootstrapAt: new Date().toISOString() }),
      ipAddress: '127.0.0.1',
    },
  });

  console.log('\n🎉 KHỞI TẠO TÀI KHOẢN SUPER ADMIN ĐẦU TIÊN THÀNH CÔNG:');
  console.log('----------------------------------------------------');
  console.log(`• ID:       ${admin.id}`);
  console.log(`• Email:    ${admin.email}`);
  console.log(`• Họ tên:   ${admin.name}`);
  console.log(`• Vai trò:  SUPER_ADMIN`);
  if (generated) {
    console.log(`• Mật khẩu: ${password}`);
    console.log('\n⚠️ QUAN TRỌNG: Hãy lưu lại mật khẩu này ngay bây giờ. Mật khẩu sẽ không hiển thị lại.');
  } else {
    console.log('• Mật khẩu: (Đã thiết lập theo mật khẩu bạn cung cấp)');
  }
  console.log('----------------------------------------------------\n');
}

bootstrapSuperAdmin()
  .catch((e) => {
    console.error('Lỗi khi bootstrap admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
