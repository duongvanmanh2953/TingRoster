import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, planType: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    // 1. Find Member records linked directly to this userId or matching phone/email
    const memberProfiles = await prisma.member.findMany({
      where: {
        OR: [
          { userId: user.id },
          { phone: user.email }, // In case phone was stored as identifier
        ],
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            groupType: true,
            defaultFee: true,
            billingCycle: true,
            description: true,
            user: { select: { id: true, name: true, bankId: true, bankAccountNo: true, bankAccountName: true } },
          },
        },
      },
    });

    const memberIds = memberProfiles.map((m) => m.id);
    const groupIds = memberProfiles.map((m) => m.groupId);

    // 2. Fetch Invoices for these members
    const invoices = memberIds.length > 0
      ? await prisma.invoice.findMany({
          where: { memberId: { in: memberIds } },
          include: {
            group: { select: { id: true, name: true, slug: true } },
            user: { select: { bankId: true, bankAccountNo: true, bankAccountName: true } },
            allocations: {
              select: {
                id: true,
                amount: true,
                createdAt: true,
                transactionLog: { select: { providerTransactionId: true, transactionDate: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    // Calculate Financial Summary
    let totalDue = 0;
    let totalPaid = 0;
    let overdueCount = 0;
    const now = new Date();

    invoices.forEach((inv) => {
      const remaining = Math.max(0, inv.amountDue - inv.amountPaid);
      totalDue += remaining;
      totalPaid += inv.amountPaid;
      if (inv.status !== 'PAID' && inv.dueDate && new Date(inv.dueDate) < now) {
        overdueCount++;
      }
    });

    // 3. Fetch Recent Attendance
    const recentAttendances = memberIds.length > 0
      ? await prisma.attendance.findMany({
          where: { memberId: { in: memberIds } },
          include: {
            group: { select: { id: true, name: true } },
          },
          orderBy: { date: 'desc' },
          take: 5,
        })
      : [];

    // 4. Fetch Announcements from conversations
    const announcements = groupIds.length > 0
      ? await prisma.chatMessage.findMany({
          where: {
            isAnnouncement: true,
            conversation: { groupId: { in: groupIds } },
          },
          include: {
            conversation: { select: { id: true, title: true, groupId: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        })
      : [];

    // 5. Build Joined Groups List with attendance stats
    const joinedGroups = memberProfiles.map((m) => ({
      memberId: m.id,
      groupId: m.group.id,
      name: m.group.name,
      slug: m.group.slug,
      groupType: m.group.groupType,
      defaultFee: m.group.defaultFee,
      billingCycle: m.group.billingCycle,
      description: m.group.description,
      owner: m.group.user,
      joinedAt: m.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        user,
        financial: {
          totalDue,
          totalPaid,
          overdueCount,
          activeInvoiceCount: invoices.filter((i) => i.status !== 'PAID').length,
        },
        joinedGroups,
        recentInvoices: invoices.slice(0, 5),
        recentAttendances,
        announcements,
      },
    });
  } catch (err: unknown) {
    console.error('Portal dashboard API error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải thông tin cổng học viên' }, { status: 500 });
  }
}
