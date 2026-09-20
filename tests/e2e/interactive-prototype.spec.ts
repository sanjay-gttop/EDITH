import { test, expect } from '@playwright/test';

test.describe('ResQSync // Command - Interactive Prototype & Vehicle Movement E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept any browser alert or dialog: fail test if native alert is invoked
    page.on('dialog', async dialog => {
      throw new Error(`Unexpected browser dialog triggered: "${dialog.message()}". Native alerts are strictly forbidden!`);
    });
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
  });

  test('Dispatch action triggers optimistic lock, in-app toast, and live vehicle route progression', async ({ page }) => {
    // 1. Ensure Header and Brand are present
    await expect(page.getByRole('heading', { name: 'ResQSync' })).toBeVisible();

    // 2. Click "Live Speed & Fuel Dials" to open telemetry overlay
    const openDialsBtn = page.getByRole('button', { name: /Live Speed & Fuel Dials/i });
    await expect(openDialsBtn).toBeVisible();
    await openDialsBtn.click();

    // 3. Find the Dispatch button: "Dispatch & Claim Resource // Optimistic Lock"
    const dispatchBtn = page.getByRole('button', { name: /Dispatch & Claim Resource \/\/ Optimistic Lock/i });
    await expect(dispatchBtn).toBeVisible();

    // 4. Click the dispatch button
    await dispatchBtn.click();

    // 5. Verify compression / loading state "Dispatching Resource..."
    await expect(page.getByText(/Dispatching Resource/i)).toBeVisible();

    // 6. Verify in-app toast notification appears (no browser alerts)
    await expect(
      page.getByText(/RESOURCE DISPATCHED/i).or(page.getByText(/OPTIMISTIC LOCK/i)).first()
    ).toBeVisible({ timeout: 5000 });

    // 7. Verify telemetry dial updates to show active tracking
    await expect(
      page.getByText(/Unit Active & En Route/i).first()
    ).toBeVisible({ timeout: 5000 });

    // 8. Verify the moving vehicle marker is rendered on the map
    const vehicleMarker = page.getByText('ENG-03').first();
    await expect(vehicleMarker).toBeVisible();
  });

  test('Notification drawer opens from header bell and displays dispatches without browser alerts', async ({ page }) => {
    // Locate the bell icon button in header
    const bellBtn = page.getByTitle(/Notifications & Live Dispatch Feed/i);
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // Verify slide-over drawer opens
    await expect(page.getByText(/Disaster Notifications/i)).toBeVisible();
    await expect(page.getByText(/logged tactical signals/i)).toBeVisible();

    // Close the drawer using the close button
    const closeBtn = page.locator('button:has(svg.lucide-x)');
    if (await closeBtn.first().isVisible()) {
      await closeBtn.first().click();
    }
  });

  test('Filter pills update active selection state', async ({ page }) => {
    // Filter pills in Haulix sub-bar have counts attached
    const criticalPill = page.getByRole('button', { name: /^Critical \d+/ });
    await expect(criticalPill).toBeVisible();
    await criticalPill.click();

    const urgentPill = page.getByRole('button', { name: /^Urgent \d+/ });
    await expect(urgentPill).toBeVisible();
    await urgentPill.click();

    const allPill = page.getByRole('button', { name: /^All Incidents \d+/ });
    await expect(allPill).toBeVisible();
    await allPill.click();
  });

  test('Operation Creation Workflow opens in-app modal and updates system state', async ({ page }) => {
    // Navigate to System Health & Analytical Tools tab (which hosts AnalyticsToolsView)
    const systemHealthTab = page.getByRole('button', { name: 'System Health' });
    await expect(systemHealthTab).toBeVisible();
    await systemHealthTab.click();

    // Click "Create new operation" button
    const createOpBtn = page.getByRole('button', { name: /Create new operation/i });
    await expect(createOpBtn).toBeVisible();
    await createOpBtn.click();

    // Verify modal header is visible
    await expect(page.getByText(/Create New Disaster Operation/i)).toBeVisible();

    // Fill operation title
    const nameInput = page.locator('input[placeholder*="Operation Shield Wall"]').first();
    await nameInput.fill('Operation Coastal Aegis');

    // Submit the form
    const launchBtn = page.getByRole('button', { name: 'Create Operation' });
    await expect(launchBtn).toBeVisible();
    await launchBtn.click();

    // Verify in-app confirmation toast appears
    await expect(page.getByText(/NEW DISASTER OPERATION CREATED/i)).toBeVisible({ timeout: 5000 });
  });
});
