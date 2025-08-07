import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { TestHelpers } from '../../utils/testHelpers';

test.describe('Visual Snapshot Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
    await TestHelpers.acceptCookiesIfVisible(page);

    // Wait for page to be fully stable
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow animations to settle
  });

  test('Homepage full page snapshot', async ({ page }) => {
    // when - user views the homepage
    await page.waitForLoadState('networkidle');

    // then - page matches baseline screenshot
    await expect(page).toHaveScreenshot('homepage-full.png');
  });

  test('Navigation header snapshot', async ({ page }) => {
    // when - user focuses on navigation area
    const header = page.locator('nav, header').first();
    await header.waitFor({ state: 'visible' });

    // then - navigation matches baseline
    await expect(header).toHaveScreenshot('navigation-header.png');
  });

  test('Footer area snapshot', async ({ page }) => {
    // when - user scrolls to footer
    await TestHelpers.scrollToElement(page, 'footer');
    const footer = page.locator('footer');
    await footer.waitFor({ state: 'visible' });

    // then - footer matches baseline
    await expect(footer).toHaveScreenshot('footer-area.png');
  });

  test('Mobile viewport snapshot', async ({ page }) => {
    // when - user views on mobile device
    await TestHelpers.setMobileViewport(page);
    await page.reload();
    await TestHelpers.acceptCookiesIfVisible(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // then - mobile layout matches baseline
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });

  test('Search modal snapshot', async ({ page }) => {
    // when - user opens search modal
    await homePage.openDestinationSearch();

    // Wait for the actual search modal (not cookie consent)
    const searchModal = page
      .locator(
        '[data-testid="destination-modal"], .search-modal, [role="dialog"]:not([data-testid*="consent"])'
      )
      .first();
    await searchModal.waitFor({ state: 'visible', timeout: 10000 });

    // then - search modal matches baseline
    await expect(searchModal).toHaveScreenshot('search-modal.png');
  });
});
