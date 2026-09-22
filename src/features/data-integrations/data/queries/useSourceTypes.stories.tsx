import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, within } from 'storybook/test';
import { useSourceTypes } from './useSourceTypes';
import { createSourcesHandlers, sourcesDb } from '../mocks/sources';
import { seedSourceTypes } from '../mocks/seed';

/**
 * As with `useSources`, the harness is intentionally plain — it exists so the
 * hook's return value can be asserted on. Consumers are the list (resolving
 * `source_type_id` to a name and icon) and the creation wizard.
 */
const SourceTypesHarness: React.FC = () => {
  const { data, isLoading, isError } = useSourceTypes();

  if (isLoading) {
    return <p>Loading source types</p>;
  }
  if (isError) {
    return <p>Failed to load source types</p>;
  }

  return (
    <div>
      <p>Loaded {data?.length ?? 0} source types</p>
      <ul>
        {data?.map((sourceType) => (
          <li key={sourceType.id}>
            {sourceType.name} — {sourceType.product_name} (
            {sourceType.vendor ?? 'no vendor'})
          </li>
        ))}
      </ul>
    </div>
  );
};

const meta: Meta<typeof SourceTypesHarness> = {
  title: 'Features/DataIntegrations/Data/useSourceTypes',
  component: SourceTypesHarness,
  parameters: {
    msw: { handlers: createSourcesHandlers() },
  },
  beforeEach: () => {
    sourcesDb.reset();
  },
};

export default meta;
type Story = StoryObj<typeof SourceTypesHarness>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('The full catalogue loads', async () => {
      const summary = await canvas.findByText(
        `Loaded ${seedSourceTypes.length} source types`,
      );
      await expect(summary).toBeInTheDocument();
    });

    await step('Each of the four providers is present', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items).toHaveLength(seedSourceTypes.length);

      const amazon = await canvas.findByText(/^amazon —/);
      await expect(amazon).toHaveTextContent('Amazon Web Services');
    });

    await step('Vendor comes through for the Red Hat provider', async () => {
      const openshift = await canvas.findByText(/^openshift —/);
      await expect(openshift).toHaveTextContent('Red Hat');
    });
  },
};
