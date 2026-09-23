---
name: troubleshooting
description: Fixes for platform-settings-ui local environment failures — module-not-found build errors, the stage.foo.redhat.com hosts-file requirement, Chrome integration not loading locally, Storybook test failures, and the build-tools git submodule. Use when the dev server, build, or tests fail to start locally.
---

# Troubleshooting

## Build Errors

**`Module not found` errors**:
```bash
rm -rf node_modules .cache dist
npm install
```

## Dev Server Issues

**Cannot access `https://stage.foo.redhat.com:1337`** — the hosts file entry is missing:
```bash
cat /etc/hosts | grep foo.redhat.com
# Should see: 127.0.0.1 ... stage.foo.redhat.com prod.foo.redhat.com
npm run patch:hosts  # If missing; may require sudo
```

**Chrome integration not working locally**:
```bash
CHROME_SERVICE=8000 npm start
```

## Test Failures

**Playwright auth errors** — see the `e2e-testing` skill; `E2E_USER` and `E2E_PASSWORD` must be exported.

**Storybook test failures**:
```bash
npm run build-storybook   # Rebuild Storybook
npm run test-storybook    # Re-run tests
```

## Git Submodule Issues

The `build-tools/` directory is a git submodule:
```bash
git submodule update --init --recursive   # First-time setup
git submodule update --remote build-tools # Update to latest
```
