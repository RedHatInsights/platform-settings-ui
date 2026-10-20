import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, within } from 'storybook/test';
import EventLogPage from './EventLogPage';
import { createBundlesHandlers } from '../../data/mocks/bundles';
import {
  createEmptyEventsHandler,
  createErrorEventsHandler,
  createEventsHandlers,
  eventsDb,
} from '../../data/mocks/events';
import { seedEvents } from '../../data/mocks/seed';

const meta: Meta<typeof EventLogPage> = {
  title: 'features/alert-manager/EventLogPage',
  component: EventLogPage,
  parameters: {
    msw: { handlers: [...createEventsHandlers(), ...createBundlesHandlers()] },
  },
  beforeEach: () => {
    eventsDb.reset();
  },
};

export default meta;
type Story = StoryObj<typeof EventLogPage>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify page header renders', async () => {
      const heading = await canvas.findByText('Event log');
      await expect(heading).toBeInTheDocument();
    });

    await step('Verify subtitle renders', async () => {
      const subtitle = await canvas.findByText(
        'View events firing in your organization.',
      );
      await expect(subtitle).toBeInTheDocument();
    });

    await step('Verify table loads with events', async () => {
      const firstEvent = await canvas.findByText(seedEvents[0].event_type);
      await expect(firstEvent).toBeInTheDocument();
    });
  },
};

export const NonAdmin: Story = {
  parameters: {
    services: {
      isOrgAdmin: false,
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify unauthorized screen renders', async () => {
      const heading = await canvas.findByText(
        /You do not have access to Event Log/i,
      );
      await expect(heading).toBeInTheDocument();
    });
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [...createBundlesHandlers(), createEmptyEventsHandler()],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify page header still renders', async () => {
      const heading = await canvas.findByText('Event log');
      await expect(heading).toBeInTheDocument();
    });
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [...createBundlesHandlers(), createErrorEventsHandler()],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify page header still renders', async () => {
      const heading = await canvas.findByText('Event log');
      await expect(heading).toBeInTheDocument();
    });
  },
};
