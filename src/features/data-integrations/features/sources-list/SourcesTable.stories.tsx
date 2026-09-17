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
  title: 'features/data-integrations/SourcesTable',
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
