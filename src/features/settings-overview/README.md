# Settings Overview Feature

Landing page for the Settings application, providing an overview and navigation to key settings features.

## Structure

```
settings-overview/
├── components/
│   ├── AboutPage.tsx              # Main page component
│   ├── AboutPage.scss             # Page styles
│   └── AboutPage.stories.tsx      # Storybook stories
├── messages.ts                    # i18n messages
├── index.ts                       # Exports
└── README.md
```

## Features

### About Page

The About page serves as the main landing page for the Settings application at `/settings`. It provides:

1. **Feature Cards**
   - Alert Manager card with primary button linking to `/settings/alert-manager`
   - Data Integrations card with secondary button linking to `/settings/data-integrations`
   - Cards use PatternFly Card component with `isFullHeight` for consistent sizing

2. **Use Cases Section**
   - Expandable rows showing common workflows
   - First use case expanded by default
   - Secondary button styling for action buttons
   - Uses PatternFly ExpandableSection components

3. **Recommended Content**
   - List of helpful resources
   - Links to documentation and guides (URLs TBD)

4. **Responsive Layout**
   - Grid layout with PatternFly Grid component
   - Cards stack vertically on mobile devices
   - Two-column layout on larger screens (lg breakpoint)

## Architecture Notes

- **MVP**: Tabs are NOT implemented for the initial release. The About content is rendered directly.
- **Post-MVP**: Dashboard and About tabs will be added to the page structure.
- **Header Pattern**: Follows the same pattern as Alert Manager page with icon, divider, title, and description.
- **Icon**: Uses `/apps/frontend-assets/technology-icons/settings.svg` (served by Chrome shell)
- **Navigation**: Uses AppLink component for all internal links (enforced by ESLint)

## Testing

### Storybook Stories

Located in `AboutPage.stories.tsx`, covering:

1. **Default** - Renders all page elements
2. **ExpandableUseCases** - Tests use case expand/collapse interactions
3. **NavigationLinks** - Verifies all navigation links
4. **RecommendedContent** - Tests recommended content items
5. **ResponsiveLayout** - Visual test for mobile viewport

All stories include play function tests for automated interaction testing.

### Running Tests

```bash
npm run storybook          # Interactive development
npm run test-storybook     # Run play function tests
npm run test:storybook     # Build + serve + test (CI)
```

## Usage

The AboutPage is automatically registered in the application's routing at `/settings` (root path).

```tsx
// Routing.tsx
const AboutPage = lazy(() =>
  import('./features/settings-overview').then(
    (module) => ({ default: module.AboutPage })
  )
);
```

## Future Enhancements

1. Add Dashboard tab with metrics and activity overview
2. Implement tab navigation structure (currently deferred post-MVP)
3. Add real links for recommended content items
4. Add learning resources integration via help topics
