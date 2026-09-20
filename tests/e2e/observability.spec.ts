import { test, expect } from '@playwright/test';

test.describe('ResQSync // Command - Milestone 14 Observability & System Health', () => {
  test('navigates to System Health and verifies CloudWatch telemetry & simulation labels', async ({
    page,
  }) => {
    await page.goto('/');

    // Click System Health tab
    const healthTab = page.locator('button:has-text("System Health")');
    await expect(healthTab).toBeVisible();
    await healthTab.click();

    // Verify Telemetry Provenance & Integrity Statement
    await expect(page.locator('text=Telemetry Provenance & Integrity Statement')).toBeVisible();

    // Verify simulation labels are present and distinct
    const simulationBadges = page.locator('text=SIMULATION TELEMETRY');
    await expect(simulationBadges.first()).toBeVisible();

    // Verify primary KPI cards
    await expect(page.locator('text=Authoritative API Latency')).toBeVisible();
    await expect(page.locator('text=Sync Reconnect Latency')).toBeVisible();
    await expect(page.locator('text=Active Conflicts Under Review')).toBeVisible();
    await expect(page.locator('text=Dead Letter Queue (DLQ)')).toBeVisible();

    // Verify AWS Infrastructure & Service Telemetry
    await expect(page.locator('text=AWS Infrastructure & Service Telemetry')).toBeVisible();
    await expect(page.getByText('DynamoDB', { exact: true })).toBeVisible();
    await expect(page.locator('text=Single-Table Active')).toBeVisible();
    await expect(page.getByText('SageMaker AI', { exact: true })).toBeVisible();

    // Verify CloudWatch EMF Log Stream Visualizer
    await expect(
      page.locator('text=CloudWatch Embedded Metric Format (EMF) Log Stream'),
    ).toBeVisible();

    // Verify EMF metric filter buttons
    const filterBtn = page.locator('button:has-text("SageMaker")');
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await expect(page.locator('text=Nearest ALS ambulance recommendation')).toBeVisible();
  });
});
