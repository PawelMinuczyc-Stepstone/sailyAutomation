import { Page, Locator } from '@playwright/test';
import {
  DataPackage,
  CountryPageData,
  ComparisonTableData,
} from '../types/saily.types';

export class CountryPage {
  // Centralized selectors
  private static readonly SELECTORS = {
    countryTitle: 'h1',
    specialNotice: '[data-testid="special-notice"]',
    packageOptions: 'input[type="radio"]',
    selectedPackageContainer: 'input[type="radio"]:checked >> xpath=..',
    priceSection: '[data-testid="price-section"]',
    faqSection: '[data-testid="faq-section"]',
    comparisonRows: 'table tbody tr',
    tabContent: '[role="tabpanel"]',
    appDownloadSection: 'text=Pobierz aplikację eSIM Saily',
    referralSection: 'text=Poleć znajomym',
  } as const;

  readonly page: Page;
  readonly countryTitle: Locator;
  readonly specialNotice: Locator;
  readonly packageOptions: Locator;
  readonly selectedPackageContainer: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly deviceCompatibilityButton: Locator;
  readonly featuresTab: Locator;
  readonly descriptionTab: Locator;
  readonly technicalTab: Locator;
  readonly tabContent: Locator;
  readonly comparisonRows: Locator;
  readonly faqSection: Locator;
  readonly appStoreLinks: Locator;
  readonly referralSection: Locator;

  constructor(page: Page) {
    this.page = page;
    const s = CountryPage.SELECTORS;

    this.countryTitle = page.locator(s.countryTitle);
    this.specialNotice = page.locator(s.specialNotice);
    this.packageOptions = page.locator(s.packageOptions);
    this.selectedPackageContainer = page.locator(s.selectedPackageContainer);
    this.proceedToCheckoutButton = page.getByRole('button', {
      name: 'Przejdź do kasy',
    });
    this.deviceCompatibilityButton = page.getByRole('button', {
      name: 'Sprawdź kompatybilność urządzenia',
    });
    this.featuresTab = page.getByRole('button', { name: 'Główne funkcje' });
    this.descriptionTab = page.getByRole('button', { name: 'Opis' });
    this.technicalTab = page.getByRole('button', { name: 'Dane techniczne' });
    this.tabContent = page.locator(s.tabContent);
    this.comparisonRows = page.locator(s.comparisonRows);
    this.faqSection = page.locator(s.faqSection);
    this.appStoreLinks = page.locator(s.appDownloadSection).locator('..');
    this.referralSection = page.locator(s.referralSection).locator('..');
  }

  async navigateToCountry(countryPath: string): Promise<void> {
    await this.page.goto(countryPath);
  }

  async selectFeaturesTab(): Promise<void> {
    await this.featuresTab.click();
  }
  async selectDescriptionTab(): Promise<void> {
    await this.descriptionTab.click();
  }
  async selectTechnicalTab(): Promise<void> {
    await this.technicalTab.click();
  }

  async expandFAQ(questionText: string): Promise<void> {
    await this.page.getByRole('button', { name: questionText }).click();
  }

  async getAllPackages(): Promise<DataPackage[]> {
    const packages: DataPackage[] = [];
    const elems = this.packageOptions.locator('..');
    const count = await elems.count();

    for (let i = 0; i < count; i++) {
      const el = elems.nth(i);
      const dataAmount =
        (await el.locator('p').first().textContent())?.trim() || '';
      const duration =
        (await el.locator('p').nth(1).textContent())?.trim() || '';
      const price =
        (
          await el.locator('div').last().locator('p').first().textContent()
        )?.trim() || '';
      const original =
        (
          await el.locator('div').last().locator('p').nth(1).textContent()
        )?.trim() || undefined;
      const cashback =
        parseInt(
          (await el.locator('text=%').textContent())?.replace('%', '') || ''
        ) || undefined;
      const recommended = await el.locator('text=Najlepszy wybór').isVisible();
      const id = (await el.locator('input').getAttribute('value')) || '';

      packages.push({
        id,
        dataAmount,
        duration,
        price,
        originalPrice: original,
        discountPercentage: original ? 5 : undefined,
        cashbackPercentage: cashback || 0,
        isRecommended: recommended,
        isUnlimited: dataAmount.includes('Nielimitowane'),
      });
    }
    return packages;
  }

  async getCountryPageData(): Promise<CountryPageData> {
    const title = (await this.countryTitle.textContent()) || '';
    const countryName = title.replace(/eSIM (do|na) /, '');

    await this.selectFeaturesTab();
    const features =
      (await this.tabContent.textContent())
        ?.split('\n')
        .map(s => s.trim())
        .filter(Boolean) || [];

    await this.selectDescriptionTab();
    const description = (await this.tabContent.textContent())?.trim() || '';

    await this.selectTechnicalTab();
    const technicalSpecs =
      (await this.tabContent.textContent())
        ?.split('\n')
        .map(s => s.trim())
        .filter(Boolean) || [];

    return {
      countryName,
      countryCode: this.extractCountryCodeFromURL(),
      packages: await this.getAllPackages(),
      specialNotice: (await this.specialNotice.textContent()) || undefined,
      features,
      description,
      technicalSpecs,
    };
  }

  async getComparisonData(): Promise<ComparisonTableData[]> {
    const data: ComparisonTableData[] = [];
    const rows = this.comparisonRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td, th');
      const cellCount = await cells.count();
      if (!cellCount) continue;

      const feature = (await cells.first().textContent())?.trim() || '';
      const sailyVal =
        cellCount > 1 ? (await cells.nth(1).textContent())?.trim() || '' : '';
      const competitors: Record<string, string> = {};
      for (let j = 2; j < cellCount; j++) {
        competitors[`competitor_${j - 1}`] =
          (await cells.nth(j).textContent())?.trim() || '';
      }
      data.push({ feature, saily: sailyVal, competitors });
    }
    return data;
  }

  async isSpecialNoticeVisible(): Promise<boolean> {
    return this.specialNotice.isVisible();
  }

  async isProceedToCheckoutEnabled(): Promise<boolean> {
    return this.proceedToCheckoutButton.isEnabled();
  }

  async isPackageSelected(): Promise<boolean> {
    return (
      (await this.page
        .locator(CountryPage.SELECTORS.selectedPackageContainer)
        .count()) > 0
    );
  }

  private extractCountryCodeFromURL(): string {
    return this.page.url().match(/\/esim-([^\/]+)\//)?.[1] || '';
  }
}
