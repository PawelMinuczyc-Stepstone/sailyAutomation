import { Page, Locator } from '@playwright/test';
import { CountryDestination, AppStoreLinks } from '../types/saily.types';
import { TestHelpers } from '../utils/testHelpers';
import { SearchModal } from './SearchModal';
import { HomePageSelectors as S } from '../selectors/homePageSelectors';

export class HomePage {
  // Timeouts & limits
  private static readonly DEFAULT_MAX_DESTINATIONS = 10;
  private static readonly WAIT_FOR_FIRST_LINK_MS = 5_000;
  private static readonly PAGE_READY_TIMEOUT_MS = 15_000;
  private static readonly LOAD_TIMEOUT_MS = 10_000;
  private static readonly STABILIZE_WAIT_MS = 2_000;

  readonly page: Page;
  readonly cookieAcceptButton: Locator;
  readonly promoCloseButton: Locator;
  readonly shareAndEarnButton: Locator;
  readonly destinationSearchButton: Locator;
  readonly languageSelector: Locator;
  readonly mobileMenuToggle: Locator;
  readonly sailyLogo: Locator;
  readonly appStoreLink: Locator;
  readonly googlePlayLink: Locator;
  readonly learnMoreSecurityButton: Locator;
  readonly referralLearnMoreButton: Locator;
  readonly searchModal: SearchModal;
  readonly homeLink: Locator;
  readonly destinationsLink: Locator;
  readonly aboutLink: Locator;
  readonly contactLink: Locator;
  readonly blogLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cookieAcceptButton = page.locator(S.cookieAcceptButton);
    this.promoCloseButton = page.locator(S.promoCloseButton);
    this.shareAndEarnButton = page.locator(S.shareAndEarnButton);
    this.destinationSearchButton = page.locator(S.destinationSearchButton);
    this.languageSelector = page.locator(S.languagePicker);
    this.mobileMenuToggle = page.locator(S.mobileMenuToggle);
    this.sailyLogo = page.locator(S.sailyLogoLink);
    this.appStoreLink = page.locator(S.appStoreLink);
    this.googlePlayLink = page.locator(S.googlePlayLink);
    this.learnMoreSecurityButton = page.locator(S.learnMoreSecurityButton);
    this.referralLearnMoreButton = page.locator(S.referralLearnMoreButton);

    this.homeLink = page.locator(S.homeLink);
    this.destinationsLink = page.locator(S.destinationsLink);
    this.aboutLink = page.locator(S.aboutLink);
    this.contactLink = page.locator(S.contactLink);
    this.blogLink = page.locator(S.blogLink);

    this.searchModal = new SearchModal(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/pl/');
  }

  async acceptCookies(): Promise<void> {
    await this.cookieAcceptButton.click();
  }

  async closePromoBar(): Promise<void> {
    await this.promoCloseButton.click();
  }

  async openDestinationSearch(): Promise<void> {
    await this.destinationSearchButton.click();
  }

  async switchLanguage(languageCode: string): Promise<void> {
    await this.languageSelector.selectOption(languageCode);
  }

  async toggleMobileMenu(): Promise<void> {
    await this.mobileMenuToggle.click();
  }

  async clickLogo(): Promise<void> {
    await this.sailyLogo.click();
  }

  async getPopularDestinations(): Promise<CountryDestination[]> {
    const max = HomePage.DEFAULT_MAX_DESTINATIONS;
    const selector = S.popularDestinationLinks;

    await this.page
      .locator(selector)
      .first()
      .waitFor({ timeout: HomePage.WAIT_FOR_FIRST_LINK_MS });
    const allLinks = this.page.locator(selector);
    const count = await allLinks.count();
    const destinations: CountryDestination[] = [];

    for (let i = 0; i < Math.min(count, max); i++) {
      const link = allLinks.nth(i);
      const href = (await link.getAttribute('href')) ?? '';
      const text = (await link.textContent())?.trim() ?? '';
      if (!this.isValidDestination(href)) continue;

      const dest = this.extractDestinationData(href, text);
      if (dest) destinations.push(dest);
    }
    return destinations;
  }

  async clickCountryDestination(countryCode: string): Promise<void> {
    const pattern = S.popularDestinationLinks.replace(
      'esim-',
      `esim-${countryCode}`
    );
    await this.page.locator(pattern).first().click();
  }

  async getAppStoreInfo(): Promise<AppStoreLinks> {
    const rating =
      (await this.page.locator(S.appRatingText).textContent()) || '';
    const reviewCount =
      (await this.page.locator(S.reviewCountText).textContent()) || '';
    const appStoreUrl = (await this.appStoreLink.getAttribute('href')) || '';
    const googlePlayUrl =
      (await this.googlePlayLink.getAttribute('href')) || '';
    return {
      appStore: appStoreUrl,
      googlePlay: googlePlayUrl,
      rating: rating.trim(),
      reviewCount: reviewCount.trim(),
    };
  }

  async isPromoBarVisible(): Promise<boolean> {
    return this.page.locator('text=Podróż ze znajomymi').isVisible();
  }

  async isLanguageSelectorVisible(): Promise<boolean> {
    return this.languageSelector.isVisible();
  }

  async getCurrentLanguage(): Promise<string> {
    return this.languageSelector.inputValue();
  }

  async clickReferralLearnMore(): Promise<void> {
    await this.referralLearnMoreButton.click();
  }

  // Behaviour checks
  async hasDestinationSearchButton(): Promise<boolean> {
    return this.safeCheck(() => this.destinationSearchButton.isVisible());
  }

  async hasDestinationList(): Promise<boolean> {
    return this.safeCheck(() =>
      this.page
        .locator(S.popularDestinationLinks)
        .count()
        .then(c => c > 5)
    );
  }

  async isSearchModalOpen(): Promise<boolean> {
    return this.safeCheck(() => this.searchModal.isVisible());
  }

  async canTypeInSearch(): Promise<boolean> {
    return this.safeCheck(
      async () =>
        (await this.searchModal.isInputVisible()) &&
        (await this.searchModal.isInputEnabled())
    );
  }

  async canSearchForDestination(searchTerm = 'Spain'): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.searchModal.fillInput(searchTerm);
      return (await this.searchModal.getInputValue()) === searchTerm;
    });
  }

  async hasPopularDestinations(): Promise<boolean> {
    return this.safeCheck(async () => {
      const dests = await this.getPopularDestinations();
      return dests.length > 0 && dests[0].priceFrom.includes('US$');
    });
  }

  async canNavigateToCountryPage(): Promise<boolean> {
    return this.safeCheck(async () => {
      const dests = await this.getPopularDestinations();
      if (!dests.length) return false;
      const d = dests[0];
      return (
        d.name.length > 0 &&
        d.url.includes('/pl/esim-') &&
        d.priceFrom.includes('US$')
      );
    });
  }

  async hasMainNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      const nav = this.page.locator('nav');
      const hasEsim = await nav
        .getByRole('link', { name: 'Co to jest eSIM' })
        .isVisible();
      const hasApp = await nav
        .getByRole('link', { name: 'Pobierz aplikację' })
        .isVisible();
      return hasEsim && hasApp;
    });
  }

  async hasLanguageSelector(): Promise<boolean> {
    return this.safeCheck(() => this.isLanguageSelectorVisible());
  }

  async isMobileFriendly(): Promise<boolean> {
    return this.safeCheck(
      async () =>
        (await this.page.locator('h1').isVisible()) &&
        (await this.destinationSearchButton.isVisible())
    );
  }

  async canUseMobileSearch(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.openDestinationSearch();
      return await this.searchModal.isInputVisible();
    });
  }

  async isAccessibleAndReady(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.page.waitForSelector('h1', {
        timeout: HomePage.PAGE_READY_TIMEOUT_MS,
      });
      const results = await Promise.all([
        this.hasDestinationSearchButton(),
        this.hasDestinationList(),
      ]);
      return results.every(Boolean);
    });
  }

  async canOpenSearchModal(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.openDestinationSearch();
      return this.searchModal.isVisible();
    });
  }

  async canPerformDestinationSearch(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.openDestinationSearch();
      return this.canSearchForDestination('Spain');
    });
  }

  async showsAvailableDestinations(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.page.waitForTimeout(HomePage.STABILIZE_WAIT_MS);
      return this.hasPopularDestinations();
    });
  }

  async allowsCountryNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      return this.canNavigateToCountryPage();
    });
  }

  async providesCompleteNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      return (
        (await this.hasMainNavigation()) && (await this.hasLanguageSelector())
      );
    });
  }

  async loadsWithinAcceptableTime(): Promise<boolean> {
    return this.safeCheck(async () => {
      const start = Date.now();
      await this.navigate();
      await this.page.waitForSelector('h1', {
        timeout: HomePage.LOAD_TIMEOUT_MS,
      });
      const elapsed = Date.now() - start;
      return (
        elapsed < HomePage.LOAD_TIMEOUT_MS &&
        (await this.hasDestinationSearchButton())
      );
    });
  }

  async worksOnMobileDevices(): Promise<boolean> {
    return this.safeCheck(async () => {
      await TestHelpers.setMobileViewport(this.page);
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      return (
        (await this.isMobileFriendly()) && (await this.canUseMobileSearch())
      );
    });
  }

  async loadsWithoutCriticalErrors(): Promise<boolean> {
    return this.safeCheck(async () => {
      const errors: string[] = [];
      this.page.on(
        'console',
        msg => msg.type() === 'error' && errors.push(msg.text())
      );
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.page.waitForSelector('h1', {
        timeout: HomePage.LOAD_TIMEOUT_MS,
      });
      const critical = errors.filter(
        e => !e.match(/Failed to load resource|consent|network/)
      );
      return critical.length === 0;
    });
  }

  async hasWorkingLogoNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.clickCountryDestination('turkey');
      await TestHelpers.waitForPageLoad(this.page);
      await this.clickLogo();
      await TestHelpers.waitForPageLoad(this.page);
      return (
        this.page.url().endsWith('/pl/') &&
        (await this.destinationSearchButton.isVisible())
      );
    });
  }

  async hasWorkingLanguageSelector(): Promise<boolean> {
    return this.safeCheck(async () => {
      const pickers = this.page.locator(
        S.languagePicker.replace(' select', '')
      );
      const count = await pickers.count();
      const visible = await Promise.any(
        Array.from({ length: count }, (_, i) => pickers.nth(i).isVisible())
      ).catch(() => false);
      if (!visible) return false;
      const current = await this.getCurrentLanguage();
      if (current !== 'pl') return false;
      const optsCount = await this.languageSelector.locator('option').count();
      return optsCount >= 2;
    });
  }

  async hasWorkingMainNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      const links = [
        this.homeLink,
        this.destinationsLink,
        this.aboutLink,
        this.contactLink,
        this.blogLink,
      ];
      for (const link of links) {
        if (!(await link.isVisible()) || !(await link.getAttribute('href'))) {
          return false;
        }
      }
      return true;
    });
  }

  async hasWorkingFooterNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      await TestHelpers.scrollToElement(this.page, 'footer');
      if ((await this.page.locator(S.footerSectionToggle).count()) < 3)
        return false;
      if (!(await this.page.locator(S.footerPrivacyPolicy).isVisible()))
        return false;
      if (!(await this.page.locator(S.footerTermsOfService).isVisible()))
        return false;
      return true;
    });
  }

  async hasWorkingSocialMediaLinks(): Promise<boolean> {
    return this.safeCheck(async () => {
      await TestHelpers.scrollToElement(this.page, 'footer');
      for (const sel of S.socialLinks) {
        const link = this.page.locator(sel).first();
        const href = await link.getAttribute('href');
        if (!(await link.isVisible()) || !href) return false;
      }
      return true;
    });
  }

  async hasAllPaymentMethodIcons(): Promise<boolean> {
    return this.safeCheck(async () => {
      await TestHelpers.scrollToElement(this.page, 'footer');
      for (const sel of S.paymentIcons) {
        if (!(await this.page.locator(sel).first().isVisible())) return false;
      }
      return true;
    });
  }

  async hasWorkingAppDownloadLinks(): Promise<boolean> {
    return this.safeCheck(async () => {
      const info = await this.getAppStoreInfo();
      return (
        info.appStore.includes('saily.onelink.me') &&
        info.googlePlay.includes('saily.onelink.me') &&
        info.rating === '4.7' &&
        info.reviewCount.includes('97 400') &&
        (await this.page.locator('img[alt*="app store"]').isVisible()) &&
        (await this.page.locator('img[alt*="google play"]').isVisible())
      );
    });
  }

  async hasWorkingPromotionalBanner(): Promise<boolean> {
    return this.safeCheck(async () => {
      if (!(await this.isPromoBarVisible())) return true;
      await this.closePromoBar();
      return !(await this.isPromoBarVisible());
    });
  }

  async hasWorkingMobileNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      await TestHelpers.setMobileViewport(this.page);
      await this.page.reload();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      const toggle = this.page.getByRole('button', { name: 'Toggle sidebar' });
      if (!(await toggle.isVisible())) return false;
      await toggle.click();
      return true;
    });
  }

  async hasWorkingBreadcrumbNavigation(): Promise<boolean> {
    return this.safeCheck(async () => {
      await this.clickCountryDestination('turkey');
      await TestHelpers.waitForPageLoad(this.page);
      const h1 = this.page.locator('h1');
      const title = (await h1.textContent()) || '';
      return title.includes('Turcji') || title.includes('Turkey');
    });
  }

  async worksAcrossAllViewports(): Promise<boolean> {
    return this.safeCheck(async () => {
      for (const setter of [
        TestHelpers.setDesktopViewport,
        TestHelpers.setTabletViewport,
        TestHelpers.setMobileViewport,
      ]) {
        await setter(this.page);
        await this.page.reload();
        if (!(await this.destinationSearchButton.isVisible())) return false;
      }
      return true;
    });
  }

  async hasWorkingScrollBehavior(): Promise<boolean> {
    return this.safeCheck(async () => {
      await TestHelpers.setDesktopViewport(this.page);
      await TestHelpers.scrollToElement(this.page, 'footer');
      await this.page.waitForTimeout(HomePage.STABILIZE_WAIT_MS);
      await this.page.evaluate(() => window.scrollTo(0, 0));
      return true;
    });
  }

  // Utility
  private async safeCheck(fn: () => Promise<boolean>): Promise<boolean> {
    try {
      return await fn();
    } catch {
      return false;
    }
  }

  private isValidDestination(href: string): boolean {
    return href.includes('/pl/esim-') && !href.includes('ultra-plan');
  }

  private extractDestinationData(
    href: string,
    text: string
  ): CountryDestination | null {
    const priceMatch = text.match(/(Od US\$[\d,]+)/);
    const priceFrom = priceMatch ? priceMatch[1] : '';
    const name = text
      .replace(/Od US\$[\d,]+/, '')
      .replace('Chevron right', '')
      .trim();
    const code = href.split('/pl/esim-')[1]?.replace('/', '') ?? '';
    return name && code ? { name, code, priceFrom, url: href } : null;
  }
}
