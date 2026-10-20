import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { eventTypesHandlers } from './data/mocks/eventTypes';
import { eventTypeEndpointsHandlers } from './data/mocks/eventTypeEndpoints';
import AlertManagerPage from './AlertManagerPage';

const openHelpTopic = fn();

const meta = {
  title: 'Features/AlertManager/AlertManagerPage',
  component: AlertManagerPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/settings/alertmanager']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  beforeEach: () => {
    openHelpTopic.mockClear();
  },
} satisfies Meta<typeof AlertManagerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    services: { openHelpTopic },
    msw: {
      handlers: [
        eventTypesHandlers.success(),
        eventTypeEndpointsHandlers.success(),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Learn more opens the help topic', async () => {
      await userEvent.click(
        await canvas.findByRole('link', { name: /learn more/i }),
      );
      expect(openHelpTopic).toHaveBeenCalledWith('learn');
    });
  },
};
