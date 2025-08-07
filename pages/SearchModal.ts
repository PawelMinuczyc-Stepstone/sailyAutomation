import { Page, Locator } from '@playwright/test';
import { SearchNavigator } from '../logic/SearchNavigator';

export class SearchModal {
  // Centralized selectors
  private static readonly SELECTORS = {
    modal: '[data-testid="search-destinations-modal"]',
    searchInput: '[data-testid="search-input"]',
    closeButton: '[data-testid="general-modal-close-button"]',
    countryTab: '[data-testid="country-list-tab-chip-country"]',
    regionTab: '[data-testid="country-list-tab-chip-region"]',
    destinationLinks: 'a',
    globalOption: 'text=Globalnie',
    europeOption: 'text=Europa',
  } as const;

  readonly page: Page;
  private readonly modal: Locator;
  private readonly searchInput: Locator;
  private readonly closeButton: Locator;
  private readonly countryTab: Locator;
  private readonly regionTab: Locator;
  private readonly destinationLinks: Locator;
  private readonly globalOption: Locator;
  private readonly europeOption: Locator;

  constructor(page: Page) {
    this.page = page;
    const s = SearchModal.SELECTORS;

    this.modal = page.locator(s.modal);
    this.searchInput = page.locator(s.searchInput);
    this.closeButton = page.locator(s.closeButton);
    this.countryTab = page.locator(s.countryTab);
    this.regionTab = page.locator(s.regionTab);
    this.destinationLinks = this.modal.locator(s.destinationLinks);
    this.globalOption = page.locator(s.globalOption);
    this.europeOption = page.locator(s.europeOption);
  }

  // Public methods
  async searchDestination(destination: string) {
    await this.searchInput.fill(destination);
  }

  async closeModal() {
    await this.closeButton.click();
  }

  async isInputVisible(): Promise<boolean> {
    return await this.searchInput.isVisible();
  }

  async isInputEnabled(): Promise<boolean> {
    return await this.searchInput.isEnabled();
  }

  async fillInput(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  async getInputValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  async selectCountryTab() {
    await this.countryTab.click();
  }

  async selectRegionTab() {
    await this.regionTab.click();
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async isHidden(): Promise<boolean> {
    return await this.modal.isHidden();
  }

  async waitForVisible(): Promise<void> {
    await this.modal.waitFor({ state: 'visible' });
  }

  async waitForHidden(): Promise<void> {
    await this.modal.waitFor({ state: 'hidden' });
  }

  async hasSearchResults(): Promise<boolean> {
    try {
      const count = await this.getDestinationCount();
      return count > 0;
    } catch {
      return false;
    }
  }

  async getDestinationCount(): Promise<number> {
    await this.searchInput.waitFor({ state: 'visible' });
    return await this.destinationLinks.count();
  }

  async hasDestination(countryCode: string): Promise<boolean> {
    await this.searchInput.waitFor({ state: 'visible' });
    const destination = this.page.getByTestId(countryCode);
    return await destination.isVisible();
  }

  async getVisibleDestinationCodes(): Promise<string[]> {
    await this.searchInput.waitFor({ state: 'visible' });

    const count = await this.destinationLinks.count();
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const testId = await this.destinationLinks
        .nth(i)
        .getAttribute('data-testid');
      if (testId) codes.push(testId);
    }
    return codes;
  }

  async expectResultsToBeVisible(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    await TestHelpers.expectTrue(
      await this.hasSearchResults(),
      'Search results are visible'
    );
  }

  async expectAtLeastOneDestination(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    const count = await this.getDestinationCount();
    await TestHelpers.expectTrue(count > 0, `Found ${count} destinations`);
  }

  async expectDestinationCodesVisible(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    const visibleCodes = await this.getVisibleDestinationCodes();
    await TestHelpers.expectTrue(
      visibleCodes.length > 0,
      'Destination codes are visible'
    );
  }

  async expectToBeHidden(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    await TestHelpers.expectTrue(
      await this.isHidden(),
      'Search modal is hidden'
    );
  }

  async expectToBeVisible(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    await this.waitForVisible();
    await TestHelpers.expectTrue(
      await this.isVisible(),
      'Search modal is visible'
    );
  }

  async expectInputToBeVisible(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    await TestHelpers.expectTrue(
      await this.isInputVisible(),
      'Search input is visible'
    );
  }

  async expectInputToContain(expectedValue: string): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    const actualValue = await this.getInputValue();
    await TestHelpers.expectTrue(
      actualValue === expectedValue,
      `Search input contains "${expectedValue}"`
    );
  }

  async searchInvalidInput(invalidTerm: string): Promise<void> {
    await this.fillInput('');
    await this.searchDestination(invalidTerm);
  }

  async expectGracefulHandling(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    await TestHelpers.expectTrue(
      await this.isInputVisible(),
      'Input remains visible'
    );
    await TestHelpers.expectTrue(
      await this.isVisible(),
      'Modal remains visible'
    );
  }

  async expectCountryTabToBeSelected(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    const selected = await this.countryTab.getAttribute('aria-selected');
    await TestHelpers.expectTrue(
      selected === 'true',
      'Country tab is selected'
    );
  }

  async expectRegionTabToBeSelected(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');
    const selected = await this.regionTab.getAttribute('aria-selected');
    await TestHelpers.expectTrue(selected === 'true', 'Region tab is selected');
  }

  async expectNavigationToWorkCorrectly(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');

    const navigator = new SearchNavigator(this.page, this);
    const result = await navigator.goToResult(0);

    switch (result.status) {
      case 'success':
        await TestHelpers.waitForPageLoad(this.page);
        await TestHelpers.validateURL(this.page, new RegExp(result.url));
        await TestHelpers.expectTrue(true, 'Navigation completed successfully');
        break;

      case 'blocked':
        await TestHelpers.expectTrue(!!result.url, 'URL exists when blocked');
        await TestHelpers.expectTrue(
          TestHelpers.isValidURL(result.url),
          'URL format is valid when blocked'
        );
        console.warn('Navigation was blocked by Cloudflare, but URL is valid');
        break;

      case 'failed':
      default:
        await TestHelpers.expectTrue(false, 'Navigation should not fail');
    }
  }

  async expectPopularDestinationsDisplayedCorrectly(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');

    const destinations = await this.getPopularDestinations();
    await TestHelpers.expectTrue(
      destinations.length > 0,
      'Popular destinations are displayed'
    );

    const first = destinations[0];
    await this.assertDestinationHasValidContent(first, TestHelpers);
  }

  async expectRegionalOptionsToAppear(): Promise<void> {
    const { TestHelpers } = await import('../utils/testHelpers');

    await this.selectRegionTab();

    await TestHelpers.expectTrue(
      await this.globalOption.isVisible(),
      'Global option is visible'
    );
    await TestHelpers.expectTrue(
      await this.europeOption.isVisible(),
      'Europe option is visible'
    );

    const globalText = await this.globalOption.locator('..').textContent();
    const europeText = await this.europeOption.locator('..').textContent();

    await TestHelpers.expectTrue(
      globalText?.includes('krajów') || false,
      'Global option shows country count'
    );
    await TestHelpers.expectTrue(
      europeText?.includes('krajów') || false,
      'Europe option shows country count'
    );
  }

  // Private helpers
  private async getPopularDestinations(): Promise<Locator[]> {
    return await this.destinationLinks.all();
  }

  private async assertDestinationHasValidContent(
    destination: Locator,
    TestHelpers: any
  ): Promise<void> {
    const name = await destination.locator('p').first().textContent();
    const price = await destination.locator('p').nth(1).textContent();

    await TestHelpers.expectTrue(!!name, 'Destination has a name');
    await TestHelpers.expectTrue(!!price, 'Destination has a price');
    await TestHelpers.expectTrue(
      TestHelpers.isValidPrice(price || ''),
      `Price "${price}" is valid format`
    );
  }
}
