import { test, expect } from '@playwright/test';

test.describe('ResQSync // Command - Milestone 6 Conflict Adjudication Workflow', () => {
  test('navigates to conflicts tab and displays side-by-side evidence comparison', async ({
    page,
  }) => {
    await page.goto('/');

    // Navigate to conflicts tab
    const conflictsTab = page.locator('button:has-text("Conflicts & Adjudication")');
    await conflictsTab.click();

    // Verify Conflict Adjudication Header
    await expect(
      page.locator('text=Conflict Adjudication: Unit AMB-A12 (Medic-12)'),
    ).toBeVisible();
    await expect(page.locator('text=ID: CONF-A12-8801')).toBeVisible();

    // Verify Side-by-Side Evidence panels
    const claimAlpha = page.locator('text=Claim Alpha');
    const claimBravo = page.locator('text=Claim Bravo');
    await expect(claimAlpha).toBeVisible();
    await expect(claimBravo).toBeVisible();

    // Verify evidence attributes
    await expect(page.locator('text=DEV-TAB-ALPHA')).toBeVisible();
    await expect(page.locator('text=evt-alpha-9901').first()).toBeVisible();
    await expect(page.locator('text=DEV-STATION-BRAVO')).toBeVisible();
    await expect(page.locator('text=evt-bravo-9902').first()).toBeVisible();

    // Verify timeline presence
    await expect(
      page.locator('text=Immutable Conflict Timeline & Evidence Preservation'),
    ).toBeVisible();
  });

  test('enforces RBAC for resolution and updates authoritative state upon supervisor adjudication', async ({
    page,
  }) => {
    await page.goto('/');

    // Navigate to conflicts tab
    await page.locator('button:has-text("Conflicts & Adjudication")').click();

    // With default role DISPATCHER, role restriction notice should be visible
    await expect(page.locator('text=Role Access Restricted')).toBeVisible();
    const assignAlphaBtn = page.locator('button:has-text("Assign to Alpha")');
    await expect(assignAlphaBtn).toBeDisabled();

    // Elevate role to SUPERVISOR using header selector
    const roleSelect = page.locator('select');
    await roleSelect.selectOption('SUPERVISOR');

    // Role restriction notice disappears, button becomes enabled
    await expect(page.locator('text=Role Access Restricted')).not.toBeVisible();
    await expect(assignAlphaBtn).toBeEnabled();

    // Supervisor resolves in favor of Alpha
    await assignAlphaBtn.click();

    // Verify success confirmation banner
    await expect(
      page.locator('text=Conflict CONF-A12-8801 successfully resolved: Assigned to ALPHA'),
    ).toBeVisible();

    // Verify AWARDED ALLOCATION badge
    await expect(page.locator('text=AWARDED ALLOCATION')).toBeVisible();

    // Switch back to Dispatch Board and verify convergence to v3
    await page.locator('button:has-text("Dispatch Board")').click();
    const medic12Card = page.locator('div.bg-slate-900').filter({ hasText: 'Medic-12' });
    await expect(medic12Card).toBeVisible();
    await expect(medic12Card.locator('text=v3')).toBeVisible();
  });
});
