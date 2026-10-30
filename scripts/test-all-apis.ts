import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  ok: boolean;
  error?: string;
  bodySnippet?: string;
}

async function run() {
  console.log(`Starting API Audit on ${BASE_URL}...\n`);

  // 1. Authenticate as demo user
  let cookies = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@tingroster.vn', password: '123456' }),
    });
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
      cookies = setCookie.split(';')[0];
      console.log(' Authenticated demo user successfully.');
    } else {
      console.error(' Failed to get session cookie from login.');
    }
  } catch (err: any) {
    console.error(' Login error:', err.message);
  }

  // Get active group ID
  let sampleGroupId = '';
  let sampleMemberId = '';
  try {
    const groupsRes = await fetch(`${BASE_URL}/api/groups`, {
      headers: { Cookie: cookies },
    });
    const data = await groupsRes.json();
    if (data.success && data.data?.length > 0) {
      sampleGroupId = data.data[0].id;
      console.log(` Found active sample group: ${sampleGroupId} (${data.data[0].name})`);

      const membersRes = await fetch(`${BASE_URL}/api/members?groupId=${sampleGroupId}`, {
        headers: { Cookie: cookies },
      });
      const mData = await membersRes.json();
      if (mData.success && mData.data?.length > 0) {
        sampleMemberId = mData.data[0].id;
        console.log(` Found active sample member: ${sampleMemberId} (${mData.data[0].name})`);
      }
    }
  } catch (err: any) {
    console.error(' Error retrieving sample group:', err.message);
  }

  // List of endpoints to test
  const endpoints: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    requireAuth?: boolean;
    description: string;
  }[] = [
    // Auth
    { endpoint: '/api/auth/me', method: 'GET', requireAuth: true, description: 'Current User Me' },
    
    // Groups
    { endpoint: '/api/groups', method: 'GET', requireAuth: true, description: 'List Groups' },
    { endpoint: `/api/groups/${sampleGroupId}`, method: 'GET', requireAuth: true, description: 'Get Group Details' },
    { endpoint: `/api/groups/${sampleGroupId}/classes`, method: 'GET', requireAuth: true, description: 'Get Group Classes' },
    { endpoint: `/api/groups/${sampleGroupId}/rentals`, method: 'GET', requireAuth: true, description: 'Get Group Rentals' },
    { endpoint: `/api/groups/${sampleGroupId}/bookings`, method: 'GET', requireAuth: true, description: 'Get Group Bookings' },
    { endpoint: `/api/groups/${sampleGroupId}/services`, method: 'GET', requireAuth: true, description: 'Get Group Services' },
    { endpoint: `/api/groups/${sampleGroupId}/surcharges`, method: 'GET', requireAuth: true, description: 'Get Group Surcharges' },
    { endpoint: `/api/groups/${sampleGroupId}/meters`, method: 'GET', requireAuth: true, description: 'Get Group Meters' },
    { endpoint: `/api/groups/${sampleGroupId}/shifts`, method: 'GET', requireAuth: true, description: 'Get Group Shifts' },
    { endpoint: `/api/groups/${sampleGroupId}/contracts`, method: 'GET', requireAuth: true, description: 'Get Group Contracts' },
    { endpoint: `/api/groups/${sampleGroupId}/chat`, method: 'GET', requireAuth: true, description: 'Get Group Chat' },
    { endpoint: `/api/groups/${sampleGroupId}/chat/polls`, method: 'GET', requireAuth: true, description: 'Get Group Chat Polls' },

    // Members
    { endpoint: `/api/members?groupId=${sampleGroupId}`, method: 'GET', requireAuth: true, description: 'List Members by Group' },
    { endpoint: `/api/members/${sampleMemberId}`, method: 'GET', requireAuth: true, description: 'Get Single Member' },
    { endpoint: `/api/members/${sampleMemberId}/details`, method: 'GET', requireAuth: true, description: 'Get Member Details' },

    // Attendance
    {
      endpoint: `/api/attendance?groupId=${sampleGroupId}&date=2026-10-30`,
      method: 'GET',
      requireAuth: true,
      description: 'Get Attendance for Date',
    },
    {
      endpoint: '/api/attendance',
      method: 'POST',
      body: {
        groupId: sampleGroupId,
        memberId: sampleMemberId,
        date: '2026-10-30',
        isPresent: true,
        status: 'PRESENT',
      },
      requireAuth: true,
      description: 'Upsert Single Attendance',
    },
    {
      endpoint: '/api/attendance/bulk',
      method: 'GET',
      requireAuth: true,
      description: 'GET Attendance Bulk Endpoint',
    },
    {
      endpoint: '/api/attendance/bulk',
      method: 'POST',
      body: {
        groupId: sampleGroupId,
        date: '2026-10-30',
        records: [
          { memberId: sampleMemberId, isPresent: true, status: 'PRESENT' },
        ],
      },
      requireAuth: true,
      description: 'POST Bulk Attendance (records format)',
    },
    {
      endpoint: '/api/attendance/bulk',
      method: 'POST',
      body: {
        groupId: sampleGroupId,
        date: '2026-10-30',
        attendances: [
          { memberId: sampleMemberId, isPresent: true, status: 'PRESENT' },
        ],
      },
      requireAuth: true,
      description: 'POST Bulk Attendance (attendances format)',
    },

    // Invoices & Transactions
    { endpoint: `/api/invoices?groupId=${sampleGroupId}`, method: 'GET', requireAuth: true, description: 'List Invoices by Group' },
    { endpoint: '/api/transactions', method: 'GET', requireAuth: true, description: 'List Transactions' },
    { endpoint: '/api/transactions/unmatched', method: 'GET', requireAuth: true, description: 'List Unmatched Transactions' },

    // Dashboard & Summary
    { endpoint: '/api/dashboard/summary', method: 'GET', requireAuth: true, description: 'Dashboard Summary' },
    { endpoint: '/api/wallet', method: 'GET', requireAuth: true, description: 'Wallet' },
    { endpoint: '/api/reports', method: 'GET', requireAuth: true, description: 'Reports' },
    { endpoint: '/api/settings', method: 'GET', requireAuth: true, description: 'Settings' },
    { endpoint: '/api/support/tickets', method: 'GET', requireAuth: true, description: 'Support Tickets' },
    { endpoint: '/api/automations', method: 'GET', requireAuth: true, description: 'Automations' },
    { endpoint: '/api/policies', method: 'GET', requireAuth: true, description: 'Policies' },
    { endpoint: '/api/community/members', method: 'GET', requireAuth: true, description: 'Community Members' },
    { endpoint: '/api/chat/conversations', method: 'GET', requireAuth: true, description: 'Chat Conversations' },
    { endpoint: '/api/admin', method: 'GET', requireAuth: true, description: 'Admin Config' },

    { endpoint: '/api/members/bulk', method: 'GET', requireAuth: true, description: 'Bulk Members GET' },
    { endpoint: '/api/invoices/bulk-create', method: 'GET', requireAuth: true, description: 'Bulk Invoices Create GET' },
    { endpoint: '/api/invoices/import', method: 'GET', requireAuth: true, description: 'Invoices Import GET' },

    // Portal APIs
    { endpoint: '/api/portal/dashboard', method: 'GET', requireAuth: true, description: 'Portal Dashboard' },
    { endpoint: '/api/portal/attendance', method: 'GET', requireAuth: true, description: 'Portal Attendance' },
    { endpoint: '/api/portal/fees', method: 'GET', requireAuth: true, description: 'Portal Fees' },
    { endpoint: '/api/portal/contracts', method: 'GET', requireAuth: true, description: 'Portal Contracts' },
    { endpoint: '/api/portal/shifts', method: 'GET', requireAuth: true, description: 'Portal Shifts' },
    { endpoint: '/api/portal/surcharges', method: 'GET', requireAuth: true, description: 'Portal Surcharges' },

    // Public / Kiosk
    { endpoint: `/api/kiosk/${sampleGroupId}`, method: 'GET', requireAuth: false, description: 'Kiosk Public Group Info' },
  ];

  const results: TestResult[] = [];

  for (const item of endpoints) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (item.requireAuth && cookies) {
        headers['Cookie'] = cookies;
      }

      const res = await fetch(`${BASE_URL}${item.endpoint}`, {
        method: item.method,
        headers,
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      const text = await res.text();
      let isOk = res.status >= 200 && res.status < 400;
      let error = undefined;

      try {
        const json = JSON.parse(text);
        if (json.success === false) {
          isOk = false;
          error = json.error || 'API returned success: false';
        }
      } catch {
        // text response
      }

      results.push({
        endpoint: `${item.method} ${item.endpoint}`,
        method: item.method,
        status: res.status,
        ok: isOk,
        error,
        bodySnippet: text.slice(0, 120),
      });
    } catch (err: any) {
      results.push({
        endpoint: `${item.method} ${item.endpoint}`,
        method: item.method,
        status: 0,
        ok: false,
        error: err.message,
      });
    }
  }

  console.log('\n--- API AUDIT RESULTS ---');
  let failures = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`[PASS] ${r.status} ${r.endpoint}`);
    } else {
      failures++;
      console.log(`[FAIL] ${r.status} ${r.endpoint} -> ${r.error || r.bodySnippet}`);
    }
  }

  console.log(`\nTotal: ${results.length} | Passed: ${results.length - failures} | Failed: ${failures}`);
}

run();
