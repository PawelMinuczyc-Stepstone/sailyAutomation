# Saily Test Automation

End-to-end and API test suite for the [Saily](https://saily.com/pl) travel platform, built with Playwright and TypeScript.

## Project Summary

This test suite provides automated quality assurance for saily.com/pl, a Polish eSIM travel platform. It validates core functionality, UI elements, and API endpoints to ensure a reliable user experience.

## Key Features

- **Page Object Model** – Clean, scalable structure that enhances readability and simplifies maintenance.
- **Visual Regression Testing** – Snapshot comparison with a 0.2-pixel-diff threshold to catch unintended UI changes.
- **API Testing** – Typed REST validation ensures the backend operates as expected.
- **Cross-Browser & Mobile Testing** – Coverage includes Chromium, Firefox, WebKit, and key mobile viewports (e.g., iPhone 16 Pro).
- **Reusable Helpers** – Shared utilities for common actions like API requests, waits, and screenshots.

## Tech Stack

- **Testing Framework**: Playwright 1.40
- **Language**: TypeScript 5
- **Runtime**: Node.js (LTS)
- **Code Quality Tools**: ESLint 8.57, Prettier 3.0
- **CI/CD**: GitHub Actions – executes tests in parallel and generates HTML reports (retained for 30 days)

## Run Tests

First, install dependencies:

```bash
npm install
```

Then, run tests with:

```bash
# Run all tests
npm test

# Run only end-to-end tests
npm run test:e2e

# Run only API tests
npm run test:api

# Update visual snapshots
npm run test:snapshots -- --update-snapshots
```

## Code Quality and Maintenance

To maintain a clean codebase:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Lint all files
npm run lint

# Auto-fix lint issues
npm run lint:fix
```

## Next Steps & Improvements

- **Configuration**: Move hardcoded values (timeouts, country codes, etc.) to environment variables or fixtures.
- **Test Coverage**:
  - Extend the CI matrix to include Firefox and WebKit consistently.
  - Add mobile device profiles (e.g., Galaxy S24, Pixel 8).
  - Implement missing tests and negative-path scenarios in a lower-level test layer (e.g., integration, component).
  - Implement full customer journeys.
- **Code Structure**:
  - Split Page Object classes for desktop and mobile flows.
- **Stability & Reliability**:
  - Stabilize snapshot tests to reduce flakiness.
- **Production Readiness**:
  - Use Docker and configure dedicated test databases for production-grade reliability.
- **Accessibility**:
  - Add accessibility testing to ensure compliance and inclusivity.
- **Internationalization**:
  - Ensure tests are written in a language-independent manner for scalability and maintainability.
- **Performance**:
  - Define performance budgets and add load-time regression checks, including Core Web Vitals.
