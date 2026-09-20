import { test, expect } from '@playwright/test';

test.describe('ResQSync // Command - Milestone 15 Complete User Lifecycle', () => {
  test('executes end-to-end multi-channel disaster lifecycle: browsing, claim, offline, sync, conflict, resolution, audit', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Role Switching & Login Simulation
    const roleSelect = page.locator('select');
    await expect(roleSelect).toBeVisible();
    await roleSelect.selectOption('DISPATCHER');
    expect(await roleSelect.inputValue()).toBe('DISPATCHER');

    // 2. Resource Browsing on Dispatch Board
    await expect(page.locator('text=Ambulance Allocation Fleet')).toBeVisible();
    const medic03Card = page.locator('div.bg-slate-900').filter({ hasText: 'Medic-03' });
    await expect(medic03Card).toBeVisible();

    // 3. Online Claim Attempt on an Available Unit
    const medic15Card = page.locator('div.bg-slate-900').filter({ hasText: 'Medic-15' });
    await expect(medic15Card).toBeVisible();
    const claimBtn = medic15Card.locator('button:has-text("Claim Resource")');
    await expect(claimBtn).toBeVisible();

    // 4. Offline Simulation & Reconnect
    const toggleNetBtn = page.locator('button:has-text("(toggle)")');
    await toggleNetBtn.click();
    await expect(page.locator('[role="status"]:has-text("Offline Mode")')).toBeVisible();

    // Reconnect network
    await toggleNetBtn.click();
    await expect(page.locator('[role="status"]:has-text("Online")')).toBeVisible();

    // 5. Navigate to Sync Center
    const syncCenterTab = page.locator('button:has-text("Sync Center")');
    await syncCenterTab.click();
    await expect(syncCenterTab).toHaveClass(/bg-rose-600/);

    // 6. Navigate to Conflict Adjudication
    const conflictsTab = page.locator('button:has-text("Conflicts & Adjudication")');
    await conflictsTab.click();
    await expect(page.locator('text=Conflict Adjudication: Unit AMB-A12 (Medic-12)')).toBeVisible();

    // Elevate to SUPERVISOR to resolve
    await roleSelect.selectOption('SUPERVISOR');
    const assignAlphaBtn = page.locator('button:has-text("Assign to Alpha")');
    await expect(assignAlphaBtn).toBeEnabled();
    await assignAlphaBtn.click();
    await expect(page.locator('text=Conflict CONF-A12-8801 successfully resolved')).toBeVisible();

    // 7. Navigate to Audit & Replay
    const auditTab = page.locator('button:has-text("Audit & Replay")');
    await auditTab.click();
    await expect(auditTab).toHaveClass(/bg-rose-600/);

    // 8. Return to Dispatch Board to verify authoritative state convergence
    await page.locator('button:has-text("Dispatch Board")').click();
    const medic12Card = page.locator('div.bg-slate-900').filter({ hasText: 'Medic-12' });
    await expect(medic12Card.locator('text=v3')).toBeVisible();
    await expect(medic12Card.locator('[role="status"]:has-text("Claimed")')).toBeVisible();
  });
});
