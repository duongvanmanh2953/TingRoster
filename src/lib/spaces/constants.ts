/**
 * TingRoster Flexible Multi-Space Module & Theme Definitions
 */

export interface SpaceModuleConfig {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'core' | 'finance' | 'operations' | 'growth';
  isDefault: boolean;
  requiredModule?: string;
}

export const SPACE_MODULES: SpaceModuleConfig[] = [
  {
    id: 'members',
    name: 'Thành viên & Hồ sơ',
    description: 'Quản lý danh sách thành viên, thông tin liên hệ, nhóm con và lịch sử tham gia.',
    iconName: 'Users2',
    category: 'core',
    isDefault: true,
  },
  {
    id: 'attendance',
    name: 'Điểm danh & Check-in',
    description: 'Điểm danh theo buổi/ca tập, kiosk quét QR tự phục vụ và theo dõi chuyên cần.',
    iconName: 'CalendarCheck',
    category: 'operations',
    isDefault: true,
  },
  {
    id: 'invoices',
    name: 'Khoản thu & Biểu phí',
    description: 'Tạo đợt thu phí, tính học phí/tiền phòng theo buổi hoặc định kỳ, xuất hóa đơn.',
    iconName: 'Receipt',
    category: 'finance',
    isDefault: true,
  },
  {
    id: 'reconciliation',
    name: 'Giao dịch & Đối soát VietQR',
    description: 'Tự động bắt biến động số dư ngân hàng qua Webhook, gạch nợ tức thì 24/7.',
    iconName: 'ArrowRightLeft',
    category: 'finance',
    isDefault: true,
  },
  {
    id: 'reports',
    name: 'Báo cáo & Phân tích',
    description: 'Thống kê doanh thu thực nhận, tỷ lệ thu hồi nợ, báo cáo chuyên cần chi tiết.',
    iconName: 'BarChart3',
    category: 'finance',
    isDefault: true,
  },
  {
    id: 'notifications',
    name: 'Thông báo & Nhắc nợ',
    description: 'Gửi thông báo nhắc lịch, nhắc đóng học phí tự động qua Telegram, Zalo hoặc Email.',
    iconName: 'Bell',
    category: 'growth',
    isDefault: false,
  },
  {
    id: 'documents',
    name: 'Tài liệu & Chứng từ',
    description: 'Lưu trữ quy chế, biên bản bàn giao, nội quy không gian và file tài liệu.',
    iconName: 'FileText',
    category: 'operations',
    isDefault: false,
  },
  {
    id: 'automations',
    name: 'Tự động hóa & Quy tắc',
    description: 'Thiết lập quy tắc tự động gửi cảnh báo nợ đọng, chúc mừng sinh nhật, sao lưu.',
    iconName: 'Workflow',
    category: 'growth',
    isDefault: false,
  },
];

export const SPACE_PALETTES = [
  { id: 'royal-blue', name: 'Royal Blue (Mặc định)', hex: '#2538D9', bgHex: '#EEF2FF', textHex: '#1E2DB8' },
  { id: 'emerald', name: 'Emerald Green', hex: '#059669', bgHex: '#ECFDF5', textHex: '#047857' },
  { id: 'violet', name: 'Deep Violet', hex: '#6D5CE8', bgHex: '#F5F3FF', textHex: '#5B4BD8' },
  { id: 'rose', name: 'Ruby Rose', hex: '#E11D48', bgHex: '#FFF1F2', textHex: '#BE123C' },
  { id: 'amber', name: 'Warm Amber', hex: '#D97706', bgHex: '#FFFBEB', textHex: '#B45309' },
  { id: 'cyan', name: 'Ocean Cyan', hex: '#0891B2', bgHex: '#ECFEFF', textHex: '#0E7490' },
  { id: 'indigo', name: 'Midnight Indigo', hex: '#4F46E5', bgHex: '#EEF2FF', textHex: '#3730A3' },
  { id: 'slate', name: 'Graphite Slate', hex: '#475467', bgHex: '#F8FAFC', textHex: '#1E293B' },
];

/**
 * Generate a random unique space code like TR-8492
 */
export function generateSpaceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TR-${randomPart}`;
}

/**
 * Parse comma-separated or JSON list of enabled modules
 */
export function parseEnabledModules(modulesRaw?: string | null): string[] {
  if (!modulesRaw) {
    return ['members', 'attendance', 'invoices', 'reports', 'reconciliation'];
  }
  if (modulesRaw.startsWith('[')) {
    try {
      return JSON.parse(modulesRaw);
    } catch {
      // Fallback to split
    }
  }
  return modulesRaw.split(',').map((m) => m.trim()).filter(Boolean);
}

/**
 * Check if a specific module is enabled
 */
export function isModuleEnabled(modulesRaw: string | undefined | null, moduleId: string): boolean {
  const list = parseEnabledModules(modulesRaw);
  return list.includes(moduleId);
}
