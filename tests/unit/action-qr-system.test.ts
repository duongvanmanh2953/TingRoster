import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import {
  createActionQr,
  resolveActionQr,
  executeActionQr,
  extractCleanCode,
} from '@/lib/qr/actionEngine';

describe('Action-Based QR Engine', () => {
  let testGroup: any;
  let testUser: any;
  let testMember: any;

  beforeEach(async () => {
    // Setup test user & space
    testUser = await prisma.user.create({
      data: {
        email: `test_action_qr_${Date.now()}@tingroster.vn`,
        name: 'Học viên Test QR',
        passwordHash: 'dummy_hash',
      },
    });

    testGroup = await prisma.group.create({
      data: {
        userId: testUser.id,
        name: 'Không Gian Thể Thao & Lớp Học Alpha',
        slug: `alpha-space-${Date.now()}`,
        code: `TR-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        groupType: 'CLASS',
      },
    });

    testMember = await prisma.member.create({
      data: {
        groupId: testGroup.id,
        userId: testUser.id,
        name: testUser.name,
        phone: '0988776655',
        status: 'ACTIVE',
      },
    });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.actionQrCode.deleteMany({ where: { groupId: testGroup.id } });
    await prisma.attendance.deleteMany({ where: { groupId: testGroup.id } });
    await prisma.spaceJoinRequest.deleteMany({ where: { groupId: testGroup.id } });
    await prisma.shiftAssignment.deleteMany({ where: { groupId: testGroup.id } });
    await prisma.workShift.deleteMany({ where: { groupId: testGroup.id } });
    await prisma.member.deleteMany({ where: { groupId: testGroup.id } });
    await prisma.group.deleteMany({ where: { id: testGroup.id } });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
  });

  it('1. should create an ATTENDANCE Action QR with secure token and ACT-XXXX short code', async () => {
    const action = await createActionQr({
      actionType: 'ATTENDANCE',
      groupId: testGroup.id,
      title: 'Điểm danh Lớp Toán 12A',
      description: 'Ca chiều 18:00 - 19:30',
      ttlSeconds: 3600,
    });

    expect(action.token).toMatch(/^tr_act_[a-f0-9]{32}$/);
    expect(action.shortCode).toMatch(/^ACT-\d{4}$/);
    expect(action.actionType).toBe('ATTENDANCE');
    expect(action.groupId).toBe(testGroup.id);
    expect(action.qrImageUrl).toContain(encodeURIComponent(action.token));
  });

  it('2. should correctly extract token from full URLs and deep links', () => {
    const sampleToken = 'tr_act_abc123def456';
    expect(extractCleanCode(`https://tingroster.vn/qr/${sampleToken}`)).toBe(sampleToken);
    expect(extractCleanCode(`http://localhost:3000/qr/${sampleToken}`)).toBe(sampleToken);
    expect(extractCleanCode(`https://tingroster.vn/portal/attendance?actionToken=${sampleToken}`)).toBe(
      sampleToken
    );
    expect(extractCleanCode(`  ${sampleToken}  `)).toBe(sampleToken);
  });

  it('3. should resolve ATTENDANCE Action QR to /portal/attendance route with eligibility check', async () => {
    const action = await createActionQr({
      actionType: 'ATTENDANCE',
      groupId: testGroup.id,
      title: 'Điểm danh Buổi 1',
      ttlSeconds: 1800,
    });

    // Resolve as authenticated member
    const resolved = await resolveActionQr(action.token, testUser.id);
    expect(resolved.success).toBe(true);
    expect(resolved.actionType).toBe('ATTENDANCE');
    expect(resolved.destinationUrl).toBe(`/portal/attendance?actionToken=${action.token}`);
    expect(resolved.canExecute).toBe(true);
    expect(resolved.eligibilityStatus).toBe('ELIGIBLE');

    // Resolve by manual shortCode
    const resolvedByCode = await resolveActionQr(action.shortCode, testUser.id);
    expect(resolvedByCode.success).toBe(true);
    expect(resolvedByCode.token).toBe(action.token);
  });

  it('4. should prevent duplicate attendance on same day when executing Action QR', async () => {
    const action = await createActionQr({
      actionType: 'ATTENDANCE',
      groupId: testGroup.id,
      title: 'Điểm danh Ca 1',
    });

    // First execution -> succeeds
    const execResult = await executeActionQr({
      token: action.token,
      userId: testUser.id,
    });
    expect(execResult.success).toBe(true);
    expect(execResult.actionType).toBe('ATTENDANCE');

    // Second execution on same day -> rejected
    await expect(
      executeActionQr({
        token: action.token,
        userId: testUser.id,
      })
    ).rejects.toThrow();
  });

  it('5. should handle JOIN_SPACE Action QR and create a pending request for Owner review', async () => {
    // Create new external user who is NOT yet a member of testGroup
    const externalUser = await prisma.user.create({
      data: {
        email: `new_student_${Date.now()}@tingroster.vn`,
        name: 'Học sinh Mới',
        passwordHash: 'dummy',
      },
    });

    try {
      const joinAction = await createActionQr({
        actionType: 'JOIN_SPACE',
        groupId: testGroup.id,
        title: 'Tham gia Lớp Alpha',
        description: 'Vui lòng chờ giáo viên duyệt hồ sơ',
      });

      const resolved = await resolveActionQr(joinAction.token, externalUser.id);
      expect(resolved.actionType).toBe('JOIN_SPACE');
      expect(resolved.destinationUrl).toBe(`/portal/join?actionToken=${joinAction.token}`);
      expect(resolved.canExecute).toBe(true);

      // Execute Join Request
      const result = await executeActionQr({
        token: joinAction.token,
        userId: externalUser.id,
        notes: 'Em xin vào lớp Toán',
        phone: '0911223344',
      });

      expect(result.success).toBe(true);
      expect(result.isPending).toBe(true);

      // Verify request in DB
      const dbReq = await prisma.spaceJoinRequest.findFirst({
        where: { groupId: testGroup.id, userId: externalUser.id },
      });
      expect(dbReq).not.toBeNull();
      expect(dbReq?.status).toBe('PENDING');
      expect(dbReq?.userPhone).toBe('0911223344');
    } finally {
      await prisma.user.delete({ where: { id: externalUser.id } });
    }
  });

  it('6. should reject expired Action QRs', async () => {
    // Create expired action QR (expired 10 seconds ago)
    const expiredAction = await prisma.actionQrCode.create({
      data: {
        token: `tr_act_expired_${Date.now()}`,
        shortCode: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
        actionType: 'ATTENDANCE',
        groupId: testGroup.id,
        title: 'Buổi học đã kết thúc',
        expiresAt: new Date(Date.now() - 10000),
      },
    });

    const resolved = await resolveActionQr(expiredAction.token, testUser.id);
    expect(resolved.isExpired).toBe(true);
    expect(resolved.canExecute).toBe(false);
    expect(resolved.eligibilityStatus).toBe('EXPIRED');
  });

  it('7. should resolve legacy invoice codes seamlessly for backward compatibility', async () => {
    const invoice = await prisma.invoice.create({
      data: {
        groupId: testGroup.id,
        memberId: testMember.id,
        userId: testUser.id,
        title: 'Học phí Tháng 10',
        amountDue: 500000,
        paymentCode: `TR-LEGACY-${Math.floor(1000 + Math.random() * 9000)}`,
        publicToken: `token_legacy_${Date.now()}`,
      },
    });

    const resolved = await resolveActionQr(invoice.paymentCode, testUser.id);
    expect(resolved.success).toBe(true);
    expect(resolved.actionType).toBe('PAYMENT');
    expect(resolved.destinationUrl).toContain(invoice.paymentCode);

    await prisma.invoice.delete({ where: { id: invoice.id } });
  });
});
