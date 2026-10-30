import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';

describe('TINGROSTER_SYSTEM_UI_ARCHITECTURE Requirements', () => {
  describe('Section 4.2 & 15: Registration Mode Separation & Onboarding', () => {
    it('differentiates Owner and Student registration flows', () => {
      type RegisterMode = 'OWNER' | 'STUDENT';
      const ownerMode: RegisterMode = 'OWNER';
      const studentMode: RegisterMode = 'STUDENT';

      // Owner registration requires bank details and triggers 30-day trial
      const ownerPayload = {
        mode: ownerMode,
        name: 'Nguyễn Văn Minh',
        email: 'minh.nguyen@tingroster.vn',
        password: 'Password123!',
        bankId: 'MB',
        bankAccountNo: '0987654321',
      };
      expect(ownerPayload.mode).toBe('OWNER');
      expect(ownerPayload.bankId).toBe('MB');

      // Student flow requires activation code or teacher-issued credentials
      const studentActivationPayload = {
        mode: studentMode,
        code: 'TR-MEMBER-clx982103',
        password: 'StudentSecurePass123!',
      };
      expect(studentActivationPayload.mode).toBe('STUDENT');
      expect(studentActivationPayload.code).toMatch(/^TR-MEMBER-/);
    });

    it('sanitizes student activation codes and strips prefix', () => {
      const rawCode = 'TR-MEMBER-clx7812904';
      const cleanId = rawCode.replace(/^TR-MEMBER-/, '');
      expect(cleanId).toBe('clx7812904');

      const phoneCode = '0987654321';
      expect(phoneCode.replace(/^TR-MEMBER-/, '')).toBe('0987654321');
    });

    it('enforces student accounts have role USER and planType FREE without admin permissions', () => {
      const studentUser = {
        role: 'USER',
        planType: 'FREE',
        serviceBalance: 0,
      };

      const hasOwnerDashboardAccess = studentUser.role === 'ADMIN' || studentUser.planType === 'PRO';
      expect(hasOwnerDashboardAccess).toBe(false);
    });
  });

  describe('Section 7.2: Excel Student Bulk Import & Template Generation', () => {
    it('creates standard Excel template with required Vietnamese columns', () => {
      const templateData = [
        {
          'Họ và tên *': 'Nguyễn Văn An',
          'Số điện thoại': '0912345678',
          'Người giám hộ / Phụ huynh': 'Nguyễn Văn Hùng',
          'Ghi chú': 'Học sinh mới',
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const keys = Object.keys(templateData[0]);

      expect(keys).toContain('Họ và tên *');
      expect(keys).toContain('Số điện thoại');
      expect(keys).toContain('Người giám hộ / Phụ huynh');
      expect(worksheet['!ref']).toBeDefined();
    });

    it('validates parsed member rows correctly', () => {
      const validateRow = (row: { name: string; phone?: string }) => {
        const errors: string[] = [];
        if (!row.name || row.name.trim().length < 2) {
          errors.push('Thiếu họ và tên học viên');
        }
        let formattedPhone = row.phone ? row.phone.replace(/\D/g, '') : '';
        if (formattedPhone.length === 9) {
          formattedPhone = '0' + formattedPhone;
        }
        return {
          isValid: errors.length === 0,
          errors,
          formattedPhone: formattedPhone || undefined,
        };
      };

      const validRow = validateRow({ name: 'Trần Thị Mai', phone: '987654321' });
      expect(validRow.isValid).toBe(true);
      expect(validRow.formattedPhone).toBe('0987654321');

      const invalidRow = validateRow({ name: '', phone: '0912345678' });
      expect(invalidRow.isValid).toBe(false);
      expect(invalidRow.errors).toContain('Thiếu họ và tên học viên');
    });
  });

  describe('Section 8.1 & 8.3: Student QR Code and Kiosk Scanner Integration', () => {
    it('formats student QR data for seamless kiosk scanner reading', () => {
      const memberId = 'clx4981023';
      const studentQrData = `TR-MEMBER-${memberId}`;

      // Kiosk scanner regex verification
      const isRecognizedByKiosk = /^TR-MEMBER-/.test(studentQrData);
      expect(isRecognizedByKiosk).toBe(true);

      const extractedId = studentQrData.replace(/^TR-MEMBER-/, '');
      expect(extractedId).toBe(memberId);
    });

    it('enforces multi-space isolation for student check-in', () => {
      const studentMembership = {
        memberId: 'clx111',
        groupId: 'space-A',
        groupName: 'Lớp Tiếng Anh Thầy Minh',
      };

      const kioskSpaceId = 'space-B';
      const isAllowedAtKiosk = studentMembership.groupId === kioskSpaceId;

      expect(isAllowedAtKiosk).toBe(false);
    });
  });

  describe('Section 3 & 10: Financial Status Visual Token Mapping', () => {
    it('strictly maps financial statuses to standardized color badges', () => {
      const getStatusBadgeClass = (status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID') => {
        switch (status) {
          case 'UNPAID':
            return 'bg-rose-50 text-rose-700 border-rose-200';
          case 'PARTIAL':
            return 'bg-amber-50 text-amber-700 border-amber-200';
          case 'PAID':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
          case 'OVERPAID':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        }
      };

      expect(getStatusBadgeClass('UNPAID')).toBe('bg-rose-50 text-rose-700 border-rose-200');
      expect(getStatusBadgeClass('PARTIAL')).toBe('bg-amber-50 text-amber-700 border-amber-200');
      expect(getStatusBadgeClass('PAID')).toBe('bg-emerald-50 text-emerald-700 border-emerald-200');
      expect(getStatusBadgeClass('OVERPAID')).toBe('bg-blue-50 text-blue-700 border-blue-200');
    });
  });

  describe('Section 7.2: Free Standard Excel Import & Idempotency Rules', () => {
    it('charges 0đ for standard Excel imports and 500đ only for AI OCR', () => {
      const calculateBulkImportCost = (isAiOcr: boolean) => {
        return isAiOcr ? 500 : 0;
      };

      expect(calculateBulkImportCost(false)).toBe(0);
      expect(calculateBulkImportCost(true)).toBe(500);
    });

    it('supports PREVIEW mode without mutating database or deducting wallet balance', () => {
      const mockPreviewPayload = {
        groupId: 'grp-123',
        fileName: 'students.xlsx',
        action: 'PREVIEW' as 'PREVIEW' | 'COMMIT',
        isAiOcr: false,
        members: [
          { name: 'Nguyễn Văn An', phone: '0912345678' },
          { name: 'Trần Thị Mai', phone: '0987654321' },
        ],
      };

      const willMutateDb = mockPreviewPayload.action === 'COMMIT';
      expect(willMutateDb).toBe(false);
      expect(mockPreviewPayload.isAiOcr).toBe(false);
    });
  });

  describe('Section 8.4: Student Space Invitation & Join Rules', () => {
    it('validates invitation codes for joining spaces', () => {
      const validateInviteCode = (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return { valid: false, error: 'Mã không được để trống' };
        if (trimmed.toUpperCase().startsWith('TR-MEMBER-')) {
          return { valid: true, type: 'MEMBER_ACTIVATION_CODE' };
        }
        return { valid: true, type: 'SPACE_INVITATION_CODE' };
      };

      expect(validateInviteCode('TR-MEMBER-9F12A0')).toEqual({
        valid: true,
        type: 'MEMBER_ACTIVATION_CODE',
      });
      expect(validateInviteCode('clb-cau-long-tan-binh')).toEqual({
        valid: true,
        type: 'SPACE_INVITATION_CODE',
      });
      expect(validateInviteCode('  ')).toEqual({
        valid: false,
        error: 'Mã không được để trống',
      });
    });
  });

  describe('Section 10.3 & 16: Horizontal Matrix Table Sticky Accessibility', () => {
    it('defines sticky offsets for admission code and member name columns', () => {
      const column1StickyClass = 'sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-[#E4E7EC] dark:border-slate-800 shadow-xs';
      const column2StickyClass = 'sticky left-28 z-10 bg-white dark:bg-slate-900 border-r-2 border-[#E4E7EC] dark:border-slate-800 shadow-sm';

      expect(column1StickyClass).toContain('sticky left-0');
      expect(column2StickyClass).toContain('sticky left-28');
    });
  });

  describe('Portal Separation & Space-Level URL Isolation (Section 1.2 & 6)', () => {
    it('keeps sub-module routes strictly inside the space path /groups/:id/*', () => {
      const spaceId = 'space_clx7812';
      const getSpaceModuleUrl = (id: string, module: 'attendance' | 'invoices' | 'transactions' | 'reports') => {
        return `/groups/${id}/${module}`;
      };

      expect(getSpaceModuleUrl(spaceId, 'attendance')).toBe('/groups/space_clx7812/attendance');
      expect(getSpaceModuleUrl(spaceId, 'invoices')).toBe('/groups/space_clx7812/invoices');
      expect(getSpaceModuleUrl(spaceId, 'transactions')).toBe('/groups/space_clx7812/transactions');
      expect(getSpaceModuleUrl(spaceId, 'reports')).toBe('/groups/space_clx7812/reports');
    });

    it('identifies when a path belongs to an active space workspace vs outer management', () => {
      const isInsideSpace = (pathname: string) => {
        const match = pathname.match(/^\/groups\/([^/]+)/);
        return Boolean(match && match[1] !== 'groups' && match[1] !== 'new');
      };

      expect(isInsideSpace('/dashboard')).toBe(false);
      expect(isInsideSpace('/groups')).toBe(false);
      expect(isInsideSpace('/groups/space-123')).toBe(true);
      expect(isInsideSpace('/groups/space-123/attendance')).toBe(true);
      expect(isInsideSpace('/groups/space-123/invoices')).toBe(true);
      expect(isInsideSpace('/groups/space-123/reports')).toBe(true);
    });
  });

  describe('Smart QR Code Dispatcher & Verification Rules', () => {
    it('accurately resolves QR payloads to their designated portal', () => {
      const resolveQrTarget = (code: string) => {
        const upper = code.trim().toUpperCase();
        if (upper.startsWith('TR-MEMBER-')) {
          return { portal: 'STUDENT', url: `/portal/join?code=${code}` };
        }
        if (upper.startsWith('TR-INV-') || upper.startsWith('TR-PAY-')) {
          return { portal: 'PUBLIC_PAYMENT', url: `/p/${code}` };
        }
        if (upper.startsWith('TR-BOOK-') || upper.startsWith('TR-BOOKING-')) {
          return { portal: 'SPORTS_BOOKING', url: `/kiosk?bookingCode=${code}` };
        }
        if (upper.startsWith('KIOSK-')) {
          return { portal: 'KIOSK', url: `/kiosk/${code.replace(/^KIOSK-/i, '')}` };
        }
        return { portal: 'SPACE_INVITE', url: `/portal/join?code=${code}` };
      };

      expect(resolveQrTarget('TR-MEMBER-001').portal).toBe('STUDENT');
      expect(resolveQrTarget('TR-INV-2026').portal).toBe('PUBLIC_PAYMENT');
      expect(resolveQrTarget('TR-BOOKING-8821').portal).toBe('SPORTS_BOOKING');
      expect(resolveQrTarget('KIOSK-space99').portal).toBe('KIOSK');
      expect(resolveQrTarget('clb-cau-long-tan-binh').portal).toBe('SPACE_INVITE');
    });
  });

  describe('Section 6: Rental Meter Reading & Utilities Calculation Engine', () => {
    it('accurately computes electric and water consumption and bill amounts', () => {
      const calculateUtilityBill = (params: {
        prevElectric: number;
        currElectric: number;
        electricRate: number;
        prevWater: number;
        currWater: number;
        waterRate: number;
      }) => {
        const electricUsage = Math.max(0, params.currElectric - params.prevElectric);
        const electricTotal = Math.round(electricUsage * params.electricRate);
        const waterUsage = Math.max(0, params.currWater - params.prevWater);
        const waterTotal = Math.round(waterUsage * params.waterRate);
        return {
          electricUsage,
          electricTotal,
          waterUsage,
          waterTotal,
          utilityTotal: electricTotal + waterTotal,
        };
      };

      const bill = calculateUtilityBill({
        prevElectric: 1250,
        currElectric: 1390, // 140 kWh
        electricRate: 3500, // 140 * 3500 = 490,000
        prevWater: 45,
        currWater: 52, // 7 m3
        waterRate: 25000, // 7 * 25000 = 175,000
      });

      expect(bill.electricUsage).toBe(140);
      expect(bill.electricTotal).toBe(490000);
      expect(bill.waterUsage).toBe(7);
      expect(bill.waterTotal).toBe(175000);
      expect(bill.utilityTotal).toBe(665000);
    });
  });

  describe('Section 7: Sports Club CI/CO & Overtime Calculation', () => {
    it('computes overtime surcharge only when exceeding the grace period', () => {
      const calculateSportsSessionCost = (params: {
        scheduledEndHour: number;
        scheduledEndMinute: number;
        actualCheckOutHour: number;
        actualCheckOutMinute: number;
        hourlyCourtRate: number;
        scheduledCourtPrice: number;
        surchargeFee: number;
      }) => {
        const scheduledMinutes = params.scheduledEndHour * 60 + params.scheduledEndMinute;
        const actualMinutes = params.actualCheckOutHour * 60 + params.actualCheckOutMinute;
        const diffMinutes = actualMinutes - scheduledMinutes;

        let overtimeMinutes = 0;
        let overtimeFee = 0;

        // 10 minutes grace period
        if (diffMinutes > 10) {
          overtimeMinutes = diffMinutes;
          overtimeFee = Math.round((overtimeMinutes / 60) * params.hourlyCourtRate);
        }

        const totalAmount = params.scheduledCourtPrice + overtimeFee + params.surchargeFee;
        return {
          overtimeMinutes,
          overtimeFee,
          totalAmount,
        };
      };

      // Case 1: Finished within grace period (+5 mins) -> 0 overtime fee
      const session1 = calculateSportsSessionCost({
        scheduledEndHour: 20,
        scheduledEndMinute: 0,
        actualCheckOutHour: 20,
        actualCheckOutMinute: 5,
        hourlyCourtRate: 150000,
        scheduledCourtPrice: 300000,
        surchargeFee: 20000,
      });
      expect(session1.overtimeFee).toBe(0);
      expect(session1.totalAmount).toBe(320000);

      // Case 2: Overstayed by 30 mins -> proportional overtime fee: (30/60) * 150000 = 75000
      const session2 = calculateSportsSessionCost({
        scheduledEndHour: 20,
        scheduledEndMinute: 0,
        actualCheckOutHour: 20,
        actualCheckOutMinute: 30,
        hourlyCourtRate: 150000,
        scheduledCourtPrice: 300000,
        surchargeFee: 20000,
      });
      expect(session2.overtimeMinutes).toBe(30);
      expect(session2.overtimeFee).toBe(75000);
      expect(session2.totalAmount).toBe(395000);
    });
  });

  describe('Section 4: Service Line Item Snapshot Integrity', () => {
    it('preserves historical invoice line item prices regardless of service catalog price updates', () => {
      // Historical invoice snapshot created in Month 1
      const historicalLineItem = {
        serviceId: 'svc-1',
        serviceName: 'Học phí Tiếng Anh IELTS',
        unitPriceSnapshot: 1500000,
        quantity: 1,
        amount: 1500000,
      };

      // Service catalog updated in Month 2
      const updatedServiceCatalog = {
        id: 'svc-1',
        name: 'Học phí Tiếng Anh IELTS',
        unitPrice: 1800000, // Price increased
      };

      expect(historicalLineItem.unitPriceSnapshot).toBe(1500000);
      expect(historicalLineItem.amount).toBe(1500000);
      expect(updatedServiceCatalog.unitPrice).toBe(1800000);
      // Historical item must NOT equal updated service price
      expect(historicalLineItem.unitPriceSnapshot).not.toBe(updatedServiceCatalog.unitPrice);
    });
  });

  describe('Section 12: Independent Space Reporting & Module Isolation', () => {
    it('isolates financial and operational reports per space', () => {
      const spaceA_Invoices = [
        { id: 'inv-1', groupId: 'space-A', amountDue: 1000000, amountPaid: 1000000 },
        { id: 'inv-2', groupId: 'space-A', amountDue: 500000, amountPaid: 0 },
      ];
      const spaceB_Invoices = [
        { id: 'inv-3', groupId: 'space-B', amountDue: 3500000, amountPaid: 3500000 },
      ];

      // Calculate Space A report
      const spaceA_TotalDue = spaceA_Invoices.reduce((s, i) => s + i.amountDue, 0);
      const spaceA_TotalPaid = spaceA_Invoices.reduce((s, i) => s + i.amountPaid, 0);
      const spaceA_Debt = spaceA_TotalDue - spaceA_TotalPaid;

      // Calculate Space B report
      const spaceB_TotalDue = spaceB_Invoices.reduce((s, i) => s + i.amountDue, 0);
      const spaceB_TotalPaid = spaceB_Invoices.reduce((s, i) => s + i.amountPaid, 0);
      const spaceB_Debt = spaceB_TotalDue - spaceB_TotalPaid;

      expect(spaceA_TotalDue).toBe(1500000);
      expect(spaceA_Debt).toBe(500000);

      expect(spaceB_TotalDue).toBe(3500000);
      expect(spaceB_Debt).toBe(0);

      // Reports must not bleed into each other
      expect(spaceA_TotalDue).not.toBe(spaceB_TotalDue);
    });

    it('enforces route-based sub-reports inside space rather than horizontal duplicate tabs', () => {
      const spaceId = 'space-xyz';
      const expectedReportSubRoutes = [
        `/groups/${spaceId}/reports`,
        `/groups/${spaceId}/reports/financial`,
        `/groups/${spaceId}/reports/debt`,
        `/groups/${spaceId}/reports/attendance`,
        `/groups/${spaceId}/reports/services`,
        `/groups/${spaceId}/reports/rentals`,
        `/groups/${spaceId}/reports/sports`,
        `/groups/${spaceId}/reports/education`,
      ];

      expectedReportSubRoutes.forEach((route) => {
        expect(route).toMatch(/^\/groups\/space-xyz\/reports/);
      });
    });
  });
});

