# platform-settings-ui

Consolidated frontend application for the Red Hat Hybrid Cloud Console (HCC) platform settings area. Combines notifications, sources, and user preferences into a single modern codebase.

**Repository**: [RedHatInsights/platform-settings-ui](https://github.com/RedHatInsights/platform-settings-ui)
**Team**: Platform Experience Services
**Route**: `/settings`

## Governance

This repo follows the [Experience UI Governance](https://github.com/RedHatInsights/experience-ui-governance) standards. The governance package is the canonical source of truth for engineering standards, ESLint rules, CI workflows, and code review configuration.

**Standards**: `node_modules/experience-ui-governance/standards/index.md`
**ESLint plugin**: `experience-ui-governance/eslint-plugin` (registered as `experience-ui` in eslint.config.js)
**CI workflows**: Reusable GitHub Actions from `experience-ui-governance/.github/workflows/`
**Code review**: `.coderabbit.yml` based on the governance template

## Architecture Overview

HCC frontend applications are **micro-frontends** loaded into the Chrome shell via Module Federation:

```
+---------------------------------------------------+
|  Chrome Shell (Navigation, Auth, Services)        |
|  +-----------------------------------------------+|
|  |  platform-settings-ui (Module Federation)     ||
|  |  - ServiceProvider -> QueryClient -> Router   ||
|  |  - Feature islands under src/features/        ||
|  +-----------------------------------------------+|
+---------------------------------------------------+
```

**Key architectural patterns**:

- **Feature islands** (`src/features/`): Self-contained feature directories, each owning its own components, hooks, queries, and types.
- **ServiceContext DI** (`src/shared/ServiceContext.tsx`): Dependency injection layer that decouples features from Chrome and browser APIs. Browser services are created in `AppServices.browser.ts`; Storybook/CLI variants swap in mocks via `AppServices.cli.ts`.
- **TanStack Query 5**: All server state management uses `@tanstack/react-query`. The `QueryClientSetup` wrapper provides the client.
- **ErrorBoundary wrapping**: Root-level error boundary in `App.tsx` catches rendering failures.
- **ESLint governance** (`experience-ui/*`): Rules from `experience-ui-governance` enforce story patterns, table state usage, feature island boundaries, and type safety.

**Root component chain**: `AppEntry.tsx` -> `App.tsx` (NotificationsProvider -> ServiceProvider -> QueryClientSetup -> ErrorBoundary -> Routing)

## Project Structure

```
platform-settings-ui/
+-- src/
|   +-- Components/        # Shared React components (AppLink, ErrorBoundary, OopsPage, NoPermissionsPage)
|   +-- features/          # Feature islands (self-contained feature directories)
|   +-- hooks/             # Shared hooks (useAppNavigate)
|   +-- shared/            # DI layer (ServiceContext, AppServices), QueryClientSetup, Storybook docs
|   +-- utils/             # General utilities (mergeToBasename)
|   +-- docs/              # Storybook MDX documentation (Introduction, StorybookMandatoryRules)
|   +-- Routes/            # Page-level route components (currently empty, migrating to features/)
|   +-- App.tsx            # Root app with ServiceProvider + QueryClient + ErrorBoundary
|   +-- AppEntry.tsx       # Module Federation entry point
|   +-- Routing.tsx        # Route definitions
|   +-- App.scss           # Root styles
|   +-- entry.ts           # Webpack entry
|   +-- index.html         # HTML template
+-- .storybook/            # Storybook configuration (main.ts, preview.tsx)
+-- config/                # Build config (jest.setup.ts)
+-- deploy/
|   +-- frontend.yaml      # Frontend Operator (FEO) configuration
+-- docs/                  # Developer documentation (FEO guides, Scalprum references)
+-- eslint-rules/          # ESLint rules documentation (rules provided by experience-ui-governance)
+-- playwright/            # Playwright E2E tests
+-- static/                # Static assets (MSW service worker)
+-- .tekton/               # Konflux CI pipelines (pull-request, push)
+-- ambient-workflows/     # Ambient workflow definitions
+-- build-tools/           # Git submodule (insights-frontend-builder-common)
+-- fec.config.js          # FEC build configuration (appUrl: /settings)
+-- eslint.config.js       # ESLint flat config with custom rules
+-- jest.config.js         # Jest configuration
+-- playwright.config.ts   # Playwright configuration
+-- tsconfig.json          # TypeScript configuration
```

## Tech Stack

- **Framework**: React 18, TypeScript 5 (strict mode)
- **UI Library**: PatternFly 6 (`@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-data-view`)
- **Build Tool**: Webpack via `@redhat-cloud-services/frontend-components-config` (FEC)
- **Server State**: TanStack Query 5 (`@tanstack/react-query`)
- **Routing**: React Router v6
- **Micro-frontend**: Scalprum (`@scalprum/react-core`, `@scalprum/core`)
- **HTTP**: Axios
- **Testing**: Jest + Testing Library (unit), Storybook with play functions (component/integration), Playwright (E2E)
- **Linting**: ESLint with `@redhat-cloud-services/eslint-config-redhat-cloud-services` + `experience-ui-governance` rules
- **CI/CD**: Konflux (Tekton pipelines in `.tekton/`)
- **Node Requirements**: Node >=18.20.8, npm >=8.19.4
- **NO Cypress** -- all component/integration testing uses Storybook

## Development Workflow

### Prerequisites

1. **Node.js and npm**: Node >=18.20.8, npm >=8.19.4
2. **Hosts file setup** (one-time):

```bash
npm run patch:hosts  # May require sudo
# Adds stage.foo.redhat.com and prod.foo.redhat.com to /etc/hosts
```

3. **Red Hat SSO account**: Required for testing against staging/production

### Daily Development

```bash
npm install              # Install dependencies
npm start                # Dev server at https://stage.foo.redhat.com:1337
npm run storybook        # Storybook at http://localhost:6006
npm run verify           # Build + lint + test (pre-PR check)
```

## Code Conventions

### TypeScript Standards

- Use strict mode (enabled in `tsconfig.json`)
- Provide explicit types for function parameters and return values
- Use interfaces for object shapes (`interface Props { ... }`)
- No `any`, no `as any`, no `// @ts-ignore`

### React Patterns

- **Functional components with hooks only** (no class components)
- **Component naming**: PascalCase (`UserCard.tsx`)
- **Utility naming**: kebab-case (`api-utils.ts`)
- **Hook naming**: camelCase starting with `use` (`useAppNavigate.ts`)
- **Navigation**: Use `AppLink` from `src/Components/AppLink` for links; use `useAppNavigate` from `src/hooks/useAppNavigate` for programmatic navigation. Direct imports of `Link` or `useNavigate` from `react-router-dom` are blocked by ESLint.

### Component Structure

```tsx
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Card } from '@patternfly/react-core/dist/dynamic/components/Card';
import './MyComponent.scss';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  const [state, setState] = React.useState(false);

  const handleClick = () => {
    setState(!state);
    onAction?.();
  };

  return (
    <Card>
      <Button onClick={handleClick}>{title}</Button>
    </Card>
  );
};

export default MyComponent;
```

### PatternFly Usage

- Use **PatternFly 6 components** for all UI
- **Dynamic sub-path imports only** — global imports are banned by ESLint:

  ```tsx
  // Correct
  import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
  import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';

  // Wrong — will fail lint
  import { Button } from '@patternfly/react-core';
  ```

- For data tables/lists: prefer `@patternfly/react-data-view` (modern API)
- For common HCC patterns: use `@redhat-cloud-services/frontend-components` (alerts, filters, etc.)
- Use PatternFly CSS variables for all spacing and colors (no hardcoded values)

```scss
.my-component {
  padding: var(--pf-v6-global--spacer--md);
  color: var(--pf-v6-global--Color--100);
}
```

### Chrome Integration

Feature components use `useAppServices()` for Chrome-backed actions. `App.tsx`
creates the browser services from `useChrome()`; stories and tests supply mocks.

```tsx
import { useAppServices } from '../../shared/ServiceContext';

const MyComponent = () => {
  const { updateDocumentTitle, appAction } = useAppServices();

  useEffect(() => {
    updateDocumentTitle('My Page Title');
    appAction('my-page');
  }, []);

  return <div>Content</div>;
};
```

Common Chrome services: `updateDocumentTitle()`, `appAction()`, `isBeta()`, navigation events.

### ESLint Rules (experience-ui-governance)

ESLint rules are provided by the `experience-ui-governance` package under the `experience-ui` plugin namespace. See `eslint-rules/README.md` for the full list.

| Rule | Purpose |
|------|---------|
| `experience-ui/require-use-table-state` | Enforces use of the `useTableState` hook for table components |
| `experience-ui/enforce-story-patterns` | Prohibits querySelector and getBy* inside waitFor in Storybook play functions |
| `experience-ui/no-direct-user-type` | Requires clearAndType helper instead of direct user.type() calls |
| `experience-ui/no-boundary-violations` | Enforces feature island isolation — no cross-feature imports |
| `experience-ui/no-jest-snapshot` | Bans toMatchSnapshot and toMatchInlineSnapshot |

Three preset configs (`recommended`, `stories`, `data-layer`) also enforce restricted imports for `useChrome`, PF globals, `react-router-dom`, and feature flag hooks.

## Testing Strategy

Three testing layers, no Cypress:

### Unit Testing (Jest + Testing Library)

**Location**: `src/**/*.test.{ts,tsx}` (colocated with source)
**Config**: `jest.config.js`

```bash
npm test                  # Run all unit tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # Coverage report
```

Test user behavior, not implementation. Use Testing Library queries (`getByRole`, `getByLabelText`). Mock external dependencies.

### Component / Integration Testing (Storybook)

**Location**: `src/**/*.stories.{ts,tsx}` (colocated with source)
**Config**: `.storybook/main.ts`, `.storybook/preview.tsx`
**Docs**: `src/docs/StorybookMandatoryRules.mdx`, `src/shared/StorybookPatterns.mdx`

```bash
npm run storybook         # Interactive dev mode (port 6006)
npm run test-storybook    # Run play-function tests against running Storybook
npm run test:storybook    # Build + serve + test (CI-ready, self-contained)
```

- Use play functions for interaction testing
- ServiceContext DI allows swapping browser services for mocks in stories
- Custom ESLint rules (`enforce-story-patterns`, `no-direct-user-type`) govern story structure
- See `src/shared/ServiceContextDI.mdx` for DI patterns in stories

### E2E Testing (Playwright)

**Location**: `playwright/*.spec.ts`
**Config**: `playwright.config.ts`

```bash
npx playwright test              # Run all E2E tests
npx playwright test --ui         # Interactive mode
npx playwright test --headed     # See browser
npx playwright show-report       # View HTML report
```

**Configuration**:
- Test directory: `./playwright`
- Base URL: `https://stage.foo.redhat.com:1337` (override with `PLAYWRIGHT_BASE_URL`)
- Browser: Chromium only
- Retries: 2 on CI, 0 locally
- Timeout: 120s per test, 10s per assertion
- Global setup: `@redhat-cloud-services/playwright-test-auth/global-setup` handles Red Hat SSO login
- Storage state: `playwright/.auth/user.json` reused across tests

**Required env vars**: `E2E_USER`, `E2E_PASSWORD`

**Patterns**:
- Use `disableCookiePrompt()` from `@redhat-cloud-services/playwright-test-auth` to block TrustArc prompts
- Prefer role-based selectors (`getByRole`, `getByLabel`)
- Use `waitForLoadState('load')` after navigation

### Accessibility

- WCAG 2.1 AA compliance required
- Use semantic HTML and ARIA attributes
- PatternFly components are accessible by default; always add `aria-label` for icon-only buttons
- Test keyboard navigation (Tab, Enter, Escape, Arrow keys)

## Deployment

### Frontend Operator (FEO)

The `deploy/frontend.yaml` file configures the Frontend Operator for deployment. It defines routes, navigation items, service tiles, and search entries.

**FEO documentation**: `docs/frontend-operator/`

### Konflux CI

Tekton pipelines in `.tekton/` handle CI:
- `platform-settings-ui-pull-request.yaml` -- runs on PRs
- `platform-settings-ui-push.yaml` -- runs on pushes to main

## Common Commands Reference

### Development

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run static` | Serve built files locally |
| `npm run verify` | Build + lint + test (pre-PR check) |

### Testing

| Command | Purpose |
|---------|---------|
| `npm test` | Jest unit tests |
| `npm test -- --watch` | Jest in watch mode |
| `npm test -- --coverage` | Jest with coverage |
| `npm run storybook` | Storybook dev server (port 6006) |
| `npm run test-storybook` | Run Storybook play-function tests |
| `npm run test:storybook` | Build + serve + test Storybook (CI) |
| `npx playwright test` | Playwright E2E tests |
| `npx playwright test --ui` | Playwright interactive UI |

### Linting

| Command | Purpose |
|---------|---------|
| `npm run lint` | Run all linters |
| `npm run lint:js` | ESLint only |
| `npm run lint:js:fix` | ESLint auto-fix |

## Troubleshooting

### Build Errors

**`Module not found` errors**:
```bash
rm -rf node_modules .cache dist
npm install
```

### Dev Server Issues

**Cannot access `https://stage.foo.redhat.com:1337`**:
```bash
cat /etc/hosts | grep foo.redhat.com
# Should see: 127.0.0.1 ... stage.foo.redhat.com prod.foo.redhat.com
npm run patch:hosts  # If missing
```

**Chrome integration not working locally**:
```bash
CHROME_SERVICE=8000 npm start
```

### Test Failures

**Playwright auth errors**:
```bash
export E2E_USER="your-username"
export E2E_PASSWORD="your-password"
npx playwright test
```

**Storybook test failures**:
```bash
npm run build-storybook   # Rebuild Storybook
npm run test-storybook    # Re-run tests
```

### Git Submodule Issues

The `build-tools/` directory is a git submodule:
```bash
git submodule update --init --recursive   # First-time setup
git submodule update --remote build-tools # Update to latest
```

## MCP Servers (AI Assistant Integration)

Configured in `.mcp.json`, automatically loaded by Claude Code:

| Server | Purpose |
|--------|---------|
| `hcc-patternfly-data-view` | PatternFly DataView component docs and examples |
| `hcc-feo-mcp` | Frontend Operator schema validation and templates |

## Support

**Team**: Platform Experience Services
**Slack**: `#platform-experience-services`, `#forum-consoledot-ui`
**Repository**: https://github.com/RedHatInsights/platform-settings-ui
