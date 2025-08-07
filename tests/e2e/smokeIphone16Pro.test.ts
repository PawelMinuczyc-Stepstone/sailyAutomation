import { test, expect, devices } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { TestHelpers } from '../../utils/testHelpers';

test.use(devices['iPhone 11']);

test.describe('Smoke Tests - Mobile - Critical Path Validation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('User can access the homepage and see essential content', async () => {
    const isAccessible = await homePage.isAccessibleAndReady();
    await TestHelpers.expectTrue(
      isAccessible,
      'Homepage is accessible and ready'
    );
  });

  test('User can open destination search modal', async () => {
    const canOpenSearch = await homePage.canOpenSearchModal();
    await TestHelpers.expectTrue(canOpenSearch, 'Search modal can be opened');
  });

  test('User can search for destinations', async () => {
    const canSearch = await homePage.canPerformDestinationSearch();
    await TestHelpers.expectTrue(canSearch, 'Search works');
  });

  test('User can see available destinations', async () => {
    const hasDestinations = await homePage.showsAvailableDestinations();
    await TestHelpers.expectTrue(hasDestinations, 'Destinations are available');
  });

  test('User can navigate to a country page', async () => {
    const canNavigateToCountry = await homePage.allowsCountryNavigation();
    await TestHelpers.expectTrue(
      canNavigateToCountry,
      'Country navigation is available'
    );
  });

  test('Page loads within acceptable time', async () => {
    const loadsQuickly = await homePage.loadsWithinAcceptableTime();
    await TestHelpers.expectTrue(loadsQuickly, 'Page loads quickly');
  });

  test('Page works on mobile devices', async () => {
    const worksOnMobile = await homePage.worksOnMobileDevices();
    await TestHelpers.expectTrue(
      worksOnMobile,
      'Core functionality works on mobile'
    );
  });

  test('Page loads without critical JavaScript errors', async () => {
    const loadsWithoutErrors = await homePage.loadsWithoutCriticalErrors();
    await TestHelpers.expectTrue(
      loadsWithoutErrors,
      'Page loads without critical errors'
    );
  });

  test('User can navigate to a country page via link', async ({ page }) => {
    await page.goto('https://saily.com');
    await TestHelpers.acceptCookiesIfVisible(page);

    const countryLink = page
      .locator('a[href*="/country/"], a[href*="/destinations/"]')
      .first();
    await countryLink.click();

    await expect(page).toHaveURL(/\/country\/|\/destinations\//);
    await expect(
      page.locator('h1, [data-testid="country-title"]')
    ).toBeVisible();
  });
});
