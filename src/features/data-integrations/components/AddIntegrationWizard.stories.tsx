import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import AddIntegrationWizard from './AddIntegrationWizard';
import {
  createFailingSourceTypesHandler,
  createPendingSourceTypesHandler,
  createSourcesHandlers,
} from '../data/mocks/sources';
import { waitForModal } from '../../../shared/interactionHelpers';

/**
 * The Add Data Integration wizard, built as a data-driven-forms schema — see
 * `wizard/integrationWizardSchema.ts`.
 *
 * Only the source type step exists so far, so the primary button is the
 * wizard's submit button labelled "Next"; the auth, application and review
 * steps arrive in the follow-up stories and turn it into real navigation.
 *
 * The cards are a radio group, which is why every assertion here reaches for
 * them by `role: 'radio'` — doing so also proves each card carries the
 * provider's name as its accessible name.
 */
const meta = {
  title: 'Features/DataIntegrations/AddIntegrationWizard',
  component: AddIntegrationWizard,
  args: {
    isOpen: true,
    onClose: fn(),
  },
  parameters: {
    // Failing rather than warning on axe findings: the wizard is a modal
    // dialog built by a third-party mapper, and the two accessible-name
    // problems it shipped with were only visible once this was an error.
    a11y: { test: 'error' },
    msw: { handlers: createSourcesHandlers() },
  },
} satisfies Meta<typeof AddIntegrationWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Opened with no provider chosen. Nothing is selected, the primary button is
 * disabled by the `REQUIRED` validator, and picking a card enables it.
 */
export const Default: Story = {
  play: async ({ step }) => {
    const user = userEvent.setup();
    // Queried from the body rather than a captured dialog: the loading modal is
    // a different element from the wizard that replaces it, so anything held
    // across the catalogue request goes stale.
    const modal = within(document.body);

    await step(
      'All four providers are offered as one radio group',
      async () => {
        await modal.findByRole('radio', { name: 'Amazon Web Services' });

        const group = modal.getByRole('radiogroup', {
          name: 'Integration type',
        });
        expect(within(group).getAllByRole('radio')).toHaveLength(4);
      },
    );

    await step('Nothing is selected and Next is disabled', async () => {
      for (const radio of modal.getAllByRole('radio')) {
        expect(radio).not.toBeChecked();
      }
      // Waited for rather than asserted outright: the cards mount before
      // final-form has run the field's validator, so Next is briefly enabled
      // on the first paint and the radios can be found during that window.
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
      );
    });

    await step(
      'Back is present but unavailable on the first step',
      async () => {
        expect(modal.getByRole('button', { name: 'Back' })).toBeDisabled();
      },
    );

    await step('Choosing a provider enables Next', async () => {
      await user.click(
        modal.getByRole('radio', { name: 'Amazon Web Services' }),
      );

      expect(
        modal.getByRole('radio', { name: 'Amazon Web Services' }),
      ).toBeChecked();
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
    });
  },
};

/**
 * Opened from the dropdown with a provider already picked. The card is selected
 * through `initialValues`, so the wizard starts valid.
 */
export const PreSelected: Story = {
  args: { sourceType: 'azure' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await step('The provider from the dropdown is selected', async () => {
      const azure = await modal.findByRole('radio', {
        name: 'Microsoft Azure',
      });
      expect(azure).toBeChecked();
      expect(modal.getByRole('button', { name: 'Next' })).toBeEnabled();
    });

    await step('A different provider can be chosen instead', async () => {
      await user.click(
        modal.getByRole('radio', { name: 'Google Cloud Platform' }),
      );

      expect(
        modal.getByRole('radio', { name: 'Google Cloud Platform' }),
      ).toBeChecked();
      expect(
        modal.getByRole('radio', { name: 'Microsoft Azure' }),
      ).not.toBeChecked();
    });
  },
};

/**
 * Cancelling asks for confirmation. Staying leaves the wizard untouched;
 * exiting calls `onClose` with no arguments.
 */
export const CancelAsksForConfirmation: Story = {
  args: { sourceType: 'amazon' },
  play: async ({ args, step }) => {
    const user = userEvent.setup();
    // The confirmation is a second dialog stacked over the wizard, so both live
    // in the body at once — query from there rather than from either one.
    const body = within(document.body);
    await body.findByRole('radio', { name: 'Amazon Web Services' });

    await step('Cancel raises the confirmation', async () => {
      await user.click(body.getByRole('button', { name: 'Cancel' }));
      await body.findByText('Exit integration creation?');
      expect(args.onClose).not.toHaveBeenCalled();
    });

    await step('Staying returns to the wizard, selection intact', async () => {
      await user.click(body.getByRole('button', { name: 'Stay' }));
      await waitFor(() =>
        expect(
          body.queryByText('Exit integration creation?'),
        ).not.toBeInTheDocument(),
      );

      expect(
        body.getByRole('radio', { name: 'Amazon Web Services' }),
      ).toBeChecked();
    });

    await step('Exiting closes the wizard', async () => {
      await user.click(body.getByRole('button', { name: 'Cancel' }));
      await user.click(await body.findByRole('button', { name: 'Exit' }));

      expect(args.onClose).toHaveBeenCalledTimes(1);
      expect(args.onClose).toHaveBeenCalledWith();
    });
  },
};

/**
 * The schema cannot be built without the provider catalogue, so the wizard
 * holds a spinner until `useSourceTypes()` answers.
 */
export const Loading: Story = {
  parameters: {
    msw: { handlers: createPendingSourceTypesHandler() },
  },
  play: async ({ step }) => {
    const modal = await waitForModal();

    await step('A labelled spinner stands in for the wizard', async () => {
      await modal.findByRole('progressbar', {
        name: 'Loading integration types',
      });
      expect(modal.queryByRole('radio')).not.toBeInTheDocument();
    });
  },
};

/**
 * A catalogue that will not load leaves nothing to choose from, so the wizard
 * explains itself and offers only a way out.
 */
export const LoadFailed: Story = {
  parameters: {
    msw: { handlers: createFailingSourceTypesHandler() },
  },
  play: async ({ args, step }) => {
    const user = userEvent.setup();
    const modal = await waitForModal();

    await step('The failure is explained', async () => {
      await modal.findByText('Unable to load integration types');
      expect(modal.queryByRole('radio')).not.toBeInTheDocument();
    });

    await step('Closing is the only action offered', async () => {
      await user.click(modal.getByRole('button', { name: 'Close' }));
      expect(args.onClose).toHaveBeenCalledTimes(1);
    });
  },
};
