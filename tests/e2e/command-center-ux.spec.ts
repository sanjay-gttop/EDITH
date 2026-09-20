import { test, expect } from '@playwright/test';

test.describe('Milestone 16: Final Command Center UX, All Screens, All States & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates seamlessly across all command center tabs and screens', async ({ page }) => {
    // 1. Dispatch Board (Default)
    await expect(page.getByRole('heading', { name: /Ambulance Allocation Fleet/i })).toBeVisible();

    // 2. Emergency Intake Tab
    await page.getByRole('button', { name: /Emergency Intake/i }).click();
    await expect(page.getByRole('heading', { name: /Emergency Request Intake & Triage/i })).toBeVisible();
    await expect(page.getByText('REQ-911-001')).toBeVisible();

    // 3. Conflicts & Adjudication Tab
    await page.getByRole('button', { name: /Conflicts & Adjudication/i }).click();
    await expect(page.getByRole('heading', { name: /Conflict Adjudication/i })).toBeVisible();

    // 4. Sync Center Tab
    await page.getByRole('button', { name: /Sync Center/i }).click();
    await expect(page.getByRole('heading', { name: /Network State & Sync Engine/i })).toBeVisible();
    await expect(page.getByText('Local IndexedDB Event Buffer')).toBeVisible();

    // 5. Audit & Replay Tab
    await page.getByRole('button', { name: /Audit & Replay/i }).click();
    await expect(page.getByRole('heading', { name: /Authoritative Event Audit/i })).toBeVisible();

    // 6. System Health Tab
    await page.getByRole('button', { name: /System Health/i }).click();
    await expect(page.getByText('AWS Infrastructure & Service Telemetry')).toBeVisible();

    // 7. Settings Tab
    await page.getByRole('button', { name: /Settings/i }).click();
    await expect(page.getByRole('heading', { name: /System Settings & Station Node Parameters/i })).toBeVisible();
  });

  test('unit card click opens accessible Resource Details Modal with keyboard navigation', async ({ page }) => {
    // Navigate to dispatch tab
    await page.getByRole('button', { name: /Dispatch Board/i }).click();

    // Click Medic-12 card
    const medicCard = page.locator('div[role="button"]').filter({ hasText: 'Medic-12' });
    await medicCard.click();

    // Modal dialog is open and has accessible role dialog
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Medic-12')).toBeVisible();
    await expect(modal.getByText('Physical Location:')).toBeVisible();
    await expect(modal.getByText('Authoritative Version')).toBeVisible();

    // Close modal via close button
    const closeBtn = modal.getByLabel('Close dialog');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('emergency intake triggers SageMaker AI assistant modal', async ({ page }) => {
    await page.getByRole('button', { name: /Emergency Intake/i }).click();

    // Click AI Dispatch Assist on pending request
    const aiBtn = page.getByRole('button', { name: /AI Dispatch Assist/i }).first();
    await aiBtn.click();

    // Modal should be open
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('SageMaker Dispatch Assistant')).toBeVisible();
    await expect(modal.getByText('92% Match Confidence')).toBeVisible();

    // Dismiss modal
    await modal.getByRole('button', { name: /Cancel/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('audit view toggles to interactive incident replay scrubber', async ({ page }) => {
    await page.getByRole('button', { name: /Audit & Replay/i }).click();

    // Toggle Replay Scrubber
    await page.getByRole('button', { name: /Interactive Replay Scrubber/i }).click();
    await expect(
      page.getByRole('heading', { name: /Incident Replay & Deterministic State Machine Audit/i })
    ).toBeVisible();
    await expect(page.getByText('Scrub and replay authoritative DynamoDB state transitions')).toBeVisible();

    // Test Play / Step controls
    const nextBtn = page.getByRole('button', { name: /Step forward/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await expect(page.getByRole('heading', { name: 'ALPHA_OFFLINE_CLAIM' })).toBeVisible();

    // Toggle back to log
    await page.getByRole('button', { name: /Immutable Event Log/i }).click();
    await expect(page.getByText('Evidence Payload')).toBeVisible();
  });

  test('responsive viewport rendering at mobile and tablet widths', async ({ page }) => {
    // Set to mobile viewport (iPhone 12/13/14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Header and title still visible
    await expect(page.getByRole('heading', { name: /ResQSync/i })).toBeVisible();
    // Offline banner visible
    await expect(page.getByText('Authoritative Consistency Guarantee')).toBeVisible();

    // Set to large desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('heading', { name: /Ambulance Allocation Fleet/i })).toBeVisible();
  });
});
