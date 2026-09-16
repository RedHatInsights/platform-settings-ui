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
import {
  seedApplicationTypes,
  seedSourceTypes,
  seedSources,
} from '../../data/mocks/seed';

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
    const user = userEvent.setup();

    await step('Table renders with all sources', async () => {
      // Wait for first source name to appear (proves table loaded and data fetched)
      await expect(
        canvas.findByText(seedSources[0].name, {}, { timeout: 5000 }),
      ).resolves.toBeInTheDocument();

      // Find rows within the table element only (not pagination/toolbar)
      const table = await canvas.findByRole('table');
      const tableScope = within(table);
      const rows = tableScope.getAllByRole('row');
      // seedSources has 9 sources + 1 header row = 10 total
      await expect(rows).toHaveLength(seedSources.length + 1);
    });

    await step('All column headers are present', async () => {
      await expect(canvas.findByText('Name')).resolves.toBeInTheDocument();
      await expect(canvas.findByText('Type')).resolves.toBeInTheDocument();
      await expect(
        canvas.findByText('Connected applications'),
      ).resolves.toBeInTheDocument();
      await expect(canvas.findByText('Date added')).resolves.toBeInTheDocument();
      await expect(canvas.findByText('Status')).resolves.toBeInTheDocument();
    });

    await step('First row displays correctly', async () => {
      // Name should be a link
      const firstSource = seedSources[0];
      const nameLink = await canvas.findByRole('link', {
        name: firstSource.name,
      });
      await expect(nameLink).toBeInTheDocument();
      await expect(nameLink).toHaveAttribute(
        'href',
        expect.stringContaining(`/data-integrations/${firstSource.id}`),
      );

      // Type should show product name
      const sourceType = seedSourceTypes.find(
        (type) => type.id === firstSource.source_type_id,
      );
      await expect(
        canvas.findByText(sourceType!.product_name!),
      ).resolves.toBeInTheDocument();

      // Status badge should be present
      await expect(canvas.findByText('Available')).resolves.toBeInTheDocument();
    });

    await step('Connected applications display with status icons', async () => {
      // Find a source with applications
      const sourceWithApps = seedSources.find(
        (s) => s.applications && s.applications.length > 0,
      );
      const firstApp = sourceWithApps!.applications![0];
      const appType = seedApplicationTypes.find(
        (type) => type.id === firstApp.application_type_id,
      );

      await expect(
        canvas.findByText(appType!.display_name),
      ).resolves.toBeInTheDocument();
    });

    await step('Search by name filters the table', async () => {
      const searchInput = await canvas.findByPlaceholderText('Find by name');
      await clearAndType(user, () => searchInput, 'AWS');

      await waitFor(async () => {
        const rows = await canvas.findAllByRole('row');
        // Should show only AWS sources (3: production, sandbox, development) + header
        await expect(rows.length).toBeLessThan(seedSources.length + 1);
      });

      // Clear search
      await user.clear(searchInput);
    });

    await step('Filter by integration type', async () => {
      const filterButton = await canvas.findByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Select OpenShift filter
      const openshiftCheckbox = await canvas.findByRole('checkbox', {
        name: /OpenShift Container Platform/i,
      });
      await user.click(openshiftCheckbox);

      await waitFor(async () => {
        // Should show only OpenShift sources (2) + header
        const rows = await canvas.findAllByRole('row');
        await expect(rows.length).toBeLessThan(seedSources.length + 1);
      });
    });

    await step('Sort by Date added column', async () => {
      const dateColumn = await canvas.findByText('Date added');
      await user.click(dateColumn);

      await waitFor(async () => {
        // After toggling sort (from desc to asc), oldest should be first
        const rows = await canvas.findAllByRole('row');
        await expect(rows.length).toBeGreaterThan(1);

        // Verify first data row changed (oldest source after sort toggle)
        const firstDataRow = rows[1]; // Skip header row
        await expect(firstDataRow).toHaveTextContent('AWS production account');
      });
    });
  },
};

export const EmptyState: Story = {
  parameters: {
    msw: { handlers: [createEmptySourcesHandler()] },
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
    msw: { handlers: [createErrorSourcesHandler()] },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Error state displays on API failure', async () => {
      await expect(
        canvas.findByRole('heading', { name: /something went wrong/i }, { timeout: 5000 }),
      ).resolves.toBeInTheDocument();
    });
  },
};

export const Pagination: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Table loads with default pagination', async () => {
      // Wait for data to load
      await expect(
        canvas.findByText(seedSources[0].name, {}, { timeout: 5000 }),
      ).resolves.toBeInTheDocument();

      const table = await canvas.findByRole('table');
      const tableScope = within(table);
      const rows = tableScope.getAllByRole('row');
      await expect(rows).toHaveLength(seedSources.length + 1);
    });

    await step('Change page size', async () => {
      // Open page size dropdown
      const pageSizeButton = await canvas.findByRole('button', { name: /per page/i });
      await user.click(pageSizeButton);

      // Select 10 per page
      const option10 = await canvas.findByRole('option', { name: '10' });
      await user.click(option10);

      await waitFor(async () => {
        // Should still show all rows since we only have 9 sources
        const table = await canvas.findByRole('table');
        const tableScope = within(table);
        const rows = tableScope.getAllByRole('row');
        await expect(rows).toHaveLength(seedSources.length + 1);
      });
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
