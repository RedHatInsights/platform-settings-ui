import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, within } from 'storybook/test';
import { useApplicationTypes } from './useApplicationTypes';
import { createSourcesHandlers, sourcesDb } from '../mocks/sources';
import { seedApplicationTypes } from '../mocks/seed';

/**
 * The harness is intentionally plain — it exists so the hook's return value can
 * be asserted on. Consumers are the list (resolving `application_type_id` to a
 * display name for the "Connected applications" column badges).
 */
const ApplicationTypesHarness: React.FC = () => {
  const { data, isLoading, isError } = useApplicationTypes();

  if (isLoading) {
    return <p>Loading application types</p>;
  }
  if (isError) {
    return <p>Failed to load application types</p>;
  }

  return (
    <div>
      <p>Loaded {data?.length ?? 0} application types</p>
      <ul>
        {data?.map((applicationType) => (
          <li key={applicationType.id}>
            {applicationType.name} — {applicationType.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

const meta: Meta<typeof ApplicationTypesHarness> = {
  title: 'Features/DataIntegrations/Data/useApplicationTypes',
  component: ApplicationTypesHarness,
  parameters: {
    msw: { handlers: createSourcesHandlers() },
  },
  beforeEach: () => {
    sourcesDb.reset();
  },
};

export default meta;
type Story = StoryObj<typeof ApplicationTypesHarness>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('The full catalogue loads', async () => {
      const summary = await canvas.findByText(
        `Loaded ${seedApplicationTypes.length} application types`,
      );
      await expect(summary).toBeInTheDocument();
    });

    await step('Each service is present with its display name', async () => {
      const items = await canvas.findAllByRole('listitem');
      await expect(items).toHaveLength(seedApplicationTypes.length);

      const cost = await canvas.findByText(
        /\/insights\/platform\/cost-management —/,
      );
      await expect(cost).toHaveTextContent('Cost Management');

      const rhel = await canvas.findByText(
        /\/insights\/platform\/rhel-management —/,
      );
      await expect(rhel).toHaveTextContent('RHEL Management');

      const subscriptions = await canvas.findByText(
        /\/insights\/platform\/subscriptions —/,
      );
      await expect(subscriptions).toHaveTextContent('Subscriptions');
    });
  },
};
