/**
 * TingRoster Flexible Multi-Space Module, Preset & Report Definitions
 */

export type ModuleCategory = 'objects' | 'operations' | 'finance' | 'communication' | 'legal';

export interface SpaceModuleConfig {
  id: string;
  name: string;
  description: string;
  purpose: string;
  iconName: string;
  category: ModuleCategory;
  isDefault: boolean;
  requiredDependencies?: string[]; // Module bắt buộc phải có trước
  subFeatures: string[]; // Các chức năng con sẽ tự động bật
  unlockedReports: string[]; // Các báo cáo sẽ có thể sử dụng
  requiredPlan?: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface ModuleCategoryGroup {
  id: ModuleCategory;
  title: string;
  code: string;
  description: string;
}

export const MODULE_CATEGORY_GROUPS: ModuleCategoryGroup[] = [
  {
    id: 'objects',
    code: 'A',
    title: 'Quản lý đối tượng',
    description: 'Hồ sơ thành viên, nhóm con, nhân viên phụ trách và danh mục tài sản',
  },
  {
    id: 'operations',
    code: 'B',
    title: 'Vận hành cơ sở',
    description: 'Lịch hoạt động, điểm danh, chấm công ca làm, booking và kiosk check-in',
  },
  {
    id: 'finance',
    code: 'C',
    title: 'Dịch vụ & Tài chính',
    description: 'Bảng giá dịch vụ, hóa đơn nhiều dòng, tự động đối soát VietQR và phụ thu',
  },
  {
    id: 'communication',
    code: 'D',
    title: 'Giao tiếp & Tương tác',
    description: 'Thông báo tự động, nhắc nợ Telegram/Zalo, chat nhóm và lời mời thành viên',
  },
  {
    id: 'legal',
    code: 'E',
    title: 'Hồ sơ & Pháp lý',
    description: 'Hợp đồng điện tử bất biến, chữ ký số, quy chế và điều khoản thỏa thuận 2 bên',
  },
];

export const SPACE_MODULES: SpaceModuleConfig[] = [
  // Nhóm A: Quản lý đối tượng
  {
    id: 'members',
    name: 'Thành viên & Hồ sơ',
    description: 'Quản lý danh sách thành viên, thông tin liên hệ, phân loại lứa tuổi và lịch sử tham gia.',
    purpose: 'Lưu trữ thông tin cá nhân và tài khoản cổng thông tin tự phục vụ.',
    iconName: 'Users2',
    category: 'objects',
    isDefault: true,
    subFeatures: ['Danh sách hồ sơ', 'Tạo tài khoản tạm', 'Mã QR cá nhân', 'Lịch sử tham gia'],
    unlockedReports: ['rep_members', 'rep_members_growth'],
  },
  {
    id: 'documents',
    name: 'Tài liệu & Hồ sơ scan',
    description: 'Lưu trữ quy chế, biên bản bàn giao, nội quy cơ sở và hồ sơ pháp lý đính kèm.',
    purpose: 'Lưu trữ tài liệu số hóa tập trung cho từng không gian.',
    iconName: 'FileText',
    category: 'objects',
    isDefault: false,
    requiredDependencies: ['members'],
    subFeatures: ['Upload tài liệu', 'Scan OCR biên bản', 'Phân quyền xem theo vai trò'],
    unlockedReports: ['rep_documents_audit'],
  },

  // Nhóm B: Vận hành
  {
    id: 'attendance',
    name: 'Điểm danh & Chuyên cần',
    description: 'Điểm danh một chạm theo buổi/ca, kiosk quét QR tự phục vụ và giải quyết học bù.',
    purpose: 'Ghi nhận sự có mặt thực tế và tính phí theo buổi sử dụng.',
    iconName: 'CalendarCheck',
    category: 'operations',
    isDefault: true,
    requiredDependencies: ['members'],
    subFeatures: ['Điểm danh một chạm', 'Kiosk quét QR', 'Ghi nhận học bù', 'Yêu cầu sửa điểm danh'],
    unlockedReports: ['rep_attendance', 'rep_absence_analysis'],
  },

  // Nhóm C: Dịch vụ & Tài chính
  {
    id: 'invoices',
    name: 'Khoản thu & Biểu phí',
    description: 'Tạo đợt thu phí, tính học phí/tiền phòng theo buổi hoặc định kỳ, xuất hóa đơn nhiều dòng.',
    purpose: 'Tự động tính toán số tiền phải thu, quản lý công nợ và biên lai thu tiền.',
    iconName: 'Receipt',
    category: 'finance',
    isDefault: true,
    requiredDependencies: ['members'],
    subFeatures: ['Hóa đơn nhiều dòng', 'Thanh toán một phần', 'Theo dõi công nợ', 'In phiếu thu chuẩn'],
    unlockedReports: ['rep_financial', 'rep_debt_aging'],
  },
  {
    id: 'reconciliation',
    name: 'Giao dịch & Đối soát VietQR',
    description: 'Tự động bắt biến động số dư ngân hàng qua Webhook Casso & SePay, gạch nợ tức thì 24/7.',
    purpose: 'Loại bỏ hoàn toàn đối soát thủ công và sai sót tiền bạc.',
    iconName: 'ArrowRightLeft',
    category: 'finance',
    isDefault: true,
    requiredDependencies: ['invoices'],
    subFeatures: ['Webhook Napas 24/7', 'Tự động gạch nợ', 'Phân bổ thanh toán', 'Khớp số tiền lệch'],
    unlockedReports: ['rep_reconciliation', 'rep_transactions_log'],
  },
  {
    id: 'reports',
    name: 'Báo cáo & Phân tích',
    description: 'Thống kê doanh thu thực nhận, tỷ lệ thu hồi nợ, báo cáo chuyên cần và hiệu suất phòng/sân.',
    purpose: 'Cung cấp số liệu tài chính và vận hành trung thực cho người quản lý.',
    iconName: 'BarChart3',
    category: 'finance',
    isDefault: true,
    requiredDependencies: ['invoices'],
    subFeatures: ['Biểu đồ dòng tiền', 'Bảng phân tích tuổi nợ', 'Xuất Excel kế toán'],
    unlockedReports: ['rep_financial_overview', 'rep_cashflow'],
  },

  // Nhóm D: Giao tiếp & Tương tác
  {
    id: 'notifications',
    name: 'Thông báo & Nhắc nợ',
    description: 'Gửi thông báo nhắc lịch, nhắc đóng học phí tự động qua Telegram, Zalo hoặc Email.',
    purpose: 'Tăng tốc độ thu hồi nợ tự động và gắn kết thành viên.',
    iconName: 'Bell',
    category: 'communication',
    isDefault: false,
    requiredDependencies: ['invoices'],
    subFeatures: ['Bot Telegram nhắc nợ', 'Zalo ZNS tự động', 'Email biên nhận'],
    unlockedReports: ['rep_notification_delivery'],
  },
  {
    id: 'automations',
    name: 'Tự động hóa & Quy tắc',
    description: 'Thiết lập quy tắc tự động gửi cảnh báo nợ đọng, chúc mừng sinh nhật, sao lưu định kỳ.',
    purpose: 'Vận hành không chạm cho người quản lý bận rộn.',
    iconName: 'Workflow',
    category: 'communication',
    isDefault: false,
    requiredDependencies: ['members'],
    subFeatures: ['Kịch bản tự động', 'Trigger biến động nợ', 'Mô phỏng quy trình'],
    unlockedReports: ['rep_automation_history'],
  },
];

export interface WorkspacePresetModel {
  id: string;
  name: string;
  badge: string;
  iconName: string;
  description: string;
  recommendedThemeColor: string;
  defaultModules: string[];
  suggestedReports: string[];
  initialBillingCycle: 'MONTHLY' | 'DAILY' | 'PER_SESSION';
  defaultServiceCategory: string;
}

export const WORKSPACE_PRESETS: WorkspacePresetModel[] = [
  {
    id: 'CLASS',
    name: 'Giáo dục & Lớp học',
    badge: 'Dạy thêm & Trung tâm',
    iconName: 'GraduationCap',
    description: 'Điểm danh buổi học, thu học phí tích lũy theo buổi/tháng, quản lý học viên và phụ huynh.',
    recommendedThemeColor: '#2538D9',
    defaultModules: ['members', 'attendance', 'invoices', 'reports', 'reconciliation'],
    suggestedReports: ['rep_attendance', 'rep_financial', 'rep_debt_aging'],
    initialBillingCycle: 'MONTHLY',
    defaultServiceCategory: 'EDUCATION',
  },
  {
    id: 'SPORTS_CLUB',
    name: 'Thể thao & Sân bãi',
    badge: 'Pickleball, Cầu lông, Bóng đá',
    iconName: 'Trophy',
    description: 'Booking theo khung giờ, check-in kiosk quét QR, tính phụ phí quá giờ và hội viên.',
    recommendedThemeColor: '#6D5CE8',
    defaultModules: ['members', 'attendance', 'invoices', 'reconciliation', 'notifications', 'reports'],
    suggestedReports: ['rep_financial', 'rep_reconciliation'],
    initialBillingCycle: 'PER_SESSION',
    defaultServiceCategory: 'SPORTS',
  },
  {
    id: 'RENTAL',
    name: 'Nhà trọ & Căn hộ cho thuê',
    badge: 'Phòng trọ & Mini Hotel',
    iconName: 'Building2',
    description: 'Quản lý hợp đồng thuê, chốt chỉ số điện nước bậc thang, hóa đơn tiền phòng hàng tháng.',
    recommendedThemeColor: '#059669',
    defaultModules: ['members', 'invoices', 'reconciliation', 'reports', 'documents'],
    suggestedReports: ['rep_financial', 'rep_debt_aging'],
    initialBillingCycle: 'MONTHLY',
    defaultServiceCategory: 'RENTAL',
  },
  {
    id: 'WORKFORCE',
    name: 'Doanh nghiệp & Nhân sự',
    badge: 'Quản lý ca & Chấm công',
    iconName: 'Briefcase',
    description: 'Phân ca làm việc, chấm công vào/ra, tính giờ công, tạm ứng và bảng lương minh bạch.',
    recommendedThemeColor: '#4F46E5',
    defaultModules: ['members', 'attendance', 'invoices', 'reports', 'documents'],
    suggestedReports: ['rep_attendance', 'rep_financial'],
    initialBillingCycle: 'MONTHLY',
    defaultServiceCategory: 'GENERAL',
  },
  {
    id: 'SERVICE',
    name: 'Cơ sở Dịch vụ & Chăm sóc',
    badge: 'Spa, Gym, Studio',
    iconName: 'Sparkles',
    description: 'Gói dịch vụ liệu trình, check-in theo lượt, đối soát biến động số dư VietQR tức thì.',
    recommendedThemeColor: '#D97706',
    defaultModules: ['members', 'attendance', 'invoices', 'reconciliation', 'reports'],
    suggestedReports: ['rep_financial', 'rep_reconciliation'],
    initialBillingCycle: 'PER_SESSION',
    defaultServiceCategory: 'GENERAL',
  },
  {
    id: 'GENERAL',
    name: 'Tùy chỉnh linh hoạt',
    badge: 'Đa nghiệp vụ hỗn hợp',
    iconName: 'Layers',
    description: 'Không gian mở tự do cấu hình tất cả các module, bảng giá và chu kỳ tính phí.',
    recommendedThemeColor: '#2538D9',
    defaultModules: ['members', 'attendance', 'invoices', 'reports'],
    suggestedReports: ['rep_financial'],
    initialBillingCycle: 'MONTHLY',
    defaultServiceCategory: 'GENERAL',
  },
];

export interface WorkspaceReportDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredModuleId: string;
  href: (spaceId: string) => string;
}

export const WORKSPACE_REPORTS: WorkspaceReportDefinition[] = [
  {
    id: 'rep_financial',
    name: 'Báo cáo Doanh thu & Dòng tiền',
    description: 'Tổng tiền phát sinh, thực thu qua VietQR và tỷ lệ hoàn thành thu phí.',
    category: 'Tài chính',
    requiredModuleId: 'invoices',
    href: (id) => `/groups/${id}/reports/financial`,
  },
  {
    id: 'rep_debt_aging',
    name: 'Báo cáo Phân tích Công nợ & Tuổi nợ',
    description: 'Danh sách các khoản nợ quá hạn, phân loại dưới 30 ngày, 30-60 ngày và trên 60 ngày.',
    category: 'Tài chính',
    requiredModuleId: 'invoices',
    href: (id) => `/groups/${id}/reports/debt`,
  },
  {
    id: 'rep_attendance',
    name: 'Báo cáo Điểm danh & Chuyên cần',
    description: 'Tổng lượt có mặt, vắng có phép, học bù và tỷ lệ chuyên cần chi tiết.',
    category: 'Vận hành',
    requiredModuleId: 'attendance',
    href: (id) => `/groups/${id}/reports/attendance`,
  },
  {
    id: 'rep_reconciliation',
    name: 'Báo cáo Đối soát VietQR Napas 247',
    description: 'Nhật ký các giao dịch ngân hàng đã khớp hóa đơn tự động và các khoản chưa đối soát.',
    category: 'Tài chính',
    requiredModuleId: 'reconciliation',
    href: (id) => `/groups/${id}/transactions`,
  },
  {
    id: 'rep_services',
    name: 'Báo cáo Bảng giá & Dịch vụ phụ trợ',
    description: 'Hiệu quả doanh thu theo từng dịch vụ, tiền điện, nước và phụ thu.',
    category: 'Dịch vụ',
    requiredModuleId: 'invoices',
    href: (id) => `/groups/${id}/reports/services`,
  },
  {
    id: 'rep_classes',
    name: 'Báo cáo Sĩ số & Học phí Lớp học',
    description: 'Số lượng học viên theo từng lớp, giáo viên phụ trách và doanh thu đào tạo.',
    category: 'Giáo dục',
    requiredModuleId: 'attendance',
    href: (id) => `/groups/${id}/reports/education`,
  },
  {
    id: 'rep_rentals',
    name: 'Báo cáo Công suất & Điện nước Phòng trọ',
    description: 'Tỷ lệ phòng đang thuê, tiền cọc đang giữ và số tiêu thụ điện nước từng phòng.',
    category: 'Cho thuê',
    requiredModuleId: 'invoices',
    href: (id) => `/groups/${id}/reports/rentals`,
  },
  {
    id: 'rep_sports',
    name: 'Báo cáo Sử dụng Sân & Đặt chỗ',
    description: 'Tần suất sử dụng sân thể thao, giờ cao điểm và phụ thu vượt giờ.',
    category: 'Thể thao',
    requiredModuleId: 'invoices',
    href: (id) => `/groups/${id}/reports/sports`,
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
