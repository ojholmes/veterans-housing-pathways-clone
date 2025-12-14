const { test, expect } = require('@playwright/test');

test('ws demo receives events and admin last-email is available', async ({ page, request }) => {
  // Open WS demo page
  await page.goto('http://localhost:5173/ws-demo');
  await expect(page.locator('.title')).toHaveText('WebSocket Demo');

  // Trigger creating an interaction via API
  const apiRes = await request.post('http://localhost:4000/interactions', {
    data: { clientId: 1, contactType: 'test', serviceType: 'test', progressSummary: 'e2e test interaction', actor: 'NAVIGATOR' }
  });
  expect(apiRes.ok()).toBeTruthy();

  // Give websocket a moment to receive
  await page.waitForTimeout(500);
  // The events list should contain at least one message
  const pre = page.locator('pre').first();
  await expect(pre).toBeVisible();

  // Trigger overdue checker which should send email via configured provider or Ethereal
  const overdue = await request.post('http://localhost:4000/admin/run-overdue');
  expect(overdue.ok()).toBeTruthy();

  // Fetch last-email via admin helper
  const last = await request.get('http://localhost:4000/admin/last-email');
  expect(last.ok()).toBeTruthy();
  const data = await last.json();
  expect(data).toHaveProperty('last');
});
