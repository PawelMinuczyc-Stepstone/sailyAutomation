import { Page, Locator } from '@playwright/test';
import { SearchModal } from '../pages/SearchModal';

export type NavigationResult =
  | { status: 'success'; url: string }
  | { status: 'blocked'; url: string }
  | { status: 'failed' };

export class SearchNavigator {
  private readonly page: Page;
  private readonly destinationLinks: Locator;

  constructor(page: Page, modal: SearchModal) {
    this.page = page;
    this.destinationLinks = modal['destinationLinks'];
  }

  async goToResult(index = 0): Promise<NavigationResult> {
    const { TestHelpers } = await import('../utils/testHelpers');

    try {
      const results = await this.destinationLinks.all();
      const target = results[index];
      const href = await target?.getAttribute('href');

      if (!href) return { status: 'failed' };

      const url = new URL(href, 'https://saily.com').href;
      const allowed = await TestHelpers.handleBlockedNavigation(this.page, url);

      if (allowed) return { status: 'success', url };

      const blocked = await TestHelpers.isPageBlocked(this.page);
      return blocked ? { status: 'blocked', url } : { status: 'failed' };
    } catch (e) {
      console.warn('Navigation error:', e);
      return { status: 'failed' };
    }
  }
}
