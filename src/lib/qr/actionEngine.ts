import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export type ActionType =
  | 'ATTENDANCE'
  | 'JOIN_SPACE'
  | 'JOIN_GROUP'
  | 'PAYMENT'
  | 'SHIFT_REGISTER'
  | 'SHIFT_CHECK_IN'
  | 'SHIFT_CHECK_OUT'
  | 'BOOKING'
  | 'EVENT_REGISTER';

export type ContextType =
  | 'CLASS'
  | 'SESSION'
  | 'INVOICE'
  | 'BOOKING'
  | 'SHIFT'
  | 'SPACE'
  | 'GENERAL';

export interface ActionMetadata {
  className?: string;
  classId?: string;
  schedule?: string;
  sessionTitle?: string;
  timeWindow?: string;
  room?: string;
  invoiceId?: string;
  amount?: number;
  paymentCode?: string;
  shiftId?: string;
  shiftName?: string;
  bookingId?: string;
  courtName?: string;
  requireApproval?: boolean;
  autoJoin?: boolean;
  customRules?: string;
}

export interface CreateActionQrParams {
  actionType: ActionType;
  groupId: string;
  contextType?: ContextType;
  contextId?: string;
  title: string;
  description?: string;
  metadata?: ActionMetadata;
  ttlSeconds?: number; // Defaults to 3600 (1 hour) for kiosk dynamic QR, or longer
  maxUsage?: number | null; // null for unlimited
  createdBy?: string;
}

export interface ResolvedAction {
  success: boolean;
  token: string;
  shortCode: string;
  actionType: ActionType;
  title: string;
  description?: string;
  destinationUrl: string;
  groupId: string;
  groupName: string;
  groupSlug: string;
  groupType: string;
  contextType?: ContextType;
  contextId?: string;
  metadata: ActionMetadata;
  expiresAt: string;
  isExpired: boolean;
  isRevoked: boolean;
  usageCount: number;
  maxUsage: number | null;
  requiresAuth: boolean;
  canExecute: boolean;
  eligibilityStatus?:
    | 'ELIGIBLE'
    | 'ALREADY_COMPLETED'
    | 'NOT_STARTED'
    | 'EXPIRED'
    | 'NOT_ELIGIBLE'
    | 'PENDING_APPROVAL'
    | 'NEEDS_AUTH';
  eligibilityMessage?: string;
  error?: string;
}

/**
 * Generate a cryptographically secure opaque token and a 4-digit human-friendly shortCode
 */
function generateTokens(): { token: string; shortCode: string } {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const token = `tr_act_${randomBytes}`;
  // Human readable short code: ACT-XXXX (e.g. ACT-8492)
  const numericPin = Math.floor(1000 + Math.random() * 9000);
  const shortCode = `ACT-${numericPin}`;
  return { token, shortCode };
}

/**
 * Extract clean token or code from raw input (supports URLs, deep links, raw codes)
 */
export function extractCleanCode(rawInput: string): string {
  if (!rawInput) return '';
  let cleaned = rawInput.trim();

  // If input is a URL (e.g. https://tingroster.vn/qr/tr_act_... or https://.../p/... )
  try {
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      const url = new URL(cleaned);
      const segments = url.pathname.split('/').filter(Boolean);
      // /qr/CODE
      if (segments[0] === 'qr' && segments[1]) {
        return segments[1].trim();
      }
      // Query param ?token=... or ?actionToken=... or ?code=...
      const queryToken =
        url.searchParams.get('actionToken') ||
        url.searchParams.get('token') ||
        url.searchParams.get('code');
      if (queryToken) {
        return queryToken.trim();
      }
      // Fallback: take last segment
      if (segments.length > 0) {
        return segments[segments.length - 1].trim();
      }
    }
  } catch {
    // If not a valid URL, treat as raw code
  }

  return cleaned;
}

/**
 * Create or reuse an Action QR Code
 */
export async function createActionQr(params: CreateActionQrParams) {
  const {
    actionType,
    groupId,
    contextType = 'GENERAL',
    contextId,
    title,
    description,
    metadata = {},
    ttlSeconds = 3600, // Default 1 hour
    maxUsage = null,
    createdBy,
  } = params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true, slug: true, groupType: true },
  });

  if (!group) {
    throw new Error(`Không tìm thấy không gian với ID ${groupId}`);
  }

  let { token, shortCode } = generateTokens();

  // Guard against theoretical collision
  let existing = await prisma.actionQrCode.findFirst({
    where: { OR: [{ token }, { shortCode }] },
  });
  while (existing) {
    const fresh = generateTokens();
    token = fresh.token;
    shortCode = fresh.shortCode;
    existing = await prisma.actionQrCode.findFirst({
      where: { OR: [{ token }, { shortCode }] },
    });
  }

  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const actionQr = await prisma.actionQrCode.create({
    data: {
      token,
      shortCode,
      actionType,
      groupId,
      contextType,
      contextId,
      title,
      description,
      metadata: JSON.stringify(metadata),
      expiresAt,
      maxUsage,
      createdBy,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const qrDisplayUrl = `${appUrl}/qr/${token}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    qrDisplayUrl
  )}&margin=12&format=svg`;

  return {
    id: actionQr.id,
    token: actionQr.token,
    shortCode: actionQr.shortCode,
    actionType: actionQr.actionType as ActionType,
    title: actionQr.title,
    description: actionQr.description,
    groupId: group.id,
    groupName: group.name,
    groupSlug: group.slug,
    expiresAt: actionQr.expiresAt.toISOString(),
    qrDisplayUrl,
    qrImageUrl,
    metadata,
  };
}

/**
 * Resolve an Action QR Code or legacy identifier
 */
export async function resolveActionQr(
  rawInput: string,
  currentUserId?: string | null
): Promise<ResolvedAction> {
  const clean = extractCleanCode(rawInput);
  if (!clean) {
    return {
      success: false,
      token: '',
      shortCode: '',
      actionType: 'ATTENDANCE',
      title: 'Mã QR không hợp lệ',
      destinationUrl: '/portal',
      groupId: '',
      groupName: '',
      groupSlug: '',
      groupType: 'GENERAL',
      metadata: {},
      expiresAt: new Date().toISOString(),
      isExpired: true,
      isRevoked: false,
      usageCount: 0,
      maxUsage: null,
      requiresAuth: false,
      canExecute: false,
      error: 'Nội dung mã QR bị trống hoặc không đọc được.',
    };
  }

  // 1. Primary Lookup: ActionQrCode by token or shortCode
  const actionRecord = await prisma.actionQrCode.findFirst({
    where: {
      OR: [
        { token: clean },
        { shortCode: { equals: clean, mode: 'insensitive' } },
        { token: { endsWith: clean } },
      ],
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          slug: true,
          groupType: true,
          enabledModules: true,
          user: { select: { id: true, name: true, bankId: true, bankAccountNo: true, bankAccountName: true } },
        },
      },
    },
  });

  if (actionRecord) {
    const isRevoked = actionRecord.isRevoked;
    const isExpired = new Date() > actionRecord.expiresAt;
    const isMaxReached =
      actionRecord.maxUsage !== null && actionRecord.usageCount >= actionRecord.maxUsage;

    let metadata: ActionMetadata = {};
    try {
      if (actionRecord.metadata) {
        metadata = JSON.parse(actionRecord.metadata);
      }
    } catch {
      metadata = {};
    }

    const actionType = actionRecord.actionType as ActionType;
    let destinationUrl = '/portal';

    switch (actionType) {
      case 'ATTENDANCE':
        destinationUrl = `/portal/attendance?actionToken=${actionRecord.token}`;
        break;
      case 'JOIN_SPACE':
      case 'JOIN_GROUP':
        destinationUrl = `/portal/join?actionToken=${actionRecord.token}`;
        break;
      case 'PAYMENT':
        destinationUrl = metadata.invoiceId
          ? `/portal/fees?actionToken=${actionRecord.token}&invoiceId=${metadata.invoiceId}`
          : `/portal/fees?actionToken=${actionRecord.token}`;
        break;
      case 'SHIFT_REGISTER':
        destinationUrl = `/portal/shifts?actionToken=${actionRecord.token}`;
        break;
      case 'SHIFT_CHECK_IN':
      case 'SHIFT_CHECK_OUT':
        destinationUrl = `/portal/shifts/checkin?actionToken=${actionRecord.token}`;
        break;
      case 'BOOKING':
        destinationUrl = `/portal/bookings?actionToken=${actionRecord.token}`;
        break;
      default:
        destinationUrl = `/portal?actionToken=${actionRecord.token}`;
        break;
    }

    // Determine student eligibility if current user is provided
    let eligibilityStatus: ResolvedAction['eligibilityStatus'] = 'ELIGIBLE';
    let eligibilityMessage = 'Sẵn sàng thực hiện thao tác';
    let canExecute = !isRevoked && !isExpired && !isMaxReached;

    if (isRevoked) {
      eligibilityStatus = 'NOT_ELIGIBLE';
      eligibilityMessage = 'Mã QR này đã bị thu hồi bởi người quản lý.';
      canExecute = false;
    } else if (isExpired) {
      eligibilityStatus = 'EXPIRED';
      eligibilityMessage = 'Mã QR này đã hết thời gian hiệu lực.';
      canExecute = false;
    } else if (isMaxReached) {
      eligibilityStatus = 'EXPIRED';
      eligibilityMessage = 'Mã QR này đã đạt giới hạn số lượt sử dụng tối đa.';
      canExecute = false;
    } else if (!currentUserId) {
      eligibilityStatus = 'NEEDS_AUTH';
      eligibilityMessage = 'Vui lòng đăng nhập tài khoản học viên để hoàn tất hành động này.';
      canExecute = false;
    } else {
      // Evaluate user-specific business eligibility
      const member = await prisma.member.findFirst({
        where: {
          groupId: actionRecord.groupId,
          userId: currentUserId,
        },
      });

      if (actionType === 'ATTENDANCE') {
        if (!member) {
          eligibilityStatus = 'NOT_ELIGIBLE';
          eligibilityMessage =
            'Tài khoản của bạn chưa thuộc danh sách thành viên của không gian này.';
          canExecute = false;
        } else {
          // Check if already checked in today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const already = await prisma.attendance.findFirst({
            where: {
              groupId: actionRecord.groupId,
              memberId: member.id,
              date: today,
            },
          });
          if (already) {
            eligibilityStatus = 'ALREADY_COMPLETED';
            eligibilityMessage = 'Bạn đã hoàn tất điểm danh cho ngày hôm nay.';
            canExecute = false;
          }
        }
      } else if (actionType === 'JOIN_SPACE' || actionType === 'JOIN_GROUP') {
        if (member) {
          eligibilityStatus = 'ALREADY_COMPLETED';
          eligibilityMessage = 'Bạn đã là thành viên chính thức của không gian này.';
          canExecute = false;
        } else {
          const existingReq = await prisma.spaceJoinRequest.findFirst({
            where: {
              groupId: actionRecord.groupId,
              userId: currentUserId,
              status: 'PENDING',
            },
          });
          if (existingReq) {
            eligibilityStatus = 'PENDING_APPROVAL';
            eligibilityMessage = 'Yêu cầu tham gia của bạn đang chờ Chủ không gian phê duyệt.';
            canExecute = false;
          }
        }
      }
    }

    return {
      success: true,
      token: actionRecord.token,
      shortCode: actionRecord.shortCode,
      actionType,
      title: actionRecord.title,
      description: actionRecord.description || undefined,
      destinationUrl,
      groupId: actionRecord.group.id,
      groupName: actionRecord.group.name,
      groupSlug: actionRecord.group.slug,
      groupType: actionRecord.group.groupType,
      contextType: (actionRecord.contextType as ContextType) || 'GENERAL',
      contextId: actionRecord.contextId || undefined,
      metadata,
      expiresAt: actionRecord.expiresAt.toISOString(),
      isExpired,
      isRevoked,
      usageCount: actionRecord.usageCount,
      maxUsage: actionRecord.maxUsage,
      requiresAuth: true,
      canExecute,
      eligibilityStatus,
      eligibilityMessage,
    };
  }

  // 2. Fallback / Legacy Pattern Resolvers (Zero regressions for existing QR prints)
  const upper = clean.toUpperCase();

  // Legacy: TR-MEMBER-xxxx
  if (upper.startsWith('TR-MEMBER-')) {
    const memberIdSuffix = clean.slice(10).toLowerCase();
    const members = await prisma.member.findMany({
      include: { group: true },
    });
    const matched = members.find((m) => m.id.toLowerCase().endsWith(memberIdSuffix));
    if (matched) {
      return {
        success: true,
        token: clean,
        shortCode: clean,
        actionType: 'JOIN_SPACE',
        title: `Mã thành viên: ${matched.name}`,
        description: `Kích hoạt hồ sơ thành viên tại ${matched.group.name}`,
        destinationUrl: `/portal/join?code=${encodeURIComponent(clean)}`,
        groupId: matched.groupId,
        groupName: matched.group.name,
        groupSlug: matched.group.slug,
        groupType: matched.group.groupType,
        metadata: { classId: matched.groupId },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isExpired: false,
        isRevoked: false,
        usageCount: 0,
        maxUsage: null,
        requiresAuth: true,
        canExecute: true,
        eligibilityStatus: 'ELIGIBLE',
      };
    }
  }

  // Legacy: TR-INV-xxx or TR-PAY-xxx or direct invoice paymentCode
  if (upper.startsWith('TR-INV-') || upper.startsWith('TR-PAY-') || upper.startsWith('TR-')) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ paymentCode: clean }, { publicToken: clean }],
      },
      include: { group: true, member: true },
    });
    if (invoice) {
      return {
        success: true,
        token: clean,
        shortCode: invoice.paymentCode,
        actionType: 'PAYMENT',
        title: invoice.title,
        description: `Hóa đơn thanh toán ${invoice.paymentCode}`,
        destinationUrl: `/portal/fees?paymentCode=${encodeURIComponent(invoice.paymentCode)}`,
        groupId: invoice.groupId,
        groupName: invoice.group.name,
        groupSlug: invoice.group.slug,
        groupType: invoice.group.groupType,
        contextType: 'INVOICE',
        contextId: invoice.id,
        metadata: {
          invoiceId: invoice.id,
          amount: invoice.amountDue,
          paymentCode: invoice.paymentCode,
        },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isExpired: false,
        isRevoked: false,
        usageCount: 0,
        maxUsage: null,
        requiresAuth: false,
        canExecute: true,
        eligibilityStatus: 'ELIGIBLE',
      };
    }
  }

  // Legacy: TR-BOOK-xxx or TR-BOOKING-xxx
  if (upper.startsWith('TR-BOOK-') || upper.startsWith('TR-BOOKING-')) {
    const booking = await prisma.sportsBooking.findFirst({
      where: {
        OR: [{ qrToken: clean }, { id: clean }],
      },
      include: { group: true },
    });
    if (booking) {
      return {
        success: true,
        token: clean,
        shortCode: clean,
        actionType: 'BOOKING',
        title: `Đặt sân: ${booking.courtName}`,
        description: `${booking.startTime} - ${booking.endTime} (${booking.customerName})`,
        destinationUrl: `/portal/bookings?bookingId=${booking.id}`,
        groupId: booking.groupId,
        groupName: booking.group.name,
        groupSlug: booking.group.slug,
        groupType: booking.group.groupType,
        contextType: 'BOOKING',
        contextId: booking.id,
        metadata: { bookingId: booking.id, courtName: booking.courtName },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isExpired: false,
        isRevoked: false,
        usageCount: 0,
        maxUsage: null,
        requiresAuth: true,
        canExecute: true,
        eligibilityStatus: 'ELIGIBLE',
      };
    }
  }

  // Legacy: Space Code (e.g. TR-8921 or slug)
  const group = await prisma.group.findFirst({
    where: {
      OR: [
        { code: { equals: clean, mode: 'insensitive' } },
        { slug: { equals: clean.toLowerCase() } },
      ],
    },
  });

  if (group) {
    return {
      success: true,
      token: clean,
      shortCode: group.code || group.slug,
      actionType: 'JOIN_SPACE',
      title: `Tham gia ${group.name}`,
      description: group.description || 'Không gian lớp học / câu lạc bộ',
      destinationUrl: `/portal/join?code=${encodeURIComponent(clean)}`,
      groupId: group.id,
      groupName: group.name,
      groupSlug: group.slug,
      groupType: group.groupType,
      contextType: 'SPACE',
      contextId: group.id,
      metadata: {},
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      isExpired: false,
      isRevoked: false,
      usageCount: 0,
      maxUsage: null,
      requiresAuth: true,
      canExecute: true,
      eligibilityStatus: 'ELIGIBLE',
    };
  }

  // Unknown Code
  return {
    success: false,
    token: clean,
    shortCode: clean,
    actionType: 'ATTENDANCE',
    title: 'Không nhận diện được mã QR',
    destinationUrl: '/portal',
    groupId: '',
    groupName: '',
    groupSlug: '',
    groupType: 'GENERAL',
    metadata: {},
    expiresAt: new Date().toISOString(),
    isExpired: true,
    isRevoked: false,
    usageCount: 0,
    maxUsage: null,
    requiresAuth: false,
    canExecute: false,
    error: `Mã "${clean}" không khớp với bất kỳ hành động, lớp học hoặc hóa đơn nào trong hệ thống TingRoster.`,
  };
}

/**
 * Execute or Confirm an Action QR
 */
export async function executeActionQr(params: {
  token: string;
  userId: string;
  notes?: string;
  phone?: string;
}) {
  const { token, userId, notes, phone } = params;

  const resolved = await resolveActionQr(token, userId);
  if (!resolved.success) {
    throw new Error(resolved.error || 'Mã QR không hợp lệ');
  }

  if (!resolved.canExecute) {
    throw new Error(resolved.eligibilityMessage || 'Không đủ điều kiện thực hiện hành động');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error('Không tìm thấy tài khoản người dùng');
  }

  // 1. ATTENDANCE
  if (resolved.actionType === 'ATTENDANCE') {
    const member = await prisma.member.findFirst({
      where: {
        groupId: resolved.groupId,
        userId: user.id,
      },
    });

    if (!member) {
      throw new Error('Bạn chưa được gán vào danh sách thành viên của lớp này');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Atomic transaction: record attendance & increment usage
    const attendance = await prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({
        where: {
          groupId_memberId_date: {
            groupId: resolved.groupId,
            memberId: member.id,
            date: today,
          },
        },
      });

      if (existing) {
        throw new Error('Hôm nay bạn đã hoàn tất điểm danh rồi');
      }

      const rec = await tx.attendance.create({
        data: {
          groupId: resolved.groupId,
          memberId: member.id,
          date: today,
          isPresent: true,
          status: 'PRESENT',
          note: notes || 'Điểm danh qua Action QR trên điện thoại',
        },
      });

      // Increment usage count if ActionQrCode exists
      await tx.actionQrCode.updateMany({
        where: { token: resolved.token },
        data: { usageCount: { increment: 1 } },
      });

      return rec;
    });

    return {
      success: true,
      actionType: 'ATTENDANCE',
      message: `Điểm danh thành công cho học viên ${member.name} tại ${resolved.groupName}`,
      recordId: attendance.id,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. JOIN_SPACE / JOIN_GROUP
  if (resolved.actionType === 'JOIN_SPACE' || resolved.actionType === 'JOIN_GROUP') {
    const existingMember = await prisma.member.findFirst({
      where: {
        groupId: resolved.groupId,
        userId: user.id,
      },
    });

    if (existingMember) {
      return {
        success: true,
        actionType: 'JOIN_SPACE',
        message: 'Bạn đã là thành viên của không gian này rồi.',
        isMember: true,
      };
    }

    // Check if auto-join is configured
    const autoJoin = resolved.metadata.autoJoin === true;

    if (autoJoin) {
      const newMember = await prisma.$transaction(async (tx) => {
        const m = await tx.member.create({
          data: {
            groupId: resolved.groupId,
            userId: user.id,
            name: user.name,
            phone: phone || user.email,
            status: 'ACTIVE',
          },
        });

        await tx.actionQrCode.updateMany({
          where: { token: resolved.token },
          data: { usageCount: { increment: 1 } },
        });

        return m;
      });

      return {
        success: true,
        actionType: 'JOIN_SPACE',
        message: `Đã tự động tham gia không gian ${resolved.groupName}!`,
        memberId: newMember.id,
        isApproved: true,
      };
    }

    // Otherwise, create a pending Join Request for Owner review
    const request = await prisma.$transaction(async (tx) => {
      // Check existing pending request
      const existingReq = await tx.spaceJoinRequest.findFirst({
        where: {
          groupId: resolved.groupId,
          userId: user.id,
          status: 'PENDING',
        },
      });

      if (existingReq) {
        return existingReq;
      }

      const req = await tx.spaceJoinRequest.create({
        data: {
          groupId: resolved.groupId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: phone || null,
          message: notes || 'Yêu cầu tham gia quét qua Action QR',
          status: 'PENDING',
        },
      });

      await tx.actionQrCode.updateMany({
        where: { token: resolved.token },
        data: { usageCount: { increment: 1 } },
      });

      return req;
    });

    return {
      success: true,
      actionType: 'JOIN_SPACE',
      message: `Yêu cầu tham gia ${resolved.groupName} đã gửi thành công. Vui lòng chờ Chủ không gian phê duyệt.`,
      requestId: request.id,
      isPending: true,
    };
  }

  // 3. SHIFT_REGISTER
  if (resolved.actionType === 'SHIFT_REGISTER') {
    const shiftId = resolved.contextId || resolved.metadata.shiftId;
    if (!shiftId) {
      throw new Error('Không tìm thấy thông tin ca làm việc');
    }

    const shift = await prisma.workShift.findUnique({
      where: { id: shiftId },
      include: { assignments: true },
    });

    if (!shift || shift.status !== 'OPEN') {
      throw new Error('Ca làm việc này không còn mở đăng ký');
    }

    if (shift.assignments.length >= shift.maxSlots) {
      throw new Error('Ca làm việc này đã đủ người (hết chỗ)');
    }

    const existingAssignment = shift.assignments.find((a) => a.userId === user.id);
    if (existingAssignment) {
      throw new Error('Bạn đã đăng ký ca này rồi');
    }

    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftId: shift.id,
        groupId: resolved.groupId,
        userId: user.id,
        userName: user.name,
        status: 'APPROVED',
        notes: notes || 'Đăng ký qua Action QR',
      },
    });

    return {
      success: true,
      actionType: 'SHIFT_REGISTER',
      message: `Đăng ký ca làm "${shift.name}" thành công!`,
      assignmentId: assignment.id,
    };
  }

  // 4. SHIFT_CHECK_IN / SHIFT_CHECK_OUT
  if (resolved.actionType === 'SHIFT_CHECK_IN' || resolved.actionType === 'SHIFT_CHECK_OUT') {
    const shiftId = resolved.contextId || resolved.metadata.shiftId;
    if (!shiftId) {
      throw new Error('Không tìm thấy ca làm việc liên quan');
    }

    const assignment = await prisma.shiftAssignment.findFirst({
      where: {
        shiftId,
        userId: user.id,
      },
    });

    if (!assignment) {
      throw new Error('Bạn chưa có lịch ca làm này để chấm công');
    }

    if (resolved.actionType === 'SHIFT_CHECK_IN') {
      if (assignment.checkInTime) {
        throw new Error('Bạn đã Check-in ca này rồi');
      }

      await prisma.shiftAssignment.update({
        where: { id: assignment.id },
        data: {
          checkInTime: new Date(),
          checkInSource: 'MOBILE_QR',
        },
      });

      return {
        success: true,
        actionType: 'SHIFT_CHECK_IN',
        message: 'Check-in bắt đầu ca làm việc thành công!',
        time: new Date().toISOString(),
      };
    } else {
      if (!assignment.checkInTime) {
        throw new Error('Chưa thể Check-out vì bạn chưa thực hiện Check-in');
      }
      if (assignment.checkOutTime) {
        throw new Error('Bạn đã hoàn tất Check-out cho ca này rồi');
      }

      await prisma.shiftAssignment.update({
        where: { id: assignment.id },
        data: {
          checkOutTime: new Date(),
          checkOutSource: 'MOBILE_QR',
        },
      });

      return {
        success: true,
        actionType: 'SHIFT_CHECK_OUT',
        message: 'Check-out kết thúc ca làm việc thành công!',
        time: new Date().toISOString(),
      };
    }
  }

  // Fallback for generic actions
  return {
    success: true,
    actionType: resolved.actionType,
    message: 'Thực hiện thao tác thành công',
  };
}
