# Feature Islands

Each feature lives in its own folder under `src/features/`. A feature island
is self-contained: components, hooks, data queries, mocks, stories, and docs
all co-located.

```
src/features/
├── <feature-name>/
│   ├── <FeatureName>Page.tsx
│   ├── <FeatureName>Page.stories.tsx
│   ├── components/
│   │   ├── <Component>.tsx
│   │   └── <Component>.stories.tsx
│   ├── data/
│   │   ├── queries/     # TanStack Query hooks
│   │   └── mocks/       # MSW handlers for Storybook
│   ├── hooks/
│   └── README.md
└── README.md            # This file
```

Rules:
- One folder per feature
- Keep related pages and sections inside that island's `components/` and `data/` folders; do not nest another `features/` folder
- Co-locate everything the feature needs
- Features should not import from each other
- Use ServiceContext for Chrome dependencies (see `src/shared/ServiceContextDI.mdx`)
- Use TanStack Query for server state (see `src/shared/WHY-TanStackQuery.md`)
