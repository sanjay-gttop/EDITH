import { test, expect } from '@playwright/test';

test.describe('ResQSync // Command - Milestone 1 Smoke Tests', () => {
  test('application shell loads and displays authoritative header and branding', async ({
    page,
  }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/ResQSync \/\/ Command/);

    // Verify header branding
    const brand = page.getByRole('heading', { name: 'ResQSync' });
    await expect(brand).toBeVisible();

    const commandBadge = page.getByText(/COMMAND \/\//i);
    await expect(commandBadge).toBeVisible();

    // Verify offline consistency guarantee banner
    const disclaimer = page.locator('text=Authoritative Consistency Guarantee');
    await expect(disclaimer).toBeVisible();
  });

  test('renders ambulance allocation fleet with accessible state badges', async ({ page }) => {
    await page.goto('/');

    // Verify fleet section heading
    const fleetHeading = page.locator('text=Ambulance Allocation Fleet');
    await expect(fleetHeading).toBeVisible();

    // Verify demo ambulance units
    await expect(page.locator('text=Medic-12')).toBeVisible();
    await expect(page.locator('text=Medic-07')).toBeVisible();
    await expect(page.locator('text=Rescue-19')).toBeVisible();

    // Verify state badges with accessible status roles
    const availableBadges = page.locator('[role="status"]:has-text("Available")');
    await expect(availableBadges.first()).toBeVisible();

    const pendingSyncBadges = page.locator('[role="status"]:has-text("Pending Sync")');
    await expect(pendingSyncBadges.first()).toBeVisible();
  });

  test('toggles network connectivity state badge', async ({ page }) => {
    await page.goto('/');

    // Initial state is online
    const onlineBadge = page.locator('[role="status"]:has-text("Online")');
    await expect(onlineBadge).toBeVisible();

    // Click toggle button
    const toggleButton = page.locator('button:has-text("(toggle)")');
    await toggleButton.click();

    // Badge should change to Offline Mode
    const offlineBadge = page.locator('[role="status"]:has-text("Offline Mode")');
    await expect(offlineBadge).toBeVisible();
  });

  test('switches navigation tabs smoothly', async ({ page }) => {
    await page.goto('/');

    const conflictsTab = page.locator('button:has-text("Conflicts & Adjudication")');
    await conflictsTab.click();
    await expect(conflictsTab).toHaveClass(/bg-rose-600/);

    const syncCenterTab = page.locator('button:has-text("Sync Center")');
    await syncCenterTab.click();
    await expect(syncCenterTab).toHaveClass(/bg-rose-600/);
  });
});
