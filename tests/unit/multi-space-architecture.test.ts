import { describe, it, expect } from 'vitest';
import {
  generateSpaceCode,
  parseEnabledModules,
  isModuleEnabled,
  SPACE_MODULES,
  SPACE_PALETTES,
} from '@/lib/spaces/constants';

describe('Multi-Space Architecture & Module Toggles', () => {
  it('generates unique space codes starting with TR- followed by 4 uppercase alphanumeric characters', () => {
    const code = generateSpaceCode();
    expect(code).toMatch(/^TR-[A-Z0-9]{4}$/);

    // Test distinct generation
    const code2 = generateSpaceCode();
    expect(code).not.toEqual(code2);
  });

  it('parses comma-separated enabled modules correctly', () => {
    const raw = 'members,attendance,invoices';
    const modules = parseEnabledModules(raw);
    expect(modules).toEqual(['members', 'attendance', 'invoices']);
  });

  it('correctly handles JSON array string of enabled modules', () => {
    const raw = JSON.stringify(['members', 'reports', 'automations']);
    const modules = parseEnabledModules(raw);
    expect(modules).toEqual(['members', 'reports', 'automations']);
  });

  it('provides default enabled modules if empty or null', () => {
    const modules = parseEnabledModules(null);
    expect(modules).toContain('members');
    expect(modules).toContain('attendance');
    expect(modules).toContain('invoices');
  });

  it('checks if a module is enabled accurately', () => {
    const raw = 'members,invoices,reconciliation';
    expect(isModuleEnabled(raw, 'members')).toBe(true);
    expect(isModuleEnabled(raw, 'invoices')).toBe(true);
    expect(isModuleEnabled(raw, 'reconciliation')).toBe(true);
    expect(isModuleEnabled(raw, 'attendance')).toBe(false);
    expect(isModuleEnabled(raw, 'automations')).toBe(false);
  });

  it('defines 8 core space modules with proper descriptions and categories', () => {
    expect(SPACE_MODULES.length).toBe(8);
    const ids = SPACE_MODULES.map((m) => m.id);
    expect(ids).toContain('members');
    expect(ids).toContain('attendance');
    expect(ids).toContain('invoices');
    expect(ids).toContain('reconciliation');
    expect(ids).toContain('reports');
    expect(ids).toContain('notifications');
    expect(ids).toContain('documents');
    expect(ids).toContain('automations');
  });

  it('provides curated brand palettes including Royal Blue and Deep Violet', () => {
    const hexes = SPACE_PALETTES.map((p) => p.hex);
    expect(hexes).toContain('#2538D9');
    expect(hexes).toContain('#6D5CE8');
    expect(hexes).toContain('#059669');
  });
});
