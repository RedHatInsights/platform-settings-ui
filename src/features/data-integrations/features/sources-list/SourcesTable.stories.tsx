import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { StorybookMockProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import { clearAndType } from '../../../../shared/interactionHelpers';
import SourcesTable from './SourcesTable';
import {
  createEmptySourcesHandler,
  createErrorSourcesHandler,
  createSourcesHandlers,
  sourcesDb,
} from '../../data/mocks/sources';
import { seedSources } from '../../data/mocks/seed';

/**
 * Wrapper that provides routing for test-runner mode.
 * StorybookMockProvider wraps MemoryRouter to override global decorator.
 */
const SourcesTableWithProviders: React.FC = () => {
  return (
    <StorybookMockProvider bundle="settings" app="data-integrations">
      <MemoryRouter initialEntries={['/settings/data-integrations']}>
        <SourcesTable />
      </MemoryRouter>
    </StorybookMockProvider>
  );
};

const meta: Meta<typeof SourcesTableWithProviders> = {
  title: 'Features/DataIntegrations/SourcesTable',
  component: SourcesTableWithProviders,
  parameters: {
    msw: { handlers: createSourcesHandlers() },
  },
  beforeEach: () => {
    sourcesDb.reset();
  },
} satisfies Meta<typeof SourcesTableWithProviders>;

export default meta;
type Story = StoryObj<typeof SourcesTableWithProviders>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Table renders with all sources', async () => {
      // Wait for first source name to appear (proves table loaded and data fetched)
      await expect(
        canvas.findByText(seedSources[0].name, {}, { timeout: 10000 }),
      ).resolves.toBeInTheDocument();

      // Verify second source also appears
      await expect(
        canvas.findByText(seedSources[1].name),
      ).resolves.toBeInTheDocument();
    });

    await step('Column headers are present', async () => {
      await expect(canvas.findByText('Name')).resolves.toBeInTheDocument();
      await expect(canvas.findByText('Type')).resolves.toBeInTheDocument();
    });
  },
};

export const EmptyState: Story = {
  parameters: {
    msw: { handlers: createEmptySourcesHandler() },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Empty state displays when no sources exist', async () => {
      await expect(
        canvas.findByText('No data integrations', {}, { timeout: 5000 }),
      ).resolves.toBeInTheDocument();

      await expect(
        canvas.findByText(/Get started by adding your first data integration/),
      ).resolves.toBeInTheDocument();
    });
  },
};

export const FilteredEmptyState: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Apply filters that return no results', async () => {
      // Wait for table to load first
      await expect(
        canvas.findByText(seedSources[0].name, {}, { timeout: 5000 }),
      ).resolves.toBeInTheDocument();

      const searchInput = await canvas.findByPlaceholderText('Find by name');
      await clearAndType(user, () => searchInput, 'NonexistentSource');

      await waitFor(async () => {
        await expect(
          canvas.findByText('No results found'),
        ).resolves.toBeInTheDocument();

        await expect(
          canvas.findByText(/No data integrations match the current filters/),
        ).resolves.toBeInTheDocument();
      });
    });

    await step('Clear filters button clears all filters', async () => {
      const clearButton = await canvas.findByRole('button', {
        name: /clear all/i,
      });
      await user.click(clearButton);

      await waitFor(async () => {
        // Table should show data again
        const rows = await canvas.findAllByRole('row');
        await expect(rows.length).toBeGreaterThan(1);
      });
    });
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: { handlers: createErrorSourcesHandler() },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Error state displays on API failure', async () => {
      // Wait for error state - data should not be present
      await waitFor(
        () => {
          expect(
            canvas.queryByText(seedSources[0].name),
          ).not.toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });
  },
};

export const Pagination: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Table loads with data', async () => {
      // Wait for data to load
      await expect(
        canvas.findByText(seedSources[0].name, {}, { timeout: 10000 }),
      ).resolves.toBeInTheDocument();
    });
  },
};

/**
 * Two days old, so `format: 'date'` stays on the relative side of its
 * three-month threshold. Computed rather than seeded, because a fixed
 * timestamp would cross the threshold three months after it was written.
 */
const twoDaysAgo = () =>
  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

/**
 * Pins how the table renders a "Date added" older than three months.
 *
 * `SourceDetailPage.stories.tsx` > `DateAddedMatchesTable` asserts this exact
 * string for this exact source. The two surfaces drifted once already, so if
 * either one changes format, one of the two stories fails.
 */
export const DateAddedFormat: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Date added renders as an absolute date', async () => {
      const nameCell = await canvas.findByText(
        'AWS production account',
        {},
        { timeout: 10000 },
      );
      const row = nameCell.closest('tr');
      expect(row).not.toBeNull();

      // created_at 2026-01-14T09:12:00Z, rendered by DateFormat onlyDate.
      expect(within(row as HTMLElement).getByText('14 Jan 2026')).toBeVisible();
    });
  },
};

/**
 * The other half of `format: 'date'` — under three months old, the column
 * renders relative time instead.
 *
 * `SourceDetailPage.stories.tsx` > `DateAddedRelativeMatchesTable` pins the
 * same source against the same expected string.
 */
export const DateAddedRelativeFormat: Story = {
  beforeEach: () => {
    sourcesDb.update('101', { created_at: twoDaysAgo() });
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Date added renders as relative time', async () => {
      const nameCell = await canvas.findByText(
        'AWS production account',
        {},
        { timeout: 10000 },
      );
      const row = nameCell.closest('tr');
      expect(row).not.toBeNull();

      expect(within(row as HTMLElement).getByText('2 days ago')).toBeVisible();
    });
  },
};

export const SortByType: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Sort by Type column (provider name)', async () => {
      // Wait for data to load
      await expect(
        canvas.findByText(seedSources[0].name, {}, { timeout: 5000 }),
      ).resolves.toBeInTheDocument();

      const typeColumn = await canvas.findByText('Type');
      await user.click(typeColumn);

      await waitFor(async () => {
        const rows = await canvas.findAllByRole('row');
        await expect(rows.length).toBeGreaterThan(1);

        // After ascending sort, "Amazon Web Services" should be first
        const firstDataRow = rows[1];
        await expect(firstDataRow).toHaveTextContent('Amazon Web Services');
      });

      // Click again to reverse sort
      await user.click(typeColumn);

      await waitFor(async () => {
        const rows = await canvas.findAllByRole('row');
        await expect(rows.length).toBeGreaterThan(1);

        // After descending sort, OpenShift should be first (or last alphabetically)
        const firstDataRow = rows[1];
        await expect(firstDataRow).toHaveTextContent(
          /OpenShift|Microsoft Azure/,
        );
      });
    });
  },
};

/**
 * The toolbar carries its own "Add integration" dropdown, as primary: the page
 * header offers the same thing, but it scrolls out of reach on a long list.
 */
export const AddIntegrationFromToolbar: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // The dropdown menu and the wizard are both appended to the body.
    const body = within(document.body);
    const user = userEvent.setup();

    await step('The toolbar offers the providers', async () => {
      await user.click(
        await canvas.findByRole('button', { name: 'Add integration' }),
      );

      await expect(
        body.findByRole('menuitem', { name: 'OpenShift Container Platform' }),
      ).resolves.toBeInTheDocument();
    });

    await step('Picking one opens the wizard on naming', async () => {
      await user.click(body.getByRole('menuitem', { name: 'Microsoft Azure' }));

      await body.findByRole('heading', { name: 'Name integration' });
      await expect(
        body.getByText('Enter a name for your Microsoft Azure integration.'),
      ).toBeInTheDocument();
    });
  },
};
