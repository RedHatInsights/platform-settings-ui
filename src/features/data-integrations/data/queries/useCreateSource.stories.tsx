import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, within } from 'storybook/test';
import { useCreateSource } from './useCreateSource';
import {
  createFailingBulkCreateHandler,
  createNetworkErrorBulkCreateHandler,
  createSourcesHandlers,
  sourcesDb,
} from '../mocks/sources';
import { extractSourcesErrorDetail } from '../errors';

/**
 * Plain harness, as with the query hooks — it exists so the mutation's states
 * can be asserted on without the wizard around it. The real consumer is the
 * Add data integration wizard's result step.
 */
const CreateSourceHarness: React.FC = () => {
  const { mutate, data, isPending, isError, error, isSuccess } =
    useCreateSource();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          mutate({
            name: 'My AWS integration',
            sourceTypeName: 'amazon',
            authentication: {
              authtype: 'access_key_secret_key',
              username: 'AKIAIOSFODNN7EXAMPLE',
              password: 'secret',
            },
          })
        }
      >
        Create integration
      </button>
      {isPending && <p>Creating</p>}
      {isSuccess && (
        <p>
          Created {data?.name} with id {data?.id}
        </p>
      )}
      {isError && (
        <p>Failed: {extractSourcesErrorDetail(error) ?? 'Unknown error'}</p>
      )}
    </div>
  );
};

const meta: Meta<typeof CreateSourceHarness> = {
  title: 'Features/DataIntegrations/Data/useCreateSource',
  component: CreateSourceHarness,
  parameters: {
    msw: { handlers: createSourcesHandlers() },
  },
  beforeEach: () => {
    sourcesDb.reset();
  },
};

export default meta;
type Story = StoryObj<typeof CreateSourceHarness>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Creating returns the persisted source', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Create integration' }),
      );

      const created = await canvas.findByText(/^Created My AWS integration/);
      await expect(created).toBeInTheDocument();
    });

    await step('The source is added to the collection', async () => {
      await expect(
        sourcesDb
          .findAll()
          .some((source) => source.name === 'My AWS integration'),
      ).toBe(true);
    });
  },
};

export const ApiError: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createFailingBulkCreateHandler(400, 'Name has already been taken'),
        ...createSourcesHandlers(),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("The API's reason is what surfaces", async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Create integration' }),
      );

      const failure = await canvas.findByText(
        'Failed: Name has already been taken',
      );
      await expect(failure).toBeInTheDocument();
    });
  },
};

export const NetworkError: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createNetworkErrorBulkCreateHandler(),
        ...createSourcesHandlers(),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('A request that never lands has no detail to show', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Create integration' }),
      );

      const failure = await canvas.findByText('Failed: Unknown error');
      await expect(failure).toBeInTheDocument();
    });
  },
};
