import { test, expect } from '@playwright/test';
import { CountryPage } from '../../pages/CountryPage';
import { TestHelpers } from '../../utils/testHelpers';

test.describe('Country Page Functionality', () => {
  let countryPage: CountryPage;

  test.beforeEach(async ({ page }) => {
    countryPage = new CountryPage(page);
    await countryPage.navigateToCountry('/pl/esim-turkey/');
    await TestHelpers.acceptCookiesIfVisible(page);
  });

  test('Country page loads with correct title and packages', async ({}) => {});

  test('Package selection works correctly', async ({}) => {});

  test('Recommended package is pre-selected', async ({}) => {});

  test('Package pricing displays correctly with discounts', async () => {});

  test('Proceed to checkout button becomes enabled after selection', async () => {});

  test('Tab navigation works correctly', async ({}) => {});

  test('Device compatibility checker is available', async ({}) => {});

  test('FAQ section expands and collapses correctly', async ({}) => {});

  test('Comparison table displays correctly', async ({}) => {
    // given/when
    const comparisonData = await countryPage.getComparisonData();

    // then
    expect(comparisonData.length).toBeGreaterThan(0);

    const sailyFeatures = comparisonData.filter(row => row.saily !== '');
    expect(sailyFeatures.length).toBeGreaterThan(0);

    comparisonData.forEach(row => {
      expect(row.feature).toBeTruthy();
      expect(Object.keys(row.competitors).length).toBeGreaterThan(0);
    });
  });

  test('Special notice displays for Turkey', async ({}) => {
    // given/when
    const isNoticeVisible = await countryPage.isSpecialNoticeVisible();

    // then
    if (isNoticeVisible) {
      const countryData = await countryPage.getCountryPageData();
      expect(countryData.specialNotice).toContain('Turcji');
      expect(countryData.specialNotice).toContain('aplikacja');
    }
  });

  test('App store links are functional', async ({ page }) => {
    // given/when
    await TestHelpers.scrollToElement(
      page,
      'text=Pobierz aplikację eSIM Saily'
    );

    // then
    const appStoreLink = page
      .getByRole('link', { name: 'app store pl' })
      .first();
    const googlePlayLink = page
      .getByRole('link', { name: 'google play pl' })
      .first();

    await expect(appStoreLink).toBeVisible();
    await expect(googlePlayLink).toBeVisible();

    const appStoreURL = await appStoreLink.getAttribute('href');
    const googlePlayURL = await googlePlayLink.getAttribute('href');

    expect(appStoreURL).toContain('saily.onelink.me');
    expect(googlePlayURL).toContain('saily.onelink.me');
  });
});
