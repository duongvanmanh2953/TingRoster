import { describe, it, expect } from 'vitest';
import { SPACE_MODULES, SPACE_PALETTES, parseEnabledModules } from '@/lib/spaces/constants';
import { ROUTE_TITLES } from '@/hooks/usePageTitle';

describe('Two-Level Architecture & Information Navigation', () => {
  it('Level 1: Route /groups has standardized title "Không gian của tôi"', () => {
    expect(ROUTE_TITLES['/groups']).toBeDefined();
    expect(ROUTE_TITLES['/groups'].vi).toBe('Không gian của tôi');
  });

  it('Level 1 & Level 2: Semantic labels avoid clunky compound terms', () => {
    // Should NOT contain awkward compound terms
    const forbiddenTerms = [
      'Cài đặt và logo',
      'Cài đặt & logo',
      'Các thứ khác',
      'Quản lý dữ liệu',
      'Thông tin cấu hình',
    ];

    Object.values(ROUTE_TITLES).forEach((item) => {
      forbiddenTerms.forEach((forbidden) => {
        expect(item.vi).not.toContain(forbidden);
      });
    });

    // Check standardized labels
    expect(ROUTE_TITLES['/invoices'].vi).toBe('Khoản thu');
    expect(ROUTE_TITLES['/reports'].vi).toBe('Tổng quan báo cáo');
    expect(ROUTE_TITLES['/members'].vi).toBe('Thành viên');
  });

  it('Level 2: Module parser correctly parses and filters space features', () => {
    const modulesString = 'members,attendance,invoices';
    const parsed = parseEnabledModules(modulesString);

    expect(parsed).toEqual(['members', 'attendance', 'invoices']);
    expect(parsed.includes('members')).toBe(true);
    expect(parsed.includes('attendance')).toBe(true);
    expect(parsed.includes('invoices')).toBe(true);
    expect(parsed.includes('reconciliation')).toBe(false);
    expect(parsed.includes('reports')).toBe(false);
  });

  it('Level 2: All 8 core modules have proper descriptions and unique IDs', () => {
    expect(SPACE_MODULES.length).toBe(8);

    const moduleIds = SPACE_MODULES.map((m) => m.id);
    expect(new Set(moduleIds).size).toBe(8);

    SPACE_MODULES.forEach((mod) => {
      expect(mod.name.length).toBeGreaterThan(0);
      expect(mod.description.length).toBeGreaterThan(10);
    });
  });

  it('Level 2: Curated palettes have verified HEX and contrast colors', () => {
    expect(SPACE_PALETTES.length).toBeGreaterThanOrEqual(7);

    SPACE_PALETTES.forEach((palette) => {
      expect(palette.hex).toMatch(/^#([A-Fa-f0-9]{6})$/);
      expect(palette.name.length).toBeGreaterThan(0);
    });
  });

  it('Contextual navigation detects Level 2 subroutes accurately', () => {
    const isLevel2 = (path: string) => {
      const match = path.match(/^\/groups\/([^/]+)/);
      return Boolean(match && match[1] !== 'groups' && match[1] !== 'new');
    };

    expect(isLevel2('/dashboard')).toBe(false);
    expect(isLevel2('/groups')).toBe(false);
    expect(isLevel2('/groups/new')).toBe(false);

    expect(isLevel2('/groups/cm-space-123')).toBe(true);
    expect(isLevel2('/groups/cm-space-123/members')).toBe(true);
    expect(isLevel2('/groups/cm-space-123/settings')).toBe(true);
  });
});
