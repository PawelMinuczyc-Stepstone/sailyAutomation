import { Page, Locator } from '@playwright/test';

type ScreenshotOptions = {
  element?: Locator;
  waitForNetworkIdle?: boolean;
  waitForAnimations?: boolean;
  log?: boolean;
};

export class SnapshotHelpers {
  private static async waitForStability(
    page: Page,
    { waitForNetworkIdle, waitForAnimations }: ScreenshotOptions
  ) {
    if (waitForNetworkIdle) {
      await page.waitForLoadState('networkidle');
    }
    if (waitForAnimations) {
      await page.waitForTimeout(1000);
    }
  }

  static async takeStableScreenshot(
    page: Page,
    name: string,
    options: ScreenshotOptions = {}
  ) {
    const {
      element = page,
      waitForNetworkIdle = true,
      waitForAnimations = true,
      log = false,
    } = options;

    await this.waitForStability(page, {
      waitForNetworkIdle,
      waitForAnimations,
    });

    if (log) console.log(`📸 Taking screenshot: ${name}`);

    return element.screenshot({
      path: `test-results/snapshots/${name}.png`,
      fullPage: element === page,
      type: 'png',
      quality: 90,
    });
  }

  static async updateBaseline(
    page: Page,
    name: string,
    options: ScreenshotOptions = {}
  ) {
    if (options.log) console.log(`🔄 Updating baseline: ${name}`);
    await this.takeStableScreenshot(page, `baseline-${name}`, options);
  }

  static async compareWithBaseline(
    page: Page,
    name: string,
    options: ScreenshotOptions = {}
  ) {
    if (options.log) console.log(`🔍 Comparing with baseline: ${name}`);
    return this.takeStableScreenshot(page, `current-${name}`, options);
  }
}
