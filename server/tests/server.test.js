process.env.NODE_ENV = 'test';

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

const app = createApp();
let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('SpendSense API Integration Suite', () => {
  let userToken;
  let userBToken;
  let createdTxId;
  let createdBudgetId;
  let createdGoalId;

  test('1. Health Check Endpoint returns 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'healthy');
    assert.equal(body.service, 'SpendSense API');
  });

  test('2. Protected endpoints reject requests with missing token (401)', async () => {
    const res = await fetch(`${baseUrl}/transactions`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test('3. User Registration creates user and returns auth session', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Finch',
        email: 'jordan@spendsense.app',
        password: 'securePassword123!',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.session?.access_token);
    userToken = body.session.access_token;
  });

  test('4. User Login returns valid session token', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jordan@spendsense.app',
        password: 'securePassword123!',
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.session?.access_token);
  });

  test('5. GET /api/auth/me returns authenticated user identity', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.profile);
  });

  test('6. User Profile updates settings and currency', async () => {
    const res = await fetch(`${baseUrl}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        currency: 'EUR',
        openingBalance: 5000,
        hideBalance: true,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.currency, 'EUR');
    assert.equal(body.data.openingBalance, 5000);
    assert.equal(body.data.hideBalance, true);
  });

  test('7. Transactions CRUD: Add income and expense transactions', async () => {
    // Add income
    const incRes = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        type: 'income',
        amount: 4000,
        categoryId: 'salary',
        description: 'Monthly Salary',
        date: '2026-10-01',
      }),
    });
    assert.equal(incRes.status, 201);

    // Add expense
    const expRes = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        type: 'expense',
        amount: 1200,
        categoryId: 'housing',
        description: 'Studio Rent',
        date: '2026-10-02',
      }),
    });
    assert.equal(expRes.status, 201);
    const expBody = await expRes.json();
    createdTxId = expBody.data.id;

    // List transactions
    const listRes = await fetch(`${baseUrl}/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.ok(listBody.data.length >= 2);
  });

  test('8. Transactions Update & Filter', async () => {
    // Update
    const putRes = await fetch(`${baseUrl}/transactions/${createdTxId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        description: 'Studio Rent - Verified Payment',
      }),
    });
    assert.equal(putRes.status, 200);
    const putBody = await putRes.json();
    assert.equal(putBody.data.description, 'Studio Rent - Verified Payment');

    // Filter by type=expense
    const filterRes = await fetch(`${baseUrl}/transactions?type=expense`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const filterBody = await filterRes.json();
    assert.ok(filterBody.data.every((t) => t.type === 'expense'));
  });

  test('9. Budgets CRUD: Create budget and calculate utilization metrics', async () => {
    const res = await fetch(`${baseUrl}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        categoryId: 'housing',
        limit: 1500,
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    createdBudgetId = body.data.id;
    assert.equal(body.data.categoryId, 'housing');
    assert.equal(body.data.limit, 1500);

    // List budgets with live calculated status
    const listRes = await fetch(`${baseUrl}/budgets`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    const housingBudget = listBody.data.find((b) => b.categoryId === 'housing');
    assert.ok(housingBudget);
    assert.ok(housingBudget.spent >= 1200);
    assert.ok(housingBudget.utilization >= 80);
    assert.equal(housingBudget.state, 'warning'); // >= 80% is warning state
  });

  test('10. Goals CRUD: Create goal, track progress, contribute funds', async () => {
    const res = await fetch(`${baseUrl}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Electric Motorcycle',
        target: 8000,
        saved: 2000,
        deadline: '2027-06-01',
        color: '#38bdf8',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    createdGoalId = body.data.id;
    assert.equal(body.data.percentage, 25);
    assert.equal(body.data.remaining, 6000);

    // Contribute
    const contribRes = await fetch(`${baseUrl}/goals/${createdGoalId}/contribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ amount: 1000 }),
    });
    assert.equal(contribRes.status, 200);
    const contribBody = await contribRes.json();
    assert.equal(contribBody.data.saved, 3000);
    assert.ok(contribBody.data.percentage > 25);
  });

  test('11. Dashboard Summary returns real calculated financials', async () => {
    const res = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.balance !== undefined);
    assert.ok(body.data.currentMonth);
    assert.ok(Array.isArray(body.data.categoryBreakdown));
    assert.ok(Array.isArray(body.data.cashFlowHistory));
  });

  test('12. Mathematical Insights & Recommendations generated', async () => {
    const res = await fetch(`${baseUrl}/insights`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    // Should flag the housing budget nearing its limit (utilization >= 80%)
    const housingWarning = body.data.find((i) => i.id.includes('housing'));
    assert.ok(housingWarning);
  });

  test('13. Multi-User Isolation: User B cannot access User A records', async () => {
    // Register User B
    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Taylor Swift',
        email: 'taylor@spendsense.app',
        password: 'anotherPassword456!',
      }),
    });
    const bodyB = await resB.json();
    userBToken = bodyB.session.access_token;

    // User B tries to get User A's transaction
    const getRes = await fetch(`${baseUrl}/transactions/${createdTxId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    // Must return 404 or 500 (Transaction not found for User B)
    assert.ok(getRes.status === 404 || getRes.status === 500);

    // User B lists transactions: should not see User A's transactions
    const listRes = await fetch(`${baseUrl}/transactions`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const listBody = await listRes.json();
    assert.ok(!listBody.data.some((t) => t.id === createdTxId));
  });

  test('14. Cleanup / Deletion of entities', async () => {
    // Delete transaction
    const delTx = await fetch(`${baseUrl}/transactions/${createdTxId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(delTx.status, 200);

    // Delete budget
    const delBudget = await fetch(`${baseUrl}/budgets/${createdBudgetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(delBudget.status, 200);

    // Delete goal
    const delGoal = await fetch(`${baseUrl}/goals/${createdGoalId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(delGoal.status, 200);
  });
});
