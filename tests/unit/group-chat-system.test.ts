import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import { ChatService } from '@/server/services/chat.service';

describe('Professional Group Chat System', () => {
  let ownerUser: any;
  let memberUser: any;
  let outsideUser: any;
  let testGroupA: any;
  let testGroupB: any;

  beforeEach(async () => {
    // 1. Create Owner User
    ownerUser = await prisma.user.upsert({
      where: { email: 'chat_owner@tingroster.test' },
      update: {},
      create: {
        email: 'chat_owner@tingroster.test',
        name: 'Chủ Nhóm Thử Nghiệm',
        passwordHash: 'dummyhash',
        role: 'USER',
      },
    });

    // 2. Create Member User
    memberUser = await prisma.user.upsert({
      where: { email: 'chat_member@tingroster.test' },
      update: {},
      create: {
        email: 'chat_member@tingroster.test',
        name: 'Học Viên A',
        passwordHash: 'dummyhash',
        role: 'USER',
      },
    });

    // 3. Create Outside User (not in group)
    outsideUser = await prisma.user.upsert({
      where: { email: 'chat_outside@tingroster.test' },
      update: {},
      create: {
        email: 'chat_outside@tingroster.test',
        name: 'Người Ngoài Nhóm',
        passwordHash: 'dummyhash',
        role: 'USER',
      },
    });

    // 4. Create Group A
    testGroupA = await prisma.group.upsert({
      where: { slug: 'test-group-chat-a' },
      update: {},
      create: {
        userId: ownerUser.id,
        name: 'Lớp Luyện Thi A',
        slug: 'test-group-chat-a',
        code: 'TR-CHATA',
        defaultFee: 500000,
      },
    });

    // 5. Create Group B
    testGroupB = await prisma.group.upsert({
      where: { slug: 'test-group-chat-b' },
      update: {},
      create: {
        userId: ownerUser.id,
        name: 'Lớp Luyện Thi B',
        slug: 'test-group-chat-b',
        code: 'TR-CHATB',
        defaultFee: 600000,
      },
    });

    // 6. Add memberUser to Group A as ACTIVE
    await prisma.member.upsert({
      where: { id: 'member_in_group_a_test' },
      update: { status: 'ACTIVE' },
      create: {
        id: 'member_in_group_a_test',
        groupId: testGroupA.id,
        userId: memberUser.id,
        name: 'Học Viên A',
        status: 'ACTIVE',
      },
    });
  });

  it('1. verifies group membership strictly: owner and active member allowed, outsider blocked', async () => {
    // Owner
    const ownerAuth = await ChatService.verifyMembership(testGroupA.id, ownerUser.id);
    expect(ownerAuth.allowed).toBe(true);
    expect(ownerAuth.actor?.role).toBe('OWNER');
    expect(ownerAuth.actor?.isOwnerOrAdmin).toBe(true);

    // Active member
    const memberAuth = await ChatService.verifyMembership(testGroupA.id, memberUser.id);
    expect(memberAuth.allowed).toBe(true);
    expect(memberAuth.actor?.role).toBe('MEMBER');
    expect(memberAuth.actor?.isOwnerOrAdmin).toBe(false);

    // Outsider user
    const outsiderAuth = await ChatService.verifyMembership(testGroupA.id, outsideUser.id);
    expect(outsiderAuth.allowed).toBe(false);
    expect(outsiderAuth.reason).toContain('không phải là thành viên');
  });

  it('2. blocks removed/inactive members from accessing group chat', async () => {
    // Inactivate member
    await prisma.member.update({
      where: { id: 'member_in_group_a_test' },
      data: { status: 'INACTIVE' },
    });

    const auth = await ChatService.verifyMembership(testGroupA.id, memberUser.id);
    expect(auth.allowed).toBe(false);

    // Restore member
    await prisma.member.update({
      where: { id: 'member_in_group_a_test' },
      data: { status: 'ACTIVE' },
    });
  });

  it('3. isolates messages between different groups (no cross-group leakage)', async () => {
    // Send message in Group A
    const msgA = await ChatService.sendMessage(testGroupA.id, ownerUser.id, {
      content: 'Bí mật nhóm A',
      messageType: 'TEXT',
    });
    expect(msgA.content).toBe('Bí mật nhóm A');

    // Outside user cannot view Group A messages
    await expect(
      ChatService.getMessages(testGroupA.id, outsideUser.id, {})
    ).rejects.toThrow();

    // Group B messages should not contain Group A messages
    const groupBMessages = await ChatService.getMessages(testGroupB.id, ownerUser.id, {});
    const leaked = groupBMessages.messages.some((m) => m.content === 'Bí mật nhóm A');
    expect(leaked).toBe(false);
  });

  it('4. enforces posting permissions when onlyAdminCanPost is active', async () => {
    // Owner sets onlyAdminCanPost = true
    await ChatService.updateSettings(testGroupA.id, ownerUser.id, true);

    // Member attempts to send message -> should be rejected
    await expect(
      ChatService.sendMessage(testGroupA.id, memberUser.id, {
        content: 'Học viên cố nhắn tin khi bị khóa',
        messageType: 'TEXT',
      })
    ).rejects.toThrow(/Chỉ Quản trị viên/);

    // Owner can still post
    const ownerMsg = await ChatService.sendMessage(testGroupA.id, ownerUser.id, {
      content: 'Thông báo từ Quản lý khi khóa chat',
      messageType: 'TEXT',
    });
    expect(ownerMsg.id).toBeDefined();

    // Owner unlocks
    await ChatService.updateSettings(testGroupA.id, ownerUser.id, false);

    // Member can now post
    const memberMsg = await ChatService.sendMessage(testGroupA.id, memberUser.id, {
      content: 'Học viên nhắn tin bình thường trở lại',
      messageType: 'TEXT',
    });
    expect(memberMsg.id).toBeDefined();
  });

  it('5. supports editing and soft-deleting (revoking) messages with audit integrity', async () => {
    const msg = await ChatService.sendMessage(testGroupA.id, memberUser.id, {
      content: 'Nội dung ban đầu',
      messageType: 'TEXT',
    });

    // Member edits their own message
    const edited = await ChatService.editMessage(testGroupA.id, msg.id, memberUser.id, 'Nội dung đã sửa');
    expect(edited.content).toBe('Nội dung đã sửa');
    expect(edited.isEdited).toBe(true);

    // Outside user cannot edit
    await expect(
      ChatService.editMessage(testGroupA.id, msg.id, outsideUser.id, 'Sửa trộm')
    ).rejects.toThrow();

    // Member revokes their message
    const revoked = await ChatService.deleteMessage(testGroupA.id, msg.id, memberUser.id);
    expect(revoked.isDeleted).toBe(true);
    expect(revoked.content).toBe('Tin nhắn đã được thu hồi');

    // Cannot edit a revoked message
    await expect(
      ChatService.editMessage(testGroupA.id, msg.id, memberUser.id, 'Thử sửa lại')
    ).rejects.toThrow(/thu hồi/);
  });

  it('6. supports toggle reactions on messages', async () => {
    const msg = await ChatService.sendMessage(testGroupA.id, ownerUser.id, {
      content: 'Bài viết cho mọi người thả tim',
      messageType: 'TEXT',
    });

    // Member reacts with ❤️
    const react1 = await ChatService.toggleReaction(testGroupA.id, msg.id, memberUser.id, '❤️');
    expect(react1.action).toBe('added');

    // Member toggles again -> should be removed
    const react2 = await ChatService.toggleReaction(testGroupA.id, msg.id, memberUser.id, '❤️');
    expect(react2.action).toBe('removed');
  });

  it('7. creates interactive group polls and processes single/multiple voting', async () => {
    const { chatMsg, poll } = await ChatService.createPoll(testGroupA.id, ownerUser.id, {
      question: 'Chọn ngày học bù?',
      options: ['Thứ 7 lúc 14:00', 'Chủ nhật lúc 9:00', 'Thứ 2 lúc 18:00'],
      isMultiple: false,
    });

    expect(chatMsg.messageType).toBe('CARD_POLL');
    expect(poll.options.length).toBe(3);

    const option1 = poll.options[0].id;
    const option2 = poll.options[1].id;

    // Member votes for option 1
    const votedPoll = await ChatService.votePoll(testGroupA.id, poll.id, option1, memberUser.id);
    const opt1Votes = votedPoll?.options.find((o) => o.id === option1)?.votes;
    expect(opt1Votes?.length).toBe(1);

    // In single-choice, voting option 2 moves the vote to option 2
    const votedAgain = await ChatService.votePoll(testGroupA.id, poll.id, option2, memberUser.id);
    const newOpt1Votes = votedAgain?.options.find((o) => o.id === option1)?.votes;
    const newOpt2Votes = votedAgain?.options.find((o) => o.id === option2)?.votes;
    expect(newOpt1Votes?.length).toBe(0);
    expect(newOpt2Votes?.length).toBe(1);

    // Owner closes the poll
    const closed = await ChatService.closePoll(testGroupA.id, poll.id, ownerUser.id);
    expect(closed.isClosed).toBe(true);

    // Voting on closed poll should fail
    await expect(
      ChatService.votePoll(testGroupA.id, poll.id, option1, memberUser.id)
    ).rejects.toThrow(/đã được đóng/);
  });

  it('8. supports pinning and unpinning messages exclusively by Owner/Admin', async () => {
    const msg = await ChatService.sendMessage(testGroupA.id, ownerUser.id, {
      content: 'Thông báo ghim tuần thi đua',
      messageType: 'TEXT',
    });

    // Member cannot pin
    await expect(
      ChatService.togglePin(testGroupA.id, msg.id, memberUser.id)
    ).rejects.toThrow(/Chủ phòng \/ Giáo viên/);

    // Owner pins message
    const pinned = await ChatService.togglePin(testGroupA.id, msg.id, ownerUser.id);
    expect(pinned.isPinned).toBe(true);

    // Owner unpins message
    const unpinned = await ChatService.togglePin(testGroupA.id, msg.id, ownerUser.id);
    expect(unpinned.isPinned).toBe(false);
  });
});
