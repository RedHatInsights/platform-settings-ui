---
name: e2e-testing
description: Playwright E2E setup and conventions for platform-settings-ui — auth via Red Hat SSO, required E2E_USER/E2E_PASSWORD env vars, base URL and timeout config, and selector patterns. Use when writing, running, or debugging tests under playwright/.
---

# E2E Testing (Playwright)

**Location**: `playwright/*.spec.ts`
**Config**: `playwright.config.ts`

```bash
npx playwright test              # Run all E2E tests
npx playwright test --ui         # Interactive mode
npx playwright test --headed     # See browser
npx playwright show-report       # View HTML report
```

## Configuration

- Test directory: `./playwright`
- Base URL: `https://stage.foo.redhat.com:1337` (override with `PLAYWRIGHT_BASE_URL`)
- Browser: Chromium only
- Retries: 2 on CI, 0 locally
- Timeout: 120s per test, 10s per assertion
- Global setup: `@redhat-cloud-services/playwright-test-auth/global-setup` handles Red Hat SSO login
- Storage state: `playwright/.auth/user.json` reused across tests

**Required env vars**: `E2E_USER`, `E2E_PASSWORD`

## Patterns

- Use `disableCookiePrompt()` from `@redhat-cloud-services/playwright-test-auth` to block TrustArc prompts
- Prefer role-based selectors (`getByRole`, `getByLabel`)
- Use `waitForLoadState('load')` after navigation

## Auth failures

If Playwright fails to authenticate, the env vars are almost always missing:

```bash
export E2E_USER="your-username"
export E2E_PASSWORD="your-password"
npx playwright test
```
