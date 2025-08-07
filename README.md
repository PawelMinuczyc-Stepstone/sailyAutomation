# Saily Test Automation

End-to-end and API test suite for the Saily travel platform using **Playwright** and **TypeScript**.

## Code Quality

Format all files:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Format specific file:

```bash
npx prettier --write tests/e2e/smoke.test.ts
```

Check unused files:

```bash
npm run check-unused
```

Lint:

```bash
npm run lint
```

Auto-fix lint issues:

```bash
npm run lint:fix
```

## Highlights

- Page Object Model – clean, scalable structure
- Visual Regression – snapshot testing
- API Testing – typed REST validation
- Cross-Browser & Mobile – Chromium, Firefox, WebKit
- Test Helpers – reusable logic

## Run Tests

```bash
npm install
npm test
npm run test:e2e
npm run test:api
npm run test:snapshots -- --update-snapshots
```
