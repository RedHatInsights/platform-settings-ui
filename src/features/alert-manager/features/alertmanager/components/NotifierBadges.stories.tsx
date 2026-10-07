import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, within } from 'storybook/test';
import type { NotifierSummary } from '../types';
import NotifierBadges from './NotifierBadges';

const meta = {
  title: 'Features/AlertManager/NotifierBadges',
  component: NotifierBadges,
} satisfies Meta<typeof NotifierBadges>;

export default meta;
type Story = StoryObj<typeof meta>;

const emailNotifier: NotifierSummary = {
  type: 'email_subscription',
  label: 'Email',
};

const slackNotifier: NotifierSummary = {
  type: 'camel',
  subType: 'slack',
  label: 'Slack',
};

const teamsNotifier: NotifierSummary = {
  type: 'camel',
  subType: 'teams',
  label: 'Teams',
};

const googleChatNotifier: NotifierSummary = {
  type: 'camel',
  subType: 'google_chat',
  label: 'Google Chat',
};

const webhookNotifier: NotifierSummary = {
  type: 'webhook',
  label: 'Webhook',
};

const pagerdutyNotifier: NotifierSummary = {
  type: 'pagerduty',
  label: 'PagerDuty',
};

const drawerNotifier: NotifierSummary = {
  type: 'drawer',
  label: 'Drawer',
};

const ansibleNotifier: NotifierSummary = {
  type: 'ansible',
  label: 'Ansible',
};

/**
 * Shows a single email notifier label.
 */
export const SingleNotifier: Story = {
  args: {
    notifiers: [emailNotifier],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Displays Email label', async () => {
      expect(canvas.getByText('Email')).toBeInTheDocument();
    });
  },
};

/**
 * Shows multiple notifier labels with different icons.
 */
export const MultipleNotifiers: Story = {
  args: {
    notifiers: [emailNotifier, slackNotifier, webhookNotifier],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Displays all notifier labels', async () => {
      expect(canvas.getByText('Email')).toBeInTheDocument();
      expect(canvas.getByText('Slack')).toBeInTheDocument();
      expect(canvas.getByText('Webhook')).toBeInTheDocument();
    });

    await step('Three labels are rendered', async () => {
      // Each notifier renders as a Label with its text content
      const allLabels = canvas.getAllByText(/Email|Slack|Webhook/);
      expect(allLabels.length).toBe(3);
    });
  },
};

/**
 * Shows the empty state with "No notifiers" label.
 */
export const EmptyState: Story = {
  args: {
    notifiers: [],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Displays no notifiers label', async () => {
      expect(canvas.getByText('No notifiers')).toBeInTheDocument();
    });
  },
};

/**
 * Shows all available integration type icons.
 */
export const AllIntegrationTypes: Story = {
  args: {
    notifiers: [
      emailNotifier,
      slackNotifier,
      teamsNotifier,
      googleChatNotifier,
      webhookNotifier,
      pagerdutyNotifier,
      drawerNotifier,
      ansibleNotifier,
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Displays all integration types', async () => {
      expect(canvas.getByText('Email')).toBeInTheDocument();
      expect(canvas.getByText('Slack')).toBeInTheDocument();
      expect(canvas.getByText('Teams')).toBeInTheDocument();
      expect(canvas.getByText('Google Chat')).toBeInTheDocument();
      expect(canvas.getByText('Webhook')).toBeInTheDocument();
      expect(canvas.getByText('PagerDuty')).toBeInTheDocument();
      expect(canvas.getByText('Drawer')).toBeInTheDocument();
      expect(canvas.getByText('Ansible')).toBeInTheDocument();
    });

    await step('All eight notifier labels are rendered', async () => {
      const allLabels = canvas.getAllByText(
        /Email|Slack|Teams|Google Chat|Webhook|PagerDuty|Drawer|Ansible/,
      );
      expect(allLabels.length).toBe(8);
    });

    await step('Camel sub-type icons render as images', async () => {
      const slackImg = canvas.getByRole('img', { name: '' });
      expect(slackImg).toBeInTheDocument();
    });
  },
};

/**
 * Shows overflow behavior with LabelGroup when many notifiers present.
 */
export const OverflowLabels: Story = {
  args: {
    notifiers: [
      emailNotifier,
      slackNotifier,
      teamsNotifier,
      googleChatNotifier,
      webhookNotifier,
      pagerdutyNotifier,
      drawerNotifier,
      ansibleNotifier,
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('All labels render within LabelGroup', async () => {
      const allLabels = canvas.getAllByText(
        /Email|Slack|Teams|Google Chat|Webhook|PagerDuty|Drawer|Ansible/,
      );
      expect(allLabels.length).toBe(8);
    });
  },
};
