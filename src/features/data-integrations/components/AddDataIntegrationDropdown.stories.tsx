import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, within } from 'storybook/test';
import {
  waitForModal,
  waitForModalClose,
} from '../../../shared/interactionHelpers';
import AddDataIntegrationDropdown from './AddDataIntegrationDropdown';

/**
 * The "Add data integration" split of providers, adapted from the
 * `IntegrationsDropdown` in sources-ui. Two differences: the items are
 * providers rather than categories, and there are exactly four of them.
 *
 * Picking one opens `AddIntegrationWizard`, which is a placeholder until the
 * creation wizard is rebuilt here. The `{ isOpen, sourceType, onClose }`
 * contract is deliberately stable so the real wizard can drop in without
 * touching this component.
 */
const meta = {
  title: 'Features/DataIntegrations/AddDataIntegrationDropdown',
  component: AddDataIntegrationDropdown,
} satisfies Meta<typeof AddDataIntegrationDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Closed by default; opening reveals both groups and all four providers in
 * order.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Toggle renders closed', async () => {
      const toggle = await canvas.findByRole('button', {
        name: 'Add data integration',
      });
      expect(toggle).toBeEnabled();
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    await step('Opening reveals both groups', async () => {
      await user.click(
        canvas.getByRole('button', { name: 'Add data integration' }),
      );

      // The menu is appended to document.body, outside the story canvas.
      const body = within(document.body);
      await body.findByRole('menuitem', {
        name: 'OpenShift Container Platform',
      });

      expect(body.getByText('Red Hat integrations')).toBeInTheDocument();
      expect(body.getByText('Other cloud providers')).toBeInTheDocument();

      const items = body.getAllByRole('menuitem');
      expect(items.map((item) => item.textContent)).toEqual([
        'OpenShift Container Platform',
        'Amazon Web Services',
        'Google Cloud Platform',
        'Microsoft Azure',
      ]);
    });
  },
};

/**
 * Each provider opens the wizard naming that provider, confirming the selected
 * source type is handed through rather than hardcoded.
 */
export const SelectsEachProvider: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const user = userEvent.setup();

    const providers = [
      'OpenShift Container Platform',
      'Amazon Web Services',
      'Google Cloud Platform',
      'Microsoft Azure',
    ];

    await canvas.findByRole('button', { name: 'Add data integration' });

    for (const provider of providers) {
      await step(`Selecting ${provider} opens its wizard`, async () => {
        await user.click(
          canvas.getByRole('button', { name: 'Add data integration' }),
        );
        await user.click(body.getByRole('menuitem', { name: provider }));

        const modal = await waitForModal();
        expect(
          modal.getByText(
            `The creation wizard for ${provider} is not available yet. It will be added in a follow-up release.`,
          ),
        ).toBeInTheDocument();

        const closeButtons = modal.getAllByRole('button', { name: /close/i });
        await user.click(closeButtons[closeButtons.length - 1]);
        await waitForModalClose();
      });
    }
  },
};

/**
 * Non-admin state. RHCLOUD-50927 wires `isDisabled` to the Kessel permission
 * check; until then callers leave it at the default.
 */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Toggle is disabled', async () => {
      const toggle = await canvas.findByRole('button', {
        name: 'Add data integration',
      });
      expect(toggle).toBeDisabled();
    });
  },
};
