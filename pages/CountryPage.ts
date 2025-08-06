import { Page, Locator } from '@playwright/test';
import { DataPackage, CountryPageData, FAQItem, ComparisonTableData } from '../types/saily.types';

export class CountryPage {
  readonly page: Page;
  readonly countryTitle: Locator;
  readonly specialNotice: Locator;
  readonly packageOptions: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly deviceCompatibilityButton: Locator;
  readonly featuresTab: Locator;
  readonly descriptionTab: Locator;
  readonly technicalTab: Locator;
  readonly tabContent: Locator;
  readonly comparisonTable: Locator;
  readonly faqSection: Locator;
  readonly appStoreLinks: Locator;
  readonly referralSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.countryTitle = page.locator('h1');
    this.specialNotice = page.locator('[data-testid="special-notice"]');
    this.packageOptions = page.locator('input[type="radio"]');
    this.proceedToCheckoutButton = page.getByRole('button', { name: 'Przejdź do kasy' });
    this.deviceCompatibilityButton = page.getByRole('button', { name: 'Sprawdź kompatybilność urządzenia' });
    this.featuresTab = page.getByRole('button', { name: 'Główne funkcje' });
    this.descriptionTab = page.getByRole('button', { name: 'Opis' });
    this.technicalTab = page.getByRole('button', { name: 'Dane techniczne' });
    this.tabContent = page.locator('[role="tabpanel"]');
    this.comparisonTable = page.locator('table');
    this.faqSection = page.locator('[data-testid="faq-section"]');
    this.appStoreLinks = page.locator('text=Pobierz aplikację eSIM Saily').locator('..');
    this.referralSection = page.locator('text=Poleć znajomym').locator('..');
  }

  async navigateToCountry(countryPath: string) {
    await this.page.goto(countryPath);
  }

  async selectPackage(packageIndex: number) {
    await this.packageOptions.nth(packageIndex).click();
  }

  async selectPackageByDataAmount(dataAmount: string) {
    const packageLabel = this.page.locator(`text=${dataAmount}`).locator('..').locator('input[type="radio"]');
    await packageLabel.click();
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }

  async checkDeviceCompatibility() {
    await this.deviceCompatibilityButton.click();
  }

  async selectFeaturesTab() {
    await this.featuresTab.click();
  }

  async selectDescriptionTab() {
    await this.descriptionTab.click();
  }

  async selectTechnicalTab() {
    await this.technicalTab.click();
  }

  async expandFAQ(questionText: string) {
    const faqButton = this.page.getByRole('button', { name: questionText });
    await faqButton.click();
  }

  async getSelectedPackage(): Promise<DataPackage | null> {
    const selectedPackage = this.page.locator('input[type="radio"]:checked').locator('..');
    
    if (!(await selectedPackage.isVisible())) {
      return null;
    }

    const dataAmount = await selectedPackage.locator('p').first().textContent() || '';
    const duration = await selectedPackage.locator('p').nth(1).textContent() || '';
    const priceSection = selectedPackage.locator('[data-testid="price-section"]');
    const price = await priceSection.locator('p').first().textContent() || '';
    const originalPrice = await priceSection.locator('p').nth(1).textContent();
    const cashbackText = await selectedPackage.locator('text=%').textContent() || '';

    return {
      id: await selectedPackage.locator('input').getAttribute('value') || '',
      dataAmount: dataAmount.trim(),
      duration: duration.trim(),
      price: price.trim(),
      originalPrice: originalPrice?.trim(),
      discountPercentage: originalPrice ? 5 : undefined,
      cashbackPercentage: parseInt(cashbackText.replace('%', '')) || 3,
      isRecommended: await selectedPackage.locator('text=Najlepszy wybór').isVisible(),
      isUnlimited: dataAmount.includes('Nielimitowane')
    };
  }

  async getAllPackages(): Promise<DataPackage[]> {
    const packages: DataPackage[] = [];
    const packageElements = this.page.locator('input[type="radio"]').locator('..');
    const count = await packageElements.count();

    for (let i = 0; i < count; i++) {
      const packageEl = packageElements.nth(i);
      const dataAmount = await packageEl.locator('p').first().textContent() || '';
      const duration = await packageEl.locator('p').nth(1).textContent() || '';
      const priceSection = packageEl.locator('div').last();
      const price = await priceSection.locator('p').first().textContent() || '';
      const originalPrice = await priceSection.locator('p').nth(1).textContent();
      const cashbackText = await packageEl.locator('text=%').textContent() || '';
      const radioInput = packageEl.locator('input[type="radio"]');

      packages.push({
        id: await radioInput.getAttribute('value') || '',
        dataAmount: dataAmount.trim(),
        duration: duration.trim(),
        price: price.trim(),
        originalPrice: originalPrice?.trim(),
        discountPercentage: originalPrice ? 5 : undefined,
        cashbackPercentage: parseInt(cashbackText.replace('%', '')) || 3,
        isRecommended: await packageEl.locator('text=Najlepszy wybór').isVisible(),
        isUnlimited: dataAmount.includes('Nielimitowane')
      });
    }

    return packages;
  }

  async getCountryPageData(): Promise<CountryPageData> {
    const title = await this.countryTitle.textContent() || '';
    const countryName = title.replace('eSIM do ', '').replace('eSIM na ', '');
    
    await this.selectFeaturesTab();
    const features = await this.getTabContent();
    
    await this.selectDescriptionTab();
    const description = await this.getTabContent();
    
    await this.selectTechnicalTab();
    const technicalSpecs = await this.getTabContent();

    const packages = await this.getAllPackages();
    const specialNoticeText = await this.specialNotice.textContent();

    return {
      countryName,
      countryCode: this.extractCountryCodeFromURL(),
      packages,
      specialNotice: specialNoticeText || undefined,
      features: features.split('\n').filter(f => f.trim()),
      description: description.trim(),
      technicalSpecs: technicalSpecs.split('\n').filter(f => f.trim())
    };
  }

  async getTabContent(): Promise<string> {
    return await this.tabContent.textContent() || '';
  }

  async getFAQItems(): Promise<FAQItem[]> {
    const faqItems: FAQItem[] = [];
    const faqButtons = this.page.locator('[data-testid="faq-section"] button');
    const count = await faqButtons.count();

    for (let i = 0; i < count; i++) {
      const button = faqButtons.nth(i);
      const question = await button.locator('h3').textContent() || '';
      const isExpanded = await button.getAttribute('aria-expanded') === 'true';
      
      let answer = '';
      if (isExpanded) {
        const answerEl = button.locator('..').locator('[data-testid="faq-answer"]');
        answer = await answerEl.textContent() || '';
      }

      faqItems.push({
        question: question.trim(),
        answer: answer.trim(),
        isExpanded
      });
    }

    return faqItems;
  }

  async getComparisonData(): Promise<ComparisonTableData[]> {
    const tableData: ComparisonTableData[] = [];
    const rows = this.comparisonTable.locator('tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td, th');
      const cellCount = await cells.count();
      
      if (cellCount > 0) {
        const feature = await cells.first().textContent() || '';
        const sailyValue = cellCount > 1 ? await cells.nth(1).textContent() || '' : '';
        
        const competitors: Record<string, string | boolean> = {};
        for (let j = 2; j < cellCount; j++) {
          const value = await cells.nth(j).textContent() || '';
          competitors[`competitor_${j - 1}`] = value;
        }

        tableData.push({
          feature: feature.trim(),
          saily: sailyValue.trim(),
          competitors
        });
      }
    }

    return tableData;
  }

  async isSpecialNoticeVisible(): Promise<boolean> {
    return await this.specialNotice.isVisible();
  }

  async isProceedToCheckoutEnabled(): Promise<boolean> {
    return await this.proceedToCheckoutButton.isEnabled();
  }

  async isPackageSelected(): Promise<boolean> {
    return await this.page.locator('input[type="radio"]:checked').count() > 0;
  }

  private extractCountryCodeFromURL(): string {
    const url = this.page.url();
    const match = url.match(/\/esim-([^\/]+)\//);
    return match ? match[1] : '';
  }
} 