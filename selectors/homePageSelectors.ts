// Centralized selector definitions for HomePage
// All locators are defined here to avoid duplication and ease maintenance
export const HomePageSelectors = {
  // Cookie & promo
  cookieAcceptButton: '[data-testid="consent-widget-accept-all"]',
  promoCloseButton: '[data-testid="announcement-bar-close"]',
  shareAndEarnButton: '[data-testid="announcement-bar-cta"]',

  // Header & navigation
  languagePicker: '[data-testid="language-picker"] select',
  mobileMenuToggle: '[data-testid="nav-item-container-mobile"] button',
  sailyLogoLink: '[data-testid="section-Header"] a[href="/pl/"]',
  mainNavLink: 'nav a[href*="/"], header a[href*="/"]',
  homeLink: 'a[href="/"], a[href="/home"]',
  destinationsLink: 'a[href*="/destinations"], a[href*="/countries"]',
  aboutLink: 'a[href*="/about"]',
  contactLink: 'a[href*="/contact"]',
  blogLink: 'a[href*="/blog"]',

  // Download section
  appStoreLink: '[data-testid="section-DownloadSailyApp"] a:nth-of-type(1)',
  googlePlayLink: '[data-testid="section-DownloadSailyApp"] a:nth-of-type(2)',

  // Security & referral
  learnMoreSecurityButton: '[data-testid="section-SecurityFeatures"] button',
  referralLearnMoreButton: '[data-testid="section-ReferalBanner"] button',

  // Destinations
  destinationSearchButton: '[data-testid="destination-modal-button"]',
  popularDestinationLinks: 'a[href*="/pl/esim-"]',

  // App rating
  appRatingText: 'text=4.7',
  reviewCountText: 'text=ponad 97 400 opinii',

  // Footer
  footerSectionToggle: 'footer button[aria-expanded]',
  footerPrivacyPolicy: 'footer a[href*="/legal/privacy-policy/"]',
  footerTermsOfService: 'footer a[href*="/legal/terms-of-service/"]',

  // Social media
  socialLinks: [
    'footer a[href*="facebook.com"]',
    'footer a[href*="x.com"]',
    'footer a[href*="linkedin.com"]',
    'footer a[href*="youtube.com"]',
    'footer a[href*="instagram.com"]',
    'footer a[href*="reddit.com"]',
  ],

  // Payment icons
  paymentIcons: [
    'footer img[alt*="apple"], footer img[src*="apple"]',
    'footer img[alt*="google"], footer img[src*="google"]',
    'footer img[alt*="visa"], footer img[src*="visa"]',
    'footer img[alt*="mastercard"], footer img[src*="mastercard"]',
    'footer img[alt*="amex"], footer img[src*="amex"]',
    'footer img[alt*="discover"], footer img[src*="discover"]',
    'footer img[alt*="union"], footer img[src*="union"]',
    'footer img[alt*="jcb"], footer img[src*="jcb"]',
  ],
};
