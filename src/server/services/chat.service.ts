import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

export interface ChatActor {
  id: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'ADMIN';
  canPost: boolean;
  isOwnerOrAdmin: boolean;
}

export const SendMessageSchema = z.object({
  content: z.string().max(3000, 'Nội dung tin nhắn tối đa 3000 ký tự'),
  messageType: z.enum([
    'TEXT',
    'SYSTEM',
    'CARD_SCHEDULE',
    'CARD_ATTENDANCE',
    'CARD_POLL',
    'CARD_ANNOUNCEMENT',
    'CARD_PAYMENT',
    'CARD_FILE',
  ]).default('TEXT'),
  replyToId: z.string().optional().nullable(),
  cardPayload: z.string().optional().nullable(),
  isAnnouncement: z.boolean().optional().default(false),
  attachments: z.array(z.object({
    fileName: z.string().min(1),
    fileUrl: z.string().min(1),
    fileType: z.string().min(1),
    fileSize: z.number().int().positive(),
  })).optional().default([]),
});

export type SendMessageInput = z.input<typeof SendMessageSchema>;

export class ChatService {
  /**
   * Verify whether a user is an authorized member or owner of the group
   */
  static async verifyMembership(groupId: string, userId: string): Promise<{
    allowed: boolean;
    actor?: ChatActor;
    conversationId?: string;
    groupName?: string;
    reason?: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!user) {
      return { allowed: false, reason: 'Người dùng không tồn tại' };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        userId: true,
        conversations: {
          where: { type: 'GROUP' },
          take: 1,
          select: { id: true, onlyAdminCanPost: true },
        },
      },
    });

    if (!group) {
      return { allowed: false, reason: 'Không tìm thấy nhóm' };
    }

    const isSystemAdmin = user.role === 'ADMIN';
    const isOwner = group.userId === userId;

    let convId = group.conversations[0]?.id;
    let onlyAdminCanPost = group.conversations[0]?.onlyAdminCanPost ?? false;

    // Ensure conversation exists
    if (!convId) {
      const created = await prisma.conversation.create({
        data: {
          groupId: group.id,
          workspaceId: group.userId,
          title: `Trò chuyện nhóm ${group.name}`,
          type: 'GROUP',
        },
        select: { id: true, onlyAdminCanPost: true },
      });
      convId = created.id;
      onlyAdminCanPost = created.onlyAdminCanPost;
    }

    if (isSystemAdmin || isOwner) {
      return {
        allowed: true,
        actor: {
          id: user.id,
          name: user.name,
          role: isSystemAdmin ? 'ADMIN' : 'OWNER',
          canPost: true,
          isOwnerOrAdmin: true,
        },
        conversationId: convId,
        groupName: group.name,
      };
    }

    // Check active membership
    const activeMember = await prisma.member.findFirst({
      where: {
        groupId,
        userId,
        status: 'ACTIVE',
      },
      select: { id: true, name: true },
    });

    if (!activeMember) {
      return {
        allowed: false,
        reason: 'Bạn không phải là thành viên chính thức hoặc đã bị gỡ khỏi nhóm này',
      };
    }

    return {
      allowed: true,
      actor: {
        id: user.id,
        name: activeMember.name || user.name,
        role: 'MEMBER',
        canPost: !onlyAdminCanPost,
        isOwnerOrAdmin: false,
      },
      conversationId: convId,
      groupName: group.name,
    };
  }

  /**
   * Get messages with cursor pagination and search
   */
  static async getMessages(
    groupId: string,
    userId: string,
    options: {
      cursor?: string | null;
      limit?: number;
      search?: string | null;
      pinnedOnly?: boolean;
    }
  ) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền truy cập chat');
    }

    const limit = Math.min(Math.max(options.limit || 30, 10), 100);

    const where: any = {
      conversationId: auth.conversationId,
    };

    if (options.pinnedOnly) {
      where.isPinned = true;
    }

    if (options.search && options.search.trim()) {
      where.content = {
        contains: options.search.trim(),
        mode: 'insensitive',
      };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(options.cursor
        ? {
            cursor: { id: options.cursor },
            skip: 1,
          }
        : {}),
      include: {
        attachments: true,
        reactions: true,
        replyTo: {
          select: {
            id: true,
            senderName: true,
            content: true,
            isDeleted: true,
            messageType: true,
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Fetch poll data for CARD_POLL messages if any
    const pollMessageIds = items
      .filter((m) => m.messageType === 'CARD_POLL')
      .map((m) => m.id);

    let pollMap: Record<string, any> = {};
    if (pollMessageIds.length > 0) {
      const polls = await prisma.groupPoll.findMany({
        where: { messageId: { in: pollMessageIds } },
        include: {
          options: {
            include: {
              votes: {
                select: { id: true, userId: true, userName: true },
              },
            },
          },
        },
      });

      for (const p of polls) {
        if (p.messageId) {
          pollMap[p.messageId] = p;
        }
      }
    }

    // Format output (reverse so chronological order can be presented easily on client)
    const formatted = items.reverse().map((m) => ({
      ...m,
      poll: pollMap[m.id] || null,
      reactionsSummary: this.summarizeReactions(m.reactions, userId),
    }));

    return {
      messages: formatted,
      nextCursor,
      hasMore,
      actor: auth.actor,
      conversationId: auth.conversationId,
      groupName: auth.groupName,
    };
  }

  /**
   * Summarize reactions grouped by emoji
   */
  private static summarizeReactions(reactions: Array<{ userId: string; userName: string; emoji: string }>, currentUserId: string) {
    const summary: Record<string, { emoji: string; count: number; users: string[]; hasReacted: boolean }> = {};

    for (const r of reactions) {
      if (!summary[r.emoji]) {
        summary[r.emoji] = {
          emoji: r.emoji,
          count: 0,
          users: [],
          hasReacted: false,
        };
      }
      summary[r.emoji].count += 1;
      summary[r.emoji].users.push(r.userName);
      if (r.userId === currentUserId) {
        summary[r.emoji].hasReacted = true;
      }
    }

    return Object.values(summary);
  }

  /**
   * Send a message
   */
  static async sendMessage(groupId: string, userId: string, rawInput: SendMessageInput) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền truy cập');
    }

    if (!auth.actor.canPost && rawInput.messageType !== 'SYSTEM') {
      throw new Error('Chỉ Quản trị viên / Giáo viên mới được quyền gửi tin nhắn trong nhóm này');
    }

    const input = SendMessageSchema.parse(rawInput);

    if (!input.content.trim() && input.attachments.length === 0 && input.messageType === 'TEXT') {
      throw new Error('Nội dung tin nhắn hoặc tệp đính kèm không được để trống');
    }

    // Verify replyTo if provided
    if (input.replyToId) {
      const replyTarget = await prisma.chatMessage.findUnique({
        where: { id: input.replyToId },
        select: { conversationId: true },
      });
      if (!replyTarget || replyTarget.conversationId !== auth.conversationId) {
        throw new Error('Tin nhắn được trả lời không tồn tại trong cuộc trò chuyện này');
      }
    }

    const created = await prisma.chatMessage.create({
      data: {
        conversationId: auth.conversationId,
        senderId: auth.actor.id,
        senderName: auth.actor.name,
        senderRole: auth.actor.role,
        content: input.content.trim(),
        messageType: input.messageType,
        isAnnouncement: input.isAnnouncement,
        replyToId: input.replyToId,
        cardPayload: input.cardPayload,
        attachments: {
          create: input.attachments.map((a) => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileType: a.fileType,
            fileSize: a.fileSize,
          })),
        },
      },
      include: {
        attachments: true,
        reactions: true,
        replyTo: {
          select: {
            id: true,
            senderName: true,
            content: true,
            isDeleted: true,
            messageType: true,
          },
        },
      },
    });

    // Touch conversation
    await prisma.conversation.update({
      where: { id: auth.conversationId },
      data: { updatedAt: new Date() },
    });

    return created;
  }

  /**
   * Edit message
   */
  static async editMessage(groupId: string, messageId: string, userId: string, newContent: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    const msg = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!msg || msg.conversationId !== auth.conversationId) {
      throw new Error('Tin nhắn không tồn tại');
    }

    if (msg.senderId !== userId) {
      throw new Error('Bạn chỉ có thể chỉnh sửa tin nhắn của chính mình');
    }

    if (msg.isDeleted) {
      throw new Error('Không thể sửa tin nhắn đã bị thu hồi');
    }

    if (msg.messageType.startsWith('CARD_') || msg.messageType === 'SYSTEM') {
      throw new Error('Không thể chỉnh sửa thẻ nghiệp vụ hoặc tin nhắn hệ thống');
    }

    const trimmed = newContent.trim();
    if (!trimmed) {
      throw new Error('Nội dung tin nhắn không được để trống');
    }

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: trimmed,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Soft delete / Revoke message
   */
  static async deleteMessage(groupId: string, messageId: string, userId: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    const msg = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!msg || msg.conversationId !== auth.conversationId) {
      throw new Error('Tin nhắn không tồn tại');
    }

    const isSender = msg.senderId === userId;
    const canModerate = auth.actor.isOwnerOrAdmin;

    if (!isSender && !canModerate) {
      throw new Error('Bạn không có quyền thu hồi tin nhắn này');
    }

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: 'Tin nhắn đã được thu hồi',
        cardPayload: null,
      },
    });

    return updated;
  }

  /**
   * Toggle Pin/Unpin message
   */
  static async togglePin(groupId: string, messageId: string, userId: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    if (!auth.actor.isOwnerOrAdmin) {
      throw new Error('Chỉ Chủ phòng / Giáo viên mới có quyền ghim tin nhắn');
    }

    const msg = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!msg || msg.conversationId !== auth.conversationId) {
      throw new Error('Tin nhắn không tồn tại');
    }

    const willPin = !msg.isPinned;

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isPinned: willPin,
        pinnedAt: willPin ? new Date() : null,
        pinnedById: willPin ? userId : null,
        pinnedByName: willPin ? auth.actor.name : null,
      },
    });

    return updated;
  }

  /**
   * Toggle Reaction
   */
  static async toggleReaction(groupId: string, messageId: string, userId: string, emoji: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    const msg = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!msg || msg.conversationId !== auth.conversationId) {
      throw new Error('Tin nhắn không tồn tại');
    }

    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    if (existing) {
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
      return { action: 'removed', emoji };
    } else {
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          userName: auth.actor.name,
          emoji,
        },
      });
      return { action: 'added', emoji };
    }
  }

  /**
   * Create Poll
   */
  static async createPoll(
    groupId: string,
    userId: string,
    input: {
      question: string;
      options: string[];
      isMultiple?: boolean;
    }
  ) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    if (!input.question.trim()) {
      throw new Error('Câu hỏi bình chọn không được để trống');
    }

    const cleanOptions = input.options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (cleanOptions.length < 2) {
      throw new Error('Bình chọn phải có ít nhất 2 phương án lựa chọn');
    }

    // Create chat message representing the poll card
    const chatMsg = await prisma.chatMessage.create({
      data: {
        conversationId: auth.conversationId,
        senderId: auth.actor.id,
        senderName: auth.actor.name,
        senderRole: auth.actor.role,
        content: `📊 Bình chọn: ${input.question.trim()}`,
        messageType: 'CARD_POLL',
        cardPayload: JSON.stringify({ question: input.question.trim() }),
      },
    });

    // Create Poll entity
    const poll = await prisma.groupPoll.create({
      data: {
        conversationId: auth.conversationId,
        messageId: chatMsg.id,
        creatorId: userId,
        creatorName: auth.actor.name,
        question: input.question.trim(),
        isMultiple: !!input.isMultiple,
        options: {
          create: cleanOptions.map((text) => ({ text })),
        },
      },
      include: {
        options: true,
      },
    });

    return { chatMsg, poll };
  }

  /**
   * Vote on Poll
   */
  static async votePoll(groupId: string, pollId: string, optionId: string, userId: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    const poll = await prisma.groupPoll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll || poll.conversationId !== auth.conversationId) {
      throw new Error('Bình chọn không tồn tại');
    }

    if (poll.isClosed) {
      throw new Error('Bình chọn này đã được đóng lại');
    }

    const validOption = poll.options.some((o) => o.id === optionId);
    if (!validOption) {
      throw new Error('Phương án bình chọn không hợp lệ');
    }

    const existingVote = await prisma.pollVote.findUnique({
      where: {
        pollId_optionId_userId: {
          pollId,
          optionId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Toggle off
      await prisma.pollVote.delete({
        where: { id: existingVote.id },
      });
    } else {
      // If single choice, remove previous vote
      if (!poll.isMultiple) {
        await prisma.pollVote.deleteMany({
          where: { pollId, userId },
        });
      }

      await prisma.pollVote.create({
        data: {
          pollId,
          optionId,
          userId,
          userName: auth.actor.name,
        },
      });
    }

    // Return updated poll
    return prisma.groupPoll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: {
              select: { id: true, userId: true, userName: true },
            },
          },
        },
      },
    });
  }

  /**
   * Close Poll
   */
  static async closePoll(groupId: string, pollId: string, userId: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    const poll = await prisma.groupPoll.findUnique({
      where: { id: pollId },
    });

    if (!poll || poll.conversationId !== auth.conversationId) {
      throw new Error('Bình chọn không tồn tại');
    }

    const isCreator = poll.creatorId === userId;
    const isOwner = auth.actor.isOwnerOrAdmin;

    if (!isCreator && !isOwner) {
      throw new Error('Chỉ người tạo hoặc Quản trị viên mới được đóng bình chọn');
    }

    const updated = await prisma.groupPoll.update({
      where: { id: pollId },
      data: {
        isClosed: true,
        closedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(groupId: string, userId: string, messageId: string) {
    await prisma.groupReadState.upsert({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      create: {
        groupId,
        userId,
        lastReadMessageId: messageId,
        lastReadAt: new Date(),
      },
      update: {
        lastReadMessageId: messageId,
        lastReadAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Get shared files in group
   */
  static async getSharedFiles(groupId: string, userId: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    const attachments = await prisma.messageAttachment.findMany({
      where: {
        message: {
          conversationId: auth.conversationId,
          isDeleted: false,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        message: {
          select: {
            id: true,
            senderName: true,
            createdAt: true,
          },
        },
      },
    });

    return attachments;
  }

  /**
   * Get info & member roster of the group chat
   */
  static async getGroupChatInfo(groupId: string, userId: string) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.conversationId) {
      throw new Error(auth.reason || 'Không có quyền');
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        user: { select: { id: true, name: true, email: true, logoUrl: true } },
        members: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            userId: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
          },
          orderBy: { name: 'asc' },
        },
        conversations: {
          where: { type: 'GROUP' },
          take: 1,
          select: {
            id: true,
            onlyAdminCanPost: true,
            _count: {
              select: {
                messages: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new Error('Nhóm không tồn tại');
    }

    const pinnedMessagesCount = await prisma.chatMessage.count({
      where: {
        conversationId: auth.conversationId,
        isPinned: true,
        isDeleted: false,
      },
    });

    const filesCount = await prisma.messageAttachment.count({
      where: {
        message: {
          conversationId: auth.conversationId,
          isDeleted: false,
        },
      },
    });

    return {
      group: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        code: group.code,
        description: group.description,
        logoUrl: group.logoUrl,
        themeColor: group.themeColor,
        owner: group.user,
        membersCount: group.members.length,
        members: group.members,
        onlyAdminCanPost: group.conversations[0]?.onlyAdminCanPost ?? false,
      },
      actor: auth.actor,
      pinnedMessagesCount,
      filesCount,
    };
  }

  /**
   * Update chat configuration (e.g. onlyAdminCanPost)
   */
  static async updateSettings(groupId: string, userId: string, onlyAdminCanPost: boolean) {
    const auth = await this.verifyMembership(groupId, userId);
    if (!auth.allowed || !auth.actor?.isOwnerOrAdmin || !auth.conversationId) {
      throw new Error('Chỉ Quản trị viên / Chủ nhóm mới được đổi cấu hình chat');
    }

    await prisma.conversation.update({
      where: { id: auth.conversationId },
      data: { onlyAdminCanPost },
    });

    // Send system message notifying change
    await prisma.chatMessage.create({
      data: {
        conversationId: auth.conversationId,
        senderId: 'SYSTEM',
        senderName: 'Hệ thống TingRoster',
        senderRole: 'SYSTEM',
        content: onlyAdminCanPost
          ? '🔒 Quản trị viên đã bật chế độ: Chỉ Quản lý / Giáo viên mới được gửi tin nhắn trong nhóm.'
          : '🔓 Quản trị viên đã mở lại quyền gửi tin nhắn cho toàn bộ thành viên trong nhóm.',
        messageType: 'SYSTEM',
      },
    });

    return { success: true, onlyAdminCanPost };
  }

  /**
   * For Student Portal: list groups current user belongs to, with last message & unread badge
   */
  static async getStudentChatGroups(userId: string) {
    const memberships = await prisma.member.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        group: {
          include: {
            user: { select: { id: true, name: true } },
            conversations: {
              where: { type: 'GROUP' },
              take: 1,
              include: {
                messages: {
                  where: { isDeleted: false },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const readStates = await prisma.groupReadState.findMany({
      where: { userId },
    });
    const readMap = new Map(readStates.map((r) => [r.groupId, r.lastReadAt]));

    return memberships.map((m) => {
      const g = m.group;
      const conv = g.conversations[0];
      const lastMsg = conv?.messages[0] || null;
      const lastReadAt = readMap.get(g.id);

      const isUnread =
        lastMsg && lastReadAt
          ? new Date(lastMsg.createdAt) > new Date(lastReadAt)
          : !!lastMsg;

      return {
        id: g.id,
        name: g.name,
        slug: g.slug,
        code: g.code,
        logoUrl: g.logoUrl,
        themeColor: g.themeColor,
        ownerName: g.user.name,
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              senderName: lastMsg.senderName,
              createdAt: lastMsg.createdAt,
              messageType: lastMsg.messageType,
            }
          : null,
        isUnread,
      };
    });
  }
}
