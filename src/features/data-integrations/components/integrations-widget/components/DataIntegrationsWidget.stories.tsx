import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, within } from 'storybook/test';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DataIntegrationsWidget from './DataIntegrationsWidget';
import {
  mockEmptyIntegrationCounts,
  mockIntegrationCounts,
} from '../__mocks__/integrationCounts';
import { createErrorSourcesHandler } from '../../../data/mocks/sources';

const BASENAME = '/settings/platform-settings';

const meta: Meta<typeof DataIntegrationsWidget> = {
  title: 'Features/DataIntegrations/DataIntegrationsWidget',
  component: DataIntegrationsWidget,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={[`${BASENAME}/`]}>
        <Routes>
          <Route path={`${BASENAME}/*`} element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Data Integrations widget showing counts and quick actions for AWS, Azure, Google Cloud, and OpenShift integrations.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataIntegrationsWidget>;

export const Default: Story = {
  args: {
    integrationCounts: mockIntegrationCounts,
    isLoading: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Renders widget title and manage link', async () => {
      expect(await canvas.findByText('Data integrations')).toBeInTheDocument();
      expect(canvas.getByText('Manage integrations')).toBeInTheDocument();
    });

    await step('Renders all 4 provider cards', async () => {
      expect(canvas.getByText('Amazon Web Services')).toBeInTheDocument();
      expect(canvas.getByText('Microsoft Azure')).toBeInTheDocument();
      expect(canvas.getByText('Google Cloud Platform')).toBeInTheDocument();
      expect(
        canvas.getByText('OpenShift Container Platform'),
      ).toBeInTheDocument();
    });

    await step('Shows integration counts', async () => {
      // Verify integration count buttons exist (AWS, Azure, GCP have 3 each)
      const threeIntegrationsButtons = canvas.getAllByRole('button', {
        name: /3 integrations/i,
      });
      expect(threeIntegrationsButtons).toHaveLength(3);

      // Verify OpenShift has 1 integration
      const openshiftCount = canvas.getByRole('button', {
        name: /1 integration/i,
      });
      expect(openshiftCount).toBeInTheDocument();
    });

    await step('Shows Add buttons for all providers', async () => {
      const addButtons = canvas.getAllByRole('button', { name: /Add/i });
      expect(addButtons).toHaveLength(4);
    });
  },
};

export const EmptyState: Story = {
  args: {
    integrationCounts: mockEmptyIntegrationCounts,
    isLoading: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Shows zero integrations for all providers', async () => {
      const zeroCounts = await canvas.findAllByRole('button', {
        name: /0 integrations/i,
      });
      expect(zeroCounts).toHaveLength(4);
    });
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Shows loading spinner', async () => {
      expect(
        await canvas.findByLabelText('Loading integrations...'),
      ).toBeInTheDocument();
    });
  },
};

export const ErrorState: Story = {
  args: {
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [createErrorSourcesHandler()],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Shows error message when loading fails', async () => {
      const errorMessage = await canvas.findByText(
        'Unable to load integration counts',
      );
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  },
};

export const ClickAddButton: Story = {
  args: {
    integrationCounts: mockIntegrationCounts,
    isLoading: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Click Add button for AWS', async () => {
      const addButton = await canvas.findByRole('button', {
        name: /Add Amazon Web Services/i,
      });
      await user.click(addButton);

      // Navigation will happen in the real app
      // In stories, we're just verifying the button is clickable
    });
  },
};

export const ClickCountLink: Story = {
  args: {
    integrationCounts: mockIntegrationCounts,
    isLoading: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Click integration count link', async () => {
      // Find one of the "3 integrations" buttons (AWS, Azure, or GCP)
      const countLinks = await canvas.findAllByRole('button', {
        name: /3 integrations/i,
      });

      expect(countLinks.length).toBeGreaterThan(0);
      // Click the first one (AWS)
      await user.click(countLinks[0]);

      // Navigation will happen in the real app
    });
  },
};

export const ClickManageLink: Story = {
  args: {
    integrationCounts: mockIntegrationCounts,
    isLoading: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Click Manage integrations link', async () => {
      const manageLink = await canvas.findByText('Manage integrations');
      await user.click(manageLink);

      // Navigation will happen in the real app
    });
  },
};
