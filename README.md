# Saily Test Automation

End-to-end and API test suite for the Saily travel platform using **Playwright** and **TypeScript**.

## Highlights

- Page Object Model – clean, scalable test structure
- Visual Regression – automated UI checks with snapshot testing
- API Testing – REST endpoint validation with typed models
- Cross-Browser & Mobile – Chromium, Firefox, WebKit, mobile viewports
- Test Helpers – reusable logic for cleaner specs

## Run Tests

```bash
npm install         # Install deps
npm test            # All tests
npm run test:e2e    # E2E only
npm run test:api    # API only
npm run test:snapshots -- --update-snapshots  # Update visuals
