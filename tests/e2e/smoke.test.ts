import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { TestHelpers } from '../../utils/testHelpers';

test.describe('Smoke Tests - Critical Path Validation', () => {
  
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });
  
  test('User can access the homepage and see essential content', async () => {
    // when - user loads the homepage
    const isAccessible = await homePage.isAccessibleAndReady();
    
    // then - user sees essential content
    await TestHelpers.expectTrue(isAccessible, 'Homepage is accessible and ready');
  });

  test('User can open destination search modal', async () => {
    // when - user clicks search button
    const canOpenSearch = await homePage.canOpenSearchModal();

    // then - search modal works
    await TestHelpers.expectTrue(canOpenSearch, 'Search modal can be opened');
  });

  test('User can search for destinations', async () => {
    // when - user searches for destinations
    const canSearch = await homePage.canPerformDestinationSearch();

    // then - search works
    await TestHelpers.expectTrue(canSearch, 'Search works');
  });

  test('User can see available destinations', async () => {
    // when - user views the homepage
    const hasDestinations = await homePage.showsAvailableDestinations();
    
    // then - destinations are available
    await TestHelpers.expectTrue(hasDestinations, 'Destinations are available');
  });

  test('User can navigate to a country page', async () => {
    // when - user checks available destinations
    const canNavigateToCountry = await homePage.allowsCountryNavigation();
    
    // then - country navigation is available
    await TestHelpers.expectTrue(canNavigateToCountry, 'Country navigation is available');
  });

  test('Page loads within acceptable time', async () => {
    // when - user navigates to the page
    const loadsQuickly = await homePage.loadsWithinAcceptableTime();

    // then - page loads quickly
    await TestHelpers.expectTrue(loadsQuickly, 'Page loads quickly');
  });

  test('Page works on mobile devices', async () => {
    // when - user accesses on mobile
    const worksOnMobile = await homePage.worksOnMobileDevices();
    
    // then - core functionality works
    await TestHelpers.expectTrue(worksOnMobile, 'Core functionality works on mobile');
  });

  test('Page loads without critical JavaScript errors', async () => {
    // when - user loads the page
    const loadsWithoutErrors = await homePage.loadsWithoutCriticalErrors();

    // then - no critical errors occur
    await TestHelpers.expectTrue(loadsWithoutErrors, 'Page loads without critical errors');
  });
}); 