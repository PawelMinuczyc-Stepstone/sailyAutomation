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

  test('Country page loads with correct title and packages', async ({ page }) => {
    // given/when
    await TestHelpers.waitForPageLoad(page);
    
    // then
    await expect(page).toHaveTitle(/Pakiety eSIM na Turcję/);
    await TestHelpers.validateElementVisible(page, 'h1');
    await TestHelpers.validateElementVisible(page, 'input[type="radio"]');
    
    const packages = await countryPage.getAllPackages();
    expect(packages.length).toBeGreaterThanOrEqual(5);
    
    packages.forEach(pkg => {
      expect(pkg.dataAmount).toBeTruthy();
      expect(pkg.duration).toBeTruthy();
      expect(TestHelpers.isValidPrice(pkg.price)).toBe(true);
      expect(pkg.cashbackPercentage).toBeGreaterThan(0);
    });
  });

  test('Package selection works correctly', async ({ page }) => {
    // given
    expect(await countryPage.isPackageSelected()).toBe(false);
    
    // when
    await countryPage.selectPackage(0);
    
    // then
    expect(await countryPage.isPackageSelected()).toBe(true);
    
    const selectedPackage = await countryPage.getSelectedPackage();
    expect(selectedPackage).toBeTruthy();
    expect(selectedPackage?.dataAmount).toBeTruthy();
  });

  test('Recommended package is pre-selected', async ({ page }) => {
    // given/when
    await TestHelpers.waitForPageLoad(page);
    
    // then
    const packages = await countryPage.getAllPackages();
    const recommendedPackage = packages.find(pkg => pkg.isRecommended);
    expect(recommendedPackage).toBeTruthy();
    
    const selectedPackage = await countryPage.getSelectedPackage();
    expect(selectedPackage?.isRecommended).toBe(true);
  });

  test('Package pricing displays correctly with discounts', async ({ page }) => {
    // given/when
    const packages = await countryPage.getAllPackages();
    
    // then
    const discountedPackages = packages.filter(pkg => pkg.discountPercentage);
    expect(discountedPackages.length).toBeGreaterThan(0);
    
    discountedPackages.forEach(pkg => {
      expect(pkg.originalPrice).toBeTruthy();
      expect(TestHelpers.isValidPrice(pkg.originalPrice!)).toBe(true);
      expect(TestHelpers.formatPrice(pkg.price)).toBeLessThan(TestHelpers.formatPrice(pkg.originalPrice!));
    });
  });

  test('Proceed to checkout button becomes enabled after selection', async ({ page }) => {
    // given
    await countryPage.selectPackage(1);
    
    // when
    const isEnabled = await countryPage.isProceedToCheckoutEnabled();
    
    // then
    expect(isEnabled).toBe(true);
  });

  test('Tab navigation works correctly', async ({ page }) => {
    // given/when
    await countryPage.selectFeaturesTab();
    
    // then
    const featuresContent = await countryPage.getTabContent();
    expect(featuresContent).toContain('US$');
    
    // when
    await countryPage.selectDescriptionTab();
    
    // then
    const descriptionContent = await countryPage.getTabContent();
    expect(descriptionContent.length).toBeGreaterThan(0);
    
    // when
    await countryPage.selectTechnicalTab();
    
    // then
    const technicalContent = await countryPage.getTabContent();
    expect(technicalContent.length).toBeGreaterThan(0);
  });

  test('Device compatibility checker is available', async ({ page }) => {
    // given/when
    await TestHelpers.validateElementVisible(page, 'button:has-text("Sprawdź kompatybilność urządzenia")');
    
    // then
    const compatibilityButton = countryPage.deviceCompatibilityButton;
    await expect(compatibilityButton).toBeVisible();
    await expect(compatibilityButton).toBeEnabled();
  });

  test('FAQ section expands and collapses correctly', async ({ page }) => {
    // given
    const faqItems = await countryPage.getFAQItems();
    expect(faqItems.length).toBeGreaterThan(0);
    
    // when
    const firstQuestion = faqItems[0].question;
    await countryPage.expandFAQ(firstQuestion);
    
    // then
    await page.waitForTimeout(500);
    const updatedFAQItems = await countryPage.getFAQItems();
    const expandedItem = updatedFAQItems.find(item => item.question === firstQuestion);
    expect(expandedItem?.isExpanded).toBe(true);
    expect(expandedItem?.answer.length).toBeGreaterThan(0);
  });

  test('Comparison table displays correctly', async ({ page }) => {
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

  test('Special notice displays for Turkey', async ({ page }) => {
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
    await TestHelpers.scrollToElement(page, 'text=Pobierz aplikację eSIM Saily');
    
    // then
    const appStoreLink = page.getByRole('link', { name: 'app store pl' }).first();
    const googlePlayLink = page.getByRole('link', { name: 'google play pl' }).first();
    
    await expect(appStoreLink).toBeVisible();
    await expect(googlePlayLink).toBeVisible();
    
    const appStoreURL = await appStoreLink.getAttribute('href');
    const googlePlayURL = await googlePlayLink.getAttribute('href');
    
    expect(appStoreURL).toContain('saily.onelink.me');
    expect(googlePlayURL).toContain('saily.onelink.me');
  });

  test('Page works correctly on mobile viewport', async ({ page }) => {
    // given
    await TestHelpers.setMobileViewport(page);
    await page.reload();
    await TestHelpers.acceptCookiesIfVisible(page);
    
    // when
    await TestHelpers.waitForPageLoad(page);
    
    // then
    await TestHelpers.validateElementVisible(page, 'h1');
    await TestHelpers.validateElementVisible(page, 'input[type="radio"]');
    
    // when
    await countryPage.selectPackage(0);
    
    // then
    expect(await countryPage.isPackageSelected()).toBe(true);
    expect(await countryPage.isProceedToCheckoutEnabled()).toBe(true);
  });

  test('Country page data extraction works correctly', async ({ page }) => {
    // given/when
    const countryData = await countryPage.getCountryPageData();
    
    // then
    expect(countryData.countryName).toBe('Turcji');
    expect(countryData.countryCode).toBe('turkey');
    expect(countryData.packages.length).toBeGreaterThanOrEqual(5);
    expect(countryData.features.length).toBeGreaterThan(0);
    expect(countryData.description.length).toBeGreaterThan(0);
    expect(countryData.technicalSpecs.length).toBeGreaterThan(0);
  });

  test('Package selection by data amount works', async ({ page }) => {
    // given
    const packages = await countryPage.getAllPackages();
    const firstPackage = packages[0];
    
    // when
    await countryPage.selectPackageByDataAmount(firstPackage.dataAmount);
    
    // then
    const selectedPackage = await countryPage.getSelectedPackage();
    expect(selectedPackage?.dataAmount).toBe(firstPackage.dataAmount);
  });
}); 