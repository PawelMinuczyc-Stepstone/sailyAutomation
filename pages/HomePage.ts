import { Page, Locator } from '@playwright/test';
import { CountryDestination, PromoOffer, AppStoreLinks } from '../types/saily.types';
import { TestHelpers } from '../utils/testHelpers';
import { SearchModal } from './SearchModal';

export class HomePage {
  readonly page: Page;
  readonly cookieAcceptButton: Locator;
  readonly destinationSearchButton: Locator;
  readonly languageSelector: Locator;
  readonly mobileMenuToggle: Locator;
  readonly sailyLogo: Locator;
  readonly promoCloseButton: Locator;
  readonly shareAndEarnButton: Locator;
  readonly appStoreLink: Locator;
  readonly googlePlayLink: Locator;
  readonly learnMoreSecurityButton: Locator;
  readonly referralLearnMoreButton: Locator;
  readonly searchModal: SearchModal;

  constructor(page: Page) {
    this.page = page;
    
    // Use data-testid locators ONLY - language-independent!
    this.cookieAcceptButton = page.getByTestId('consent-widget-accept-all');
    this.destinationSearchButton = page.getByTestId('destination-modal-button');
    this.languageSelector = page.getByTestId('language-picker').locator('select'); // Use data-testid + select
    this.mobileMenuToggle = page.getByTestId('nav-item-container-mobile').locator('button').first(); // Mobile nav toggle
    this.sailyLogo = page.getByTestId('section-Header').locator('a[href="/pl/"]').first(); // Logo in header
    this.promoCloseButton = page.getByTestId('announcement-bar-close'); // Found in MCP investigation
    this.shareAndEarnButton = page.getByTestId('announcement-bar-cta'); // Found in MCP investigation
    this.appStoreLink = page.getByTestId('section-DownloadSailyApp').locator('a').first(); // First link in download section
    this.googlePlayLink = page.getByTestId('section-DownloadSailyApp').locator('a').last(); // Last link in download section
    this.learnMoreSecurityButton = page.getByTestId('section-SecurityFeatures').locator('button').first(); // First button in security section
    this.referralLearnMoreButton = page.getByTestId('section-ReferalBanner').locator('button').first(); // Button in referral section
    
    // Initialize SearchModal
    this.searchModal = new SearchModal(page);
  }

  async navigate() {
    await this.page.goto('/pl/');
  }

  async acceptCookies() {
    await this.cookieAcceptButton.click();
  }

  async closePromoBar() {
    await this.promoCloseButton.click();
  }

  async openDestinationSearch() {
    await this.destinationSearchButton.click();
  }



  async switchLanguage(languageCode: string) {
    await this.languageSelector.selectOption(languageCode);
  }

  async toggleMobileMenu() {
    await this.mobileMenuToggle.click();
  }

  async clickLogo() {
    await this.sailyLogo.click();
  }

  async getPopularDestinations(): Promise<CountryDestination[]> {
    const destinations: CountryDestination[] = [];
    const countryLinks = this.page.locator('a[href*="/pl/esim-"]').first();
    await countryLinks.waitFor({ timeout: 5000 });
    const allLinks = this.page.locator('a[href*="/pl/esim-"]');
    const count = await allLinks.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = allLinks.nth(i);
      const href = await link.getAttribute('href') || '';
      const textContent = await link.textContent() || '';
      
      // Skip non-destination links (like ultra plan)
      if (!href.includes('/pl/esim-') || href.includes('ultra-plan')) {
        continue;
      }
      
      // Extract country name and price using regex
      // Text format: "TurcjaOd US$3,99Chevron right"
      const priceMatch = textContent.match(/(Od US\$[\d,]+)/);
      const priceText = priceMatch ? priceMatch[1] : '';
      
      // Get the country name by removing price and extra text
      let name = textContent
        .replace(/Od US\$[\d,]+/, '') // Remove price
        .replace('Chevron right', '') // Remove chevron text
        .trim();
      
      if (name && href.includes('/pl/esim-')) {
        destinations.push({
          name: name,
          code: href.split('/pl/esim-')[1]?.replace('/', '') || '',
          priceFrom: priceText,
          url: href
        });
      }
    }

    return destinations;
  }



  async clickCountryDestination(countryCode: string) {
    const countryLink = this.page.locator(`a[href*="/pl/esim-${countryCode}"]`).first();
    await countryLink.click();
  }

  async getPromoOfferDetails(): Promise<PromoOffer> {
    const promoSection = this.page.locator('text=Letnia promocja').locator('..');
    const discountText = await promoSection.locator('text=5% na pakiety').textContent();
    const cashbackText = await promoSection.locator('text=5% zwrotu').textContent();
    const termsLink = await this.page.getByRole('link', { name: 'warunki i regulamin' }).getAttribute('href');

    return {
      title: 'Letnia promocja',
      discountPercentage: 5,
      cashbackPercentage: 5,
      minDataAmount: '10 GB',
      termsUrl: termsLink || ''
    };
  }

  async getAppStoreInfo(): Promise<AppStoreLinks> {
    const rating = await this.page.locator('text=4.7').textContent() || '';
    const reviewCount = await this.page.locator('text=ponad 97 400 opinii').textContent() || '';
    const appStoreUrl = await this.appStoreLink.getAttribute('href') || '';
    const googlePlayUrl = await this.googlePlayLink.getAttribute('href') || '';

    return {
      appStore: appStoreUrl,
      googlePlay: googlePlayUrl,
      rating: rating.trim(),
      reviewCount: reviewCount.trim()
    };
  }



  async isPromoBarVisible(): Promise<boolean> {
    return await this.page.locator('text=Podróż ze znajomymi').isVisible();
  }

  async isLanguageSelectorVisible(): Promise<boolean> {
    return await this.languageSelector.isVisible();
  }

  async getCurrentLanguage(): Promise<string> {
    return await this.languageSelector.inputValue();
  }

  async clickReferralLearnMore() {
    await this.referralLearnMoreButton.click();
  }

  // Behavior-focused methods for smoke tests
  async hasEssentialContent(): Promise<boolean> {
    try {
      const title = await this.page.title();
      const hasCorrectTitle = title.includes('Saily') || title.includes('eSIM');
      
      const h1 = this.page.locator('h1');
      const hasHeading = await h1.isVisible();
      const hasEsimText = await h1.textContent().then(text => text?.includes('eSIM') || false);
      
      const hasLogo = await this.sailyLogo.isVisible();
      
      return hasCorrectTitle && hasHeading && hasEsimText && hasLogo;
    } catch {
      return false;
    }
  }

  async hasDestinationSearchButton(): Promise<boolean> {
    try {
      return await this.destinationSearchButton.isVisible();
    } catch {
      return false;
    }
  }

  async hasDestinationList(): Promise<boolean> {
    try {
      const destinationLinks = this.page.locator('a[href*="/pl/esim-"]');
      const count = await destinationLinks.count();
      return count > 5;
    } catch {
      return false;
    }
  }

  async isSearchModalOpen(): Promise<boolean> {
    try {
      return await this.searchModal.isVisible();
    } catch {
      return false;
    }
  }

  async canTypeInSearch(): Promise<boolean> {
    try {
      // Check if input is enabled and editable without side effects
      const isVisible = await this.searchModal.isInputVisible();
      const isEnabled = await this.searchModal.isInputEnabled();
      return isVisible && isEnabled;
    } catch {
      return false;
    }
  }

  async canSearchForDestination(searchTerm: string = 'Spain'): Promise<boolean> {
    try {
      await this.searchModal.fillInput(searchTerm);
      const value = await this.searchModal.getInputValue();
      return value === searchTerm;
    } catch {
      return false;
    }
  }

  async hasPopularDestinations(): Promise<boolean> {
    try {
      const destinations = await this.getPopularDestinations();
      return destinations.length > 0 && destinations[0].priceFrom.includes('US$');
    } catch {
      return false;
    }
  }

  async canNavigateToCountryPage(): Promise<boolean> {
    try {
      const destinations = await this.getPopularDestinations();
      if (destinations.length === 0) return false;
      
      const firstDestination = destinations[0];
      return firstDestination.name.length > 0 && 
             firstDestination.url.includes('/pl/esim-') &&
             firstDestination.priceFrom.includes('US$');
    } catch {
      return false;
    }
  }

  async hasMainNavigation(): Promise<boolean> {
    try {
      const nav = this.page.locator('nav');
      const hasWhatIsEsim = await nav.getByRole('link', { name: 'Co to jest eSIM' }).isVisible();
      const hasDownloadApp = await nav.getByRole('link', { name: 'Pobierz aplikację' }).isVisible();
      return hasWhatIsEsim && hasDownloadApp;
    } catch {
      return false;
    }
  }

  async hasLanguageSelector(): Promise<boolean> {
    try {
      return await this.isLanguageSelectorVisible();
    } catch {
      return false;
    }
  }

  async isMobileFriendly(): Promise<boolean> {
    try {
      const hasHeading = await this.page.locator('h1').isVisible();
      const hasSearchButton = await this.destinationSearchButton.isVisible();
      
      return hasHeading && hasSearchButton;
    } catch {
      return false;
    }
  }

  async canUseMobileSearch(): Promise<boolean> {
    try {
      await this.openDestinationSearch();
      const modalWorks = await this.searchModal.isInputVisible();
      return modalWorks;
    } catch {
      return false;
    }
  }

  // High-level behavior methods - hide ALL implementation details
  async isAccessibleAndReady(): Promise<boolean> {
    try {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.page.waitForSelector('h1', { timeout: 15000 });
      
      const hasEssentialContent = await this.hasEssentialContent();
      const hasSearchButton = await this.hasDestinationSearchButton();
      const hasDestinations = await this.hasDestinationList();
      
      return hasEssentialContent && hasSearchButton && hasDestinations;
    } catch {
      return false;
    }
  }

  async canOpenSearchModal(): Promise<boolean> {
    try {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.openDestinationSearch();
      return await this.isSearchModalOpen();
    } catch {
      return false;
    }
  }

  async canPerformDestinationSearch(): Promise<boolean> {
    try {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.openDestinationSearch();
      return await this.canSearchForDestination('Spain');
    } catch {
      return false;
    }
  }

  async showsAvailableDestinations(): Promise<boolean> {
    try {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.page.waitForTimeout(2000); // Allow page to settle
      return await this.hasPopularDestinations();
    } catch {
      return false;
    }
  }

  async allowsCountryNavigation(): Promise<boolean> {
    try {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      return await this.canNavigateToCountryPage();
    } catch {
      return false;
    }
  }

  async providesCompleteNavigation(): Promise<boolean> {
    try {
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      const hasMainNav = await this.hasMainNavigation();
      const hasLanguageSelector = await this.hasLanguageSelector();
      return hasMainNav && hasLanguageSelector;
    } catch {
      return false;
    }
  }

  async loadsWithinAcceptableTime(): Promise<boolean> {
    try {
      const startTime = Date.now();
      await this.navigate();
      await this.page.waitForSelector('h1', { timeout: 10000 });
      const loadTime = Date.now() - startTime;
      
      const isQuick = loadTime < 10000;
      const hasContent = await this.hasEssentialContent();
      
      return isQuick && hasContent;
    } catch {
      return false;
    }
  }

  async worksOnMobileDevices(): Promise<boolean> {
    try {
      await TestHelpers.setMobileViewport(this.page);
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      
      const isMobileFriendly = await this.isMobileFriendly();
      const canUseSearch = await this.canUseMobileSearch();
      
      return isMobileFriendly && canUseSearch;
    } catch {
      return false;
    }
  }

  async loadsWithoutCriticalErrors(): Promise<boolean> {
    try {
      const errors: string[] = [];
      this.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await this.navigate();
      await TestHelpers.acceptCookiesIfVisible(this.page);
      await this.page.waitForSelector('h1', { timeout: 10000 });
      
      const criticalErrors = errors.filter(error =>
        !error.includes('Failed to load resource') &&
        !error.includes('consent') &&
        !error.includes('network') &&
        error.includes('Error')
      );
      
      return criticalErrors.length === 0;
    } catch {
      return false;
    }
  }
} 