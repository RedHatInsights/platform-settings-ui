import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, within } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { StorybookMockProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import AboutTab from './AboutTab';
import { DOCS_URL, PROVIDER_DOCS_URLS } from '../../constants/docs';

/**
 * The About tab renders no server state, so no MSW handlers are needed — only
 * routing, which the wizard reaches for when it opens.
 */
const AboutTabWithProviders: React.FC<{ canWrite?: boolean }> = ({
  canWrite,
}) => (
  <StorybookMockProvider bundle="settings" app="data-integrations">
    <MemoryRouter initialEntries={['/settings/data-integrations?tab=about']}>
      <AboutTab canWrite={canWrite} />
    </MemoryRouter>
  </StorybookMockProvider>
);

const meta: Meta<typeof AboutTabWithProviders> = {
  title: 'Features/DataIntegrations/AboutTab',
  component: AboutTabWithProviders,
} satisfies Meta<typeof AboutTabWithProviders>;

export default meta;
type Story = StoryObj<typeof AboutTabWithProviders>;

export const Default: Story = {
  args: { canWrite: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Hero section renders', async () => {
      await expect(
        canvas.findByRole('heading', {
          name: 'Get started with Data Integration',
        }),
      ).resolves.toBeInTheDocument();
    });

    await step('All four use-case cards render', async () => {
      // Asserted as headings, not plain text: the provider names nest under
      // the "Use cases" h2 so the grid is navigable by heading.
      for (const title of [
        'Amazon Web Services (AWS)',
        'Microsoft Azure',
        'Google Cloud Platform (GCP)',
        'Red Hat OpenShift Container Platform',
      ]) {
        await expect(
          canvas.findByRole('heading', { level: 3, name: title }),
        ).resolves.toBeInTheDocument();
      }
    });

    await step('Learn more links point at the per-provider docs', async () => {
      const awsLink = await canvas.findByRole('link', {
        name: 'Learn more about Amazon Web Services (AWS) integrations',
      });
      await expect(awsLink).toHaveAttribute('href', PROVIDER_DOCS_URLS.amazon);
      await expect(awsLink).toHaveAttribute('target', '_blank');
    });

    await step('Read documentation opens the guide', async () => {
      const docsButton = await canvas.findByRole('link', {
        name: 'Read documentation',
      });
      await expect(docsButton).toHaveAttribute('href', DOCS_URL);
    });

    await step('Footer links to the learning resources page', async () => {
      await expect(
        await canvas.findByRole('link', {
          name: 'View all Settings learning resources',
        }),
      ).toHaveAttribute('href', '/settings/learning-resources');
    });

    await step(
      'Add integration opens the wizard for that provider',
      async () => {
        await user.click(
          await canvas.findByRole('button', {
            name: 'Add Microsoft Azure integration',
          }),
        );

        // The wizard renders in a portal, so query the document rather than the
        // story canvas.
        await expect(
          within(document.body).findByRole('dialog'),
        ).resolves.toBeInTheDocument();
      },
    );
  },
};

export const NonAdmin: Story = {
  args: { canWrite: false },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Add integration is disabled on every card', async () => {
      const addButtons = await canvas.findAllByRole('button', {
        name: /^Add .* integration$/,
      });

      await expect(addButtons).toHaveLength(4);

      for (const button of addButtons) {
        // isAriaDisabled keeps the button focusable so the explanatory tooltip
        // stays reachable, so assert the ARIA state rather than the property.
        await expect(button).toHaveAttribute('aria-disabled', 'true');
      }
    });

    await step(
      'Clicking a disabled action does not open the wizard',
      async () => {
        await user.click(
          await canvas.findByRole('button', {
            name: 'Add Microsoft Azure integration',
          }),
        );

        await expect(
          within(document.body).queryByRole('dialog'),
        ).not.toBeInTheDocument();
      },
    );

    await step('Documentation links stay available', async () => {
      await expect(
        canvas.findByRole('link', { name: 'Read documentation' }),
      ).resolves.toBeInTheDocument();
    });
  },
};
