import { test } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { TestHelpers } from '../../utils/testHelpers';
import { SearchModal } from '../../pages/SearchModal';

test.describe('Destination Search Functionality', () => {
  let homePage: HomePage;
  let searchModal: SearchModal;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchModal = new SearchModal(page); // Initialize SearchModal
    await homePage.navigate();
    await TestHelpers.acceptCookiesIfVisible(page);
  });

  test('Search modal opens and closes correctly', async ({}) => {
    // given
    await searchModal.expectToBeHidden();

    // when
    await homePage.openDestinationSearch();

    // then
    await searchModal.expectToBeVisible();
    await searchModal.expectInputToBeVisible();

    // when
    await searchModal.closeModal();

    // then
    await searchModal.expectToBeHidden();
  });

  test('Search input accepts and displays text correctly', async ({}) => {
    // given
    const searchTerm = 'Spain';
    await homePage.openDestinationSearch();

    // when
    await searchModal.searchDestination(searchTerm);

    // then
    await searchModal.expectInputToContain(searchTerm);
  });

  test('Search returns valid results for existing countries', async ({}) => {
    // given
    await homePage.openDestinationSearch();

    // when
    await searchModal.searchDestination('Spain');

    // then
    await searchModal.expectResultsToBeVisible();
    await searchModal.expectAtLeastOneDestination();
    await searchModal.expectDestinationCodesVisible();
  });

  test('Search handles invalid input gracefully', async ({}) => {
    // given
    await homePage.openDestinationSearch();

    // when
    await searchModal.searchInvalidInput('XYZ123InvalidCountry');

    // then
    await searchModal.expectGracefulHandling();
  });

  test('Popular destinations display correctly in search modal', async ({}) => {
    // given
    await homePage.openDestinationSearch();

    // when
    // then
    await searchModal.expectPopularDestinationsDisplayedCorrectly();
  });

  test('Search result navigation works correctly', async ({}) => {
    // given
    await homePage.openDestinationSearch();
    await searchModal.searchDestination('Spain');

    // when
    // then
    await searchModal.expectNavigationToWorkCorrectly();
  });

  test('Search modal keyboard navigation works', async ({ page }) => {
    // given
    await homePage.openDestinationSearch();

    // when
    await page.keyboard.press('Escape');

    // then
    await TestHelpers.expectTrue(
      await searchModal.isHidden(),
      'Search modal closes on Escape key'
    );

    // when
    await homePage.openDestinationSearch();
    await searchModal.fillInput('Thailand');

    // then
    const inputValue = await searchModal.getInputValue();
    await TestHelpers.expectTrue(
      inputValue === 'Thailand',
      'Keyboard typing works in search input'
    );
  });
});
