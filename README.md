# Platform Settings UI

Hybrid Cloud Console micro-frontend for `/settings/user-preferences/language` and its descendants. Chrome mounts `./RootApp` at that subtree only. The base URL shows a placeholder; undefined child paths show a not-found page. Language preferences are not implemented yet.

## Local development

Use Node 22 (CI) or Node 24 LTS. Make sure `stage.foo.redhat.com` resolves to `127.0.0.1` in `/etc/hosts`. Run `npm run patch:hosts` if local Console host mappings are missing.

```sh
npm ci
npm start
```

Open `/settings/user-preferences/language` on the local staging URL printed by FEC (typically `https://stage.foo.redhat.com:1337`).

## Build and test

- `npm run build` builds the federated app.
- `npm run verify` runs the build, lint, and Jest checks used by CI.
- `npm run storybook` starts Storybook.
- With FEC running and `E2E_USER` and `E2E_PASSWORD` set, run `npx playwright test` to verify direct loading, refresh, and the child-route fallback in Chrome.

[`deploy/frontend.yaml`](deploy/frontend.yaml) registers the route with Frontend Operator and points Chrome to `/apps/platform-settings-ui/fed-mods.json`. Deployment must supply the `IMAGE`, `IMAGE_TAG`, and `ENV_NAME` parameters.
