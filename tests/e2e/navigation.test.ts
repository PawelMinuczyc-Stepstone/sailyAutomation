import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { TestHelpers } from '../../utils/testHelpers';

test.describe('Navigation and UI Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.acceptCookies();
  });

  test('Logo click returns to homepage', async ({ page }) => {
    // given
    await homePage.clickCountryDestination('TR');
    await TestHelpers.waitForPageLoad(page);
    
    // when
    await homePage.clickLogo();
    await TestHelpers.waitForPageLoad(page);
    
    // then
    await TestHelpers.validateURL(page, /saily\.com\/pl\/?$/);
    await TestHelpers.validateElementVisible(page, '[data-testid="destination-modal-button"]');
  });

  test('Language selector displays all available languages', async ({ page }) => {
    // given/when
    const languageSelector = homePage.languageSelector;
    
    // then
    await expect(languageSelector).toBeVisible();
    
    const currentLanguage = await homePage.getCurrentLanguage();
    expect(currentLanguage).toBe('pl');
    
    const languageOptions = page.locator('option');
    const optionCount = await languageOptions.count();
    expect(optionCount).toBe(14);
    
    const expectedLanguages = [
      'English', 'Deutsch', 'Español', 'Français', '日本語', 
      'Italiano', 'Nederlands', '繁體中文（台灣）', '简体中文', 
      'Português', 'Polski', 'Čeština', 'Lietuvių', '‪한국어‬'
    ];
    
    for (const language of expectedLanguages) {
      await expect(page.locator(`option:has-text("${language}")`)).toBeVisible();
    }
  });

  test('Main navigation links are functional', async ({ page }) => {
    // given
    const navigationLinks = [
      { text: 'Co to jest eSIM', expectedURL: '/pl/what-is-esim/' },
      { text: 'Pobierz aplikację', expectedURL: '/pl/download-esim-app/' },
      { text: 'Pomoc', expectedURL: 'support.saily.com' }
    ];
    
    for (const link of navigationLinks) {
      // when
      const navLink = page.getByRole('link', { name: link.text });
      
      // then
      await expect(navLink).toBeVisible();
      
      const href = await navLink.getAttribute('href');
      expect(href).toContain(link.expectedURL);
    }
  });

  test('Footer links navigation works correctly', async ({ page }) => {
    // given
    await TestHelpers.scrollToElement(page, 'footer');
    
    // when
    const footerSections = [
      'Popularne cele podróży',
      'Saily',
      'eSIM',
      'Pomoc',
      'Obserwuj nas'
    ];
    
    // then
    for (const section of footerSections) {
      const sectionButton = page.getByRole('button', { name: section });
      await expect(sectionButton).toBeVisible();
    }
    
    const legalLinks = [
      { text: 'Polityka prywatności', expectedURL: '/pl/legal/privacy-policy/' },
      { text: 'Warunki świadczenia usług', expectedURL: '/pl/legal/terms-of-service/' }
    ];
    
    for (const link of legalLinks) {
      const footerLink = page.getByRole('link', { name: link.text });
      await expect(footerLink).toBeVisible();
      
      const href = await footerLink.getAttribute('href');
      expect(href).toContain(link.expectedURL);
    }
  });

  test('Social media links are present in footer', async ({ page }) => {
    // given
    await TestHelpers.scrollToElement(page, 'footer');
    
    // when
    const socialLinks = [
      { platform: 'Facebook', expectedURL: 'facebook.com/sailyservice' },
      { platform: 'Twitter (teraz X)', expectedURL: 'x.com/sailyworld' },
      { platform: 'LinkedIn', expectedURL: 'linkedin.com/company/sailyworld' },
      { platform: 'YouTube', expectedURL: 'youtube.com/@saily_service' },
      { platform: 'Instagram', expectedURL: 'instagram.com/sailyworld' },
      { platform: 'Reddit', expectedURL: 'reddit.com/r/saily' }
    ];
    
    // then
    for (const social of socialLinks) {
      const socialLink = page.getByRole('link', { name: social.platform });
      await expect(socialLink).toBeVisible();
      
      const href = await socialLink.getAttribute('href');
      expect(href).toContain(social.expectedURL);
    }
  });

  test('Payment method icons display correctly', async ({ page }) => {
    // given
    await TestHelpers.scrollToElement(page, 'footer');
    
    // when
    const paymentMethods = [
      'apple pay', 'google pay', 'visa', 'mastercard', 
      'amex', 'discover', 'union pay', 'jcb'
    ];
    
    // then
    for (const method of paymentMethods) {
      const paymentIcon = page.locator(`img[alt*="${method}"], img[src*="${method}"]`);
      await expect(paymentIcon).toBeVisible();
    }
  });

  test('App download links work correctly', async ({ page }) => {
    // given
    const appStoreInfo = await homePage.getAppStoreInfo();
    
    // when/then
    expect(appStoreInfo.appStore).toContain('saily.onelink.me');
    expect(appStoreInfo.googlePlay).toContain('saily.onelink.me');
    expect(appStoreInfo.rating).toBe('4.7');
    expect(appStoreInfo.reviewCount).toContain('97 400');
    
    await TestHelpers.validateElementVisible(page, 'img[alt*="app store"]');
    await TestHelpers.validateElementVisible(page, 'img[alt*="google play"]');
  });

  test('Promotional banner displays and functions correctly', async ({ page }) => {
    // given
    const isPromoVisible = await homePage.isPromoBarVisible();
    
    if (isPromoVisible) {
      // when
      const promoOffer = await homePage.getPromoOfferDetails();
      
      // then
      expect(promoOffer.title).toBe('Letnia promocja');
      expect(promoOffer.discountPercentage).toBe(5);
      expect(promoOffer.cashbackPercentage).toBe(5);
      expect(promoOffer.termsUrl).toContain('/pl/legal/summer-giveaway/');
      
      // when
      await homePage.closePromoBar();
      
      // then
      const isPromoHidden = !(await homePage.isPromoBarVisible());
      expect(isPromoHidden).toBe(true);
    }
  });

  test('Mobile navigation menu works correctly', async ({ page }) => {
    // given
    await TestHelpers.setMobileViewport(page);
    await page.reload();
    await homePage.acceptCookies();
    
    // when
    const mobileMenuToggle = page.getByRole('button', { name: 'Toggle sidebar' });
    
    // then
    await expect(mobileMenuToggle).toBeVisible();
    
    await mobileMenuToggle.click();
    await page.waitForTimeout(500);
  });

  test('Breadcrumb navigation works on country pages', async ({ page }) => {
    // given
    await homePage.clickCountryDestination('TR');
    await TestHelpers.waitForPageLoad(page);
    
    // when
    const currentURL = page.url();
    
    // then
    expect(currentURL).toContain('/pl/esim-turkey/');
    await TestHelpers.validateElementVisible(page, 'h1');
    
    const pageTitle = await page.locator('h1').textContent();
    expect(pageTitle).toContain('Turcji');
  });

  test('Responsive design works across different viewports', async ({ page }) => {
    // Desktop
    await TestHelpers.setDesktopViewport(page);
    await page.reload();
    await TestHelpers.validateElementVisible(page, '[data-testid="destination-modal-button"]');
    
    // Tablet
    await TestHelpers.setTabletViewport(page);
    await page.reload();
    await TestHelpers.validateElementVisible(page, '[data-testid="destination-modal-button"]');
    
    // Mobile
    await TestHelpers.setMobileViewport(page);
    await page.reload();
    await TestHelpers.validateElementVisible(page, '[data-testid="destination-modal-button"]');
    await TestHelpers.validateElementVisible(page, 'button[aria-haspopup="menu"]');
  });

  test('Page scroll behavior works correctly', async ({ page }) => {
    // given
    await TestHelpers.setDesktopViewport(page);
    
    // when
    await TestHelpers.scrollToElement(page, 'footer');
    
    // then
    const footer = page.locator('footer');
    await expect(footer).toBeInViewport();
    
    // when
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // then
    const header = page.locator('header, nav').first();
    await expect(header).toBeInViewport();
  });

  test('Popular destinations on homepage display correctly', async ({ page }) => {
    // given/when
    const destinations = await homePage.getPopularDestinations();
    
    // then
    expect(destinations.length).toBeGreaterThanOrEqual(8);
    
    destinations.forEach(destination => {
      expect(destination.name).toBeTruthy();
      expect(TestHelpers.isValidPrice(destination.priceFrom)).toBe(true);
      expect(destination.url).toContain('/pl/esim-');
      expect(destination.code).toBeTruthy();
    });
    
    const expectedCountries = ['Turkey', 'United States', 'Thailand', 'Malaysia'];
    const foundCountries = destinations.map(d => d.name);
    
    for (const country of expectedCountries) {
      const hasCountry = foundCountries.some(name => 
        name.toLowerCase().includes(country.toLowerCase()) ||
        country.toLowerCase().includes(name.toLowerCase())
      );
      expect(hasCountry).toBe(true);
    }
  });
}); 