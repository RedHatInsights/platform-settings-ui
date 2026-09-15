import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, within } from 'storybook/test';
import { useSources } from './useSources';
import {
  createEmptySourcesHandler,
  createErrorSourcesHandler,
  createSourcesHandlers,
  sourcesDb,
} from '../mocks/sources';
import { APPLICATION_TYPE_RHEL, seedSources } from '../mocks/seed';
import type { SourcesParams } from '../types/sources.types';

/**
 * `useSources` has no UI of its own, so these stories drive it through a
 * deliberately plain harness — the assertions are about what the hook returns
 * for a given set of params, not about how a table renders it. The real
 * consumer is `MyDataIntegrationsTab` (RHCLOUD-50925).
 */
const SourcesHarness: React.FC<SourcesParams> = (params) => {
  const { data, isLoading, isError } = useSources(params);

  if (isLoading) {
    return <p>Loading sources</p>;
  }
  if (isError) {
    return <p>Failed to load sources</p>;
  }

  return (
    <div>
      <p>
        Showing {data?.data.length ?? 0} of {data?.meta.count ?? 0} sources
      </p>
      <ul>
        {data?.data.map((source) => (
          <li key={source.id}>
            {source.name} — {source.availability_status ?? 'unknown'} —{' '}
            {source.applications?.length ?? 0} applications
          </li>
        ))}
      </ul>
    </div>
  );
};

const meta: Meta<typeof SourcesHarness> = {
  title: 'features/data-integrations/data/useSources',
  component: SourcesHarness,
  parameters: {
    msw: { handlers: createSourcesHandlers() },
  },
  beforeEach: () => {
    sourcesDb.reset();
  },
};

export default meta;
type Story = StoryObj<typeof SourcesHarness>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Every seeded source is returned', async () => {
      const summary = await canvas.findByText(
        `Showing ${seedSources.length} of ${seedSources.length} sources`,
      );
      await expect(summary).toBeInTheDocument();
    });

    await step('Applications arrive inline with the list', async () => {
      const available = await canvas.findByText(
        'AWS production account — available — 2 applications',
      );
      await expect(available).toBeInTheDocument();
    });

    await step(
      'A source the checker has not reached has no status',
      async () => {
        const unchecked = await canvas.findByText(
          'Azure staging subscription — unknown — 0 applications',
        );
        await expect(unchecked).toBeInTheDocument();
      },
    );
  },
};

export const FilteredBySourceType: Story = {
  args: {
    // '2' is Amazon Web Services in the seed catalogue.
    sourceTypeIds: ['2'],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Only the two AWS sources survive the filter', async () => {
      const summary = await canvas.findByText('Showing 2 of 2 sources');
      await expect(summary).toBeInTheDocument();
    });

    await step('A source of another type is gone', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items).toHaveLength(2);
      await expect(
        canvas.queryByText(/Azure cost management/),
      ).not.toBeInTheDocument();
    });
  },
};

export const FilteredByName: Story = {
  args: {
    nameContains: 'OpenShift',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Name filter matches on substring', async () => {
      const summary = await canvas.findByText('Showing 2 of 2 sources');
      await expect(summary).toBeInTheDocument();
    });

    await step('Both OpenShift clusters are listed', async () => {
      const east = await canvas.findByText(/OpenShift cluster: east/);
      const west = await canvas.findByText(/OpenShift cluster: west/);
      await expect(east).toBeInTheDocument();
      await expect(west).toBeInTheDocument();
    });
  },
};

/**
 * Filtering on a joined association. This is one of the two things the REST
 * list cannot express — `filter[applications][...]` is rejected, because the
 * query-param parser only recognises `source_type` and `application_type` as
 * subresources.
 */
export const FilteredByApplication: Story = {
  args: {
    applicationTypeIds: [APPLICATION_TYPE_RHEL],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Only sources with RHEL management attached', async () => {
      const summary = await canvas.findByText('Showing 2 of 2 sources');
      await expect(summary).toBeInTheDocument();
    });

    await step('Both are the OpenShift clusters', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items).toHaveLength(2);
      await expect(items[0]).toHaveTextContent('OpenShift cluster: east');
      await expect(items[1]).toHaveTextContent('OpenShift cluster: west');
    });
  },
};

export const SortedByDateAdded: Story = {
  args: {
    sortBy: 'created_at',
    sortDirection: 'desc',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Newest source is first', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items[0]).toHaveTextContent('Google Cloud billing export');
    });

    await step('Oldest source is last', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items[items.length - 1]).toHaveTextContent(
        'AWS production account',
      );
    });
  },
};

/**
 * Sorting on the joined provider catalogue — the table's "Type" column orders
 * by display name, not by the meaningless `source_type_id` foreign key. The
 * other thing the REST list cannot express: `applySortBy` rejects a dotted
 * column name outright.
 */
export const SortedByProviderName: Story = {
  args: {
    sortBy: 'source_type.product_name',
    sortDirection: 'desc',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Last provider alphabetically comes first', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items[0]).toHaveTextContent('OpenShift cluster: west');
    });

    await step(
      'Ordering follows the provider, not the source name',
      async () => {
        const items = await canvas.findAllByRole('listitem');
        // Sorted by name this row would be "Google Cloud billing export";
        // by provider, both Microsoft Azure sources outrank Google Cloud.
        await expect(items[2]).toHaveTextContent('Azure staging subscription');
      },
    );
  },
};

export const SecondPage: Story = {
  args: {
    limit: 3,
    offset: 3,
    sortBy: 'name',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Page holds three rows out of the full count', async () => {
      const summary = await canvas.findByText(
        `Showing 3 of ${seedSources.length} sources`,
      );
      await expect(summary).toBeInTheDocument();
    });

    await step('The offset skipped the first three names', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items).toHaveLength(3);
      await expect(
        canvas.queryByText(/AWS production account/),
      ).not.toBeInTheDocument();
    });
  },
};

export const Empty: Story = {
  parameters: {
    msw: { handlers: [createEmptySourcesHandler()] },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Empty collection renders a zero count', async () => {
      const summary = await canvas.findByText('Showing 0 of 0 sources');
      await expect(summary).toBeInTheDocument();
    });
  },
};

/**
 * GraphQL answers a failed query with 200 and an `errors` array, so this only
 * reaches an error state because the api layer throws on it explicitly.
 */
export const Error: Story = {
  parameters: {
    msw: { handlers: [createErrorSourcesHandler()] },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      'A GraphQL errors array surfaces as an error state',
      async () => {
        const message = await canvas.findByText('Failed to load sources');
        await expect(message).toBeInTheDocument();
      },
    );
  },
};
