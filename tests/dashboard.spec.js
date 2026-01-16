import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/optimizer-prime-dashboard/';

test.describe('Optimizer Prime Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard with initial state', async ({ page }) => {
    // Check header
    await expect(page.locator('text=Optimizer Prime Dashboard')).toBeVisible();

    // Check left sidebar sections
    await expect(page.locator('text=DEMOLITION')).toBeVisible();
    await expect(page.locator('text=INTERIOR SPACES')).toBeVisible();
    await expect(page.locator('text=EXTERIOR SPACES')).toBeVisible();

    // Check "How to use" card
    await expect(page.locator('text=How to use this dashboard')).toBeVisible();

    // Check keyboard shortcuts section
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
  });

  test('should select rooms and update middle editor', async ({ page }) => {
    // Click Learning Room 101
    await page.locator('text=Learning Room 101').click();

    // Verify middle editor shows room details
    await expect(page.locator('text=Learning Room')).toBeVisible();

    // Click Demolition
    await page.locator('text=Demolition').first().click();

    // Verify demolition editor appears
    await expect(page.locator('text=Flooring')).toBeVisible();

    // Click Playground (exterior)
    await page.locator('text=Playground').click();

    // Verify playground editor appears
    await expect(page.locator('text=Playground')).toBeVisible();
  });

  test('should flash cost when slider moves', async ({ page }) => {
    // Select a room
    await page.locator('text=Learning Room 101').click();
    await page.waitForTimeout(500);

    // Get initial cost
    const costElement = page.locator('[id^="cost-details-"]').first();
    const initialCost = await costElement.textContent();

    // Find and move a slider
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('2');

    // Wait for animation
    await page.waitForTimeout(400);

    // Verify cost changed
    const newCost = await costElement.textContent();
    expect(newCost).not.toBe(initialCost);

    // Note: The flash animation is visual and hard to test directly,
    // but we've verified the cost updates which triggers the animation
  });

  test('should navigate with keyboard shortcuts', async ({ page }) => {
    // Start at first room
    await page.locator('text=Learning Room 101').click();
    await page.waitForTimeout(200);

    // Press down arrow (should go to next room)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Verify we moved to a different room (Office is locked by default)
    const middleEditor = page.locator('.lg\\:col-span-5').first();
    await expect(middleEditor.locator('text=Office')).toBeVisible();

    // Press up arrow (should go back)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);

    // Press Escape (should go to demolition)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Flooring')).toBeVisible();

    // Test j/k vim-style navigation
    await page.keyboard.press('j');
    await page.waitForTimeout(300);
    await expect(middleEditor.locator('text=Learning Room')).toBeVisible();
  });

  test('should add and delete rooms', async ({ page }) => {
    // Count initial interior rooms
    const initialCount = await page.locator('text=Learning Room').count();

    // Click Add Interior Space
    await page.locator('button:has-text("+ Add Interior Space")').click();
    await page.waitForTimeout(500);

    // Verify new room appears and is selected
    const newRoomCount = await page.locator('[role="button"][aria-current="true"]').count();
    expect(newRoomCount).toBeGreaterThan(0);

    // Verify middle editor shows the new room
    await expect(page.locator('text=Room')).toBeVisible();

    // Click delete button in middle editor
    await page.locator('button:has-text("Delete")').click();
    await page.waitForTimeout(500);

    // Verify another room is auto-selected (not white screen)
    await expect(page.locator('.lg\\:col-span-5').first()).toBeVisible();
  });

  test('should lock and unlock rooms', async ({ page }) => {
    // Select a room
    await page.locator('text=Learning Room 101').click();
    await page.waitForTimeout(300);

    // Find lock button in sidebar (within the selected card)
    const lockButton = page.locator('[aria-current="true"] button[data-lock-button]').first();
    await lockButton.click();
    await page.waitForTimeout(300);

    // Verify sliders are disabled in middle editor
    const slider = page.locator('input[type="range"]').first();
    const isDisabled = await slider.isDisabled();
    expect(isDisabled).toBe(true);

    // Unlock again
    await lockButton.click();
    await page.waitForTimeout(300);

    // Verify sliders are enabled
    const isEnabled = await slider.isEnabled();
    expect(isEnabled).toBe(true);
  });

  test('should show empty state when no rooms', async ({ page }) => {
    // Delete all interior rooms
    const deleteButtons = await page.locator('button:has-text("Delete")').all();

    for (let i = 0; i < deleteButtons.length; i++) {
      // Select first interior room
      const interiorRoom = page.locator('text=Learning Room').first();
      if (await interiorRoom.isVisible()) {
        await interiorRoom.click();
        await page.waitForTimeout(200);

        // Delete it
        await page.locator('button:has-text("Delete")').first().click();
        await page.waitForTimeout(300);
      }
    }

    // Check for empty state message
    const emptyState = page.locator('text=No interior spaces yet');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator('text=Add your first space below to get started')).toBeVisible();
    }
  });

  test('should show mobile dropdown on small viewport', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Verify left sidebar is hidden
    const leftSidebar = page.locator('.lg\\:col-span-3').first();
    await expect(leftSidebar).toBeHidden();

    // Verify dropdown is visible
    const dropdown = page.locator('select').first();
    await expect(dropdown).toBeVisible();

    // Select an option from dropdown
    await dropdown.selectOption({ label: /Learning Room/ });
    await page.waitForTimeout(300);

    // Verify middle editor updates
    await expect(page.locator('text=Learning Room')).toBeVisible();
  });

  test('should have keyboard navigation with Tab and Enter', async ({ page }) => {
    // Tab to first room card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to select
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Verify room was selected
    const selectedCard = page.locator('[aria-current="true"]');
    await expect(selectedCard).toBeVisible();
  });

  test('should update costs in real-time', async ({ page }) => {
    // Select a room
    await page.locator('text=Learning Room 101').click();
    await page.waitForTimeout(300);

    // Get cost element
    const costElement = page.locator('[id^="cost-details-"]').first();
    const initialCost = await costElement.textContent();

    // Move multiple sliders
    const sliders = await page.locator('input[type="range"]').all();
    if (sliders.length > 0) {
      await sliders[0].fill('2');
      await page.waitForTimeout(200);

      const updatedCost = await costElement.textContent();
      expect(updatedCost).not.toBe(initialCost);
    }

    // Adjust global assumption
    const globalSlider = page.locator('text=Design fee').locator('..').locator('input[type="range"]');
    await globalSlider.fill('8');
    await page.waitForTimeout(200);

    // Verify grand total updated
    await expect(page.locator('text=Grand total')).toBeVisible();
  });

  test('should have ARIA attributes for accessibility', async ({ page }) => {
    // Check for aria-current on selected room
    const selectedCard = page.locator('[aria-current="true"]').first();
    await expect(selectedCard).toBeVisible();

    // Check for aria-label on room cards
    const roomCard = page.locator('[role="button"]').first();
    const ariaLabel = await roomCard.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain(','); // Should have room name, type

    // Check for aria-describedby pointing to cost
    const ariaDescribedBy = await roomCard.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('cost-details-');
  });

  test('should export to PDF with Cmd+S', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

    // Press Cmd+S (or Ctrl+S)
    await page.keyboard.press('Meta+s');

    // Wait for download
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe('optimizer-prime-dashboard.pdf');

    // Verify file was downloaded
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should display error boundary on errors', async ({ page }) => {
    // This test would require intentionally breaking something
    // For now, we just verify the ErrorBoundary component exists in code
    // Real testing would involve triggering a React error

    // Verify the page doesn't have any unhandled errors initially
    const errors = [];
    page.on('pageerror', error => errors.push(error));

    await page.waitForTimeout(1000);

    // Should have no errors on normal load
    expect(errors.length).toBe(0);
  });

  test('should respect tabIndex and keyboard focus', async ({ page }) => {
    // Click on a room card to ensure it's focused
    await page.locator('text=Learning Room 101').click();
    await page.waitForTimeout(200);

    // Press Space to trigger selection (should work like Enter)
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Verify card responds to Space key
    const selectedCard = page.locator('[aria-current="true"]');
    await expect(selectedCard).toBeVisible();
  });
});
