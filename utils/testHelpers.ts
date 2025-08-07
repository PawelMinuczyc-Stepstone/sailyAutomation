import { Page, expect } from '@playwright/test';

export class TestHelpers {
  static async waitForPageLoad(page: Page, timeout = 10000) {
    try {
      // Check if we're blocked by looking at response status
      const response = await page
        .waitForResponse(response => response.status() !== 0, { timeout: 5000 })
        .catch(() => null);
      if (response && response.status() >= 400) {
        const isBlocked = await this.isPageBlocked(page);
        if (isBlocked) {
          throw new Error(
            `Page blocked with status ${response.status()}: ${response.url()}`
          );
        }
      }

      await page.waitForLoadState('domcontentloaded', { timeout });
    } catch (error) {
      // Check if we're on a blocked page before falling back
      const isBlocked = await this.isPageBlocked(page);
      if (isBlocked) {
        throw error; // Re-throw if blocked
      }
      // Fallback if domcontentloaded times out but page isn't blocked
      console.log('DOMContentLoaded timeout, proceeding...');
    }
  }

  static async waitForElementToBeVisible(
    page: Page,
    selector: string,
    timeout = 10000
  ) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  static async waitForElementToBeHidden(
    page: Page,
    selector: string,
    timeout = 10000
  ) {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  static async scrollToElement(page: Page, selector: string) {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  static async acceptCookiesIfVisible(page: Page) {
    try {
      const cookieButton = page.getByTestId('consent-widget-accept-all');
      await cookieButton.waitFor({ timeout: 3000 });
      if (await cookieButton.isVisible()) {
        await cookieButton.click();
        await page.waitForTimeout(1000); // Wait for cookie banner to disappear
      }
    } catch (error) {
      // Cookie consent not found or not visible, continue without error
      console.log('Cookie consent not found, proceeding...');
    }
  }

  static async closePromoBarIfVisible(page: Page) {
    const promoCloseButton = page.getByRole('button', { name: 'Zamknij' });
    if (await promoCloseButton.isVisible()) {
      await promoCloseButton.click();
    }
  }

  static async getPagePerformanceMetrics(page: Page) {
    return await page.evaluate(() => {
      const perfData = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        loadTime: perfData.loadEventEnd - perfData.fetchStart,
        domContentLoaded:
          perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]
            ?.startTime || 0,
        timeToInteractive: perfData.loadEventEnd - perfData.fetchStart,
      };
    });
  }

  static async checkConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  static async validatePageTitle(page: Page, expectedTitle: string) {
    await expect(page).toHaveTitle(expectedTitle);
  }

  static async validateURL(page: Page, expectedURL: string | RegExp) {
    // Check if we're blocked before validating URL
    const isBlocked = await this.isPageBlocked(page);
    if (isBlocked) {
      throw new Error(
        'Cannot validate URL - page appears to be blocked by Cloudflare or similar protection'
      );
    }
    await expect(page).toHaveURL(expectedURL);
  }

  static async isPageBlocked(page: Page): Promise<boolean> {
    try {
      // Check for common blocking indicators
      const blockingIndicators = [
        'Sorry, you have been blocked',
        'Access denied',
        'Cloudflare',
        'Please complete the security check',
        'DDoS protection by Cloudflare',
        'Error 403',
        'Error 1020',
      ];

      const pageContent =
        (await page.textContent('body').catch(() => '')) || '';
      const title = await page.title().catch(() => '');

      return blockingIndicators.some(
        indicator =>
          pageContent.toLowerCase().includes(indicator.toLowerCase()) ||
          title.toLowerCase().includes(indicator.toLowerCase())
      );
    } catch {
      return false;
    }
  }

  static async checkResponseStatus(page: Page): Promise<number | null> {
    try {
      const response = await page.waitForResponse(() => true, {
        timeout: 1000,
      });
      return response.status();
    } catch {
      return null;
    }
  }

  static async handleBlockedNavigation(
    page: Page,
    targetUrl: string
  ): Promise<boolean> {
    try {
      // Navigate and check if blocked
      const response = await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      if (!response) {
        return false;
      }

      const status = response.status();
      if (status >= 400) {
        const isBlocked = await this.isPageBlocked(page);
        if (isBlocked) {
          console.warn(
            `Navigation to ${targetUrl} was blocked (status: ${status})`
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn(`Failed to navigate to ${targetUrl}:`, error);
      return false;
    }
  }

  static async validateElementText(
    page: Page,
    selector: string,
    expectedText: string
  ) {
    await expect(page.locator(selector)).toHaveText(expectedText);
  }

  static async validateElementVisible(page: Page, selector: string) {
    await expect(page.locator(selector)).toBeVisible();
  }

  static async validateElementHidden(page: Page, selector: string) {
    await expect(page.locator(selector)).toBeHidden();
  }

  static async validateElementEnabled(page: Page, selector: string) {
    await expect(page.locator(selector)).toBeEnabled();
  }

  static async validateElementDisabled(page: Page, selector: string) {
    await expect(page.locator(selector)).toBeDisabled();
  }

  static formatPrice(price: string): number {
    return parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
  }

  static isValidPrice(price: string): boolean {
    const numericPrice = this.formatPrice(price);
    return !isNaN(numericPrice) && numericPrice > 0;
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static async expectTrue(actual: boolean, message: string) {
    expect(actual, message).toBe(true);
  }

  static async setMobileViewport(page: Page) {
    await page.setViewportSize({ width: 375, height: 667 });
  }

  static async setDesktopViewport(page: Page) {
    await page.setViewportSize({ width: 1920, height: 1080 });
  }

  static async setTabletViewport(page: Page) {
    await page.setViewportSize({ width: 768, height: 1024 });
  }

  static async simulateSlowNetwork(page: Page) {
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
  }

  static generateTestData() {
    return {
      validCountries: ['Spain', 'Turkey', 'Thailand', 'USA', 'France'],
      invalidCountries: ['Atlantis', 'XYZ123', 'NotACountry'],
      commonSearchTerms: ['Spain', 'Europe', 'Asia', 'Global'],
      dataPackageSizes: ['1GB', '3GB', '5GB', '10GB', '20GB', 'Unlimited'],
    };
  }

  static async humanLikeDelay(
    minMs: number = 500,
    maxMs: number = 2000
  ): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
