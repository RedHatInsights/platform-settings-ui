import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import AddIntegrationWizard from './AddIntegrationWizard';
import {
  createFailingApplicationHandlers,
  createFailingSourceTypesHandler,
  createPendingSourceTypesHandler,
  createSourceTypesSubsetHandler,
  createSourcesHandlers,
} from '../data/mocks/sources';
import { clearAndType, waitForModal } from '../../../shared/interactionHelpers';

/**
 * The Add Data Integration wizard, built as a data-driven-forms schema — see
 * `wizard/integrationWizardSchema.ts`.
 *
 * Four steps: choose a provider, name the integration, select which
 * applications will consume data from it, and review the choices. The
 * primary button on the review step is the wizard's submit button,
 * labelled "Add".
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

    await step(
      'Next moves on to naming, which names the provider',
      async () => {
        await user.click(modal.getByRole('button', { name: 'Next' }));

        await modal.findByRole('heading', { name: 'Name integration' });
        expect(
          modal.getByText(
            'Enter a name for your Amazon Web Services integration.',
          ),
        ).toBeInTheDocument();
        expect(
          modal.getByRole('textbox', { name: 'Integration name' }),
        ).toHaveValue('');
      },
    );

    await step('Naming the integration enables Next again', async () => {
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
      );

      await clearAndType(
        user,
        () => modal.getByRole('textbox', { name: 'Integration name' }),
        'aws-production',
      );

      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
    });

    await step(
      'Next moves to application selection, showing compatible apps',
      async () => {
        await user.click(modal.getByRole('button', { name: 'Next' }));

        await modal.findByRole('heading', { name: 'Select applications' });
        // AWS shows Cost Management only, not RHEL management
        expect(
          modal.getByRole('checkbox', { name: 'Cost Management' }),
        ).toBeInTheDocument();
        expect(
          modal.queryByRole('checkbox', { name: /RHEL management/i }),
        ).not.toBeInTheDocument();
      },
    );

    await step(
      'Next is disabled until an application is selected',
      async () => {
        await waitFor(() =>
          expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
        );

        await user.click(
          modal.getByRole('checkbox', { name: 'Cost Management' }),
        );

        await waitFor(() =>
          expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
        );
      },
    );

    await step('Next moves to review, showing selected choices', async () => {
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await modal.findByRole('heading', {
        name: 'Review integration details',
      });
      expect(modal.getByText('Amazon Web Services')).toBeInTheDocument();
      expect(modal.getByText('aws-production')).toBeInTheDocument();
      expect(modal.getByText('Cost Management')).toBeInTheDocument();
    });

    await step('Add button is present on the review step', async () => {
      expect(modal.getByRole('button', { name: 'Add' })).toBeEnabled();
    });
  },
};

/**
 * Opened from a dropdown with the provider already picked, which is how every
 * entry point in the app opens it. The provider step is answered, so the
 * wizard starts on naming rather than asking the same question twice.
 */
export const PreSelected: Story = {
  args: { sourceType: 'azure' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await step('It opens on the naming step, not the first', async () => {
      await modal.findByRole('heading', { name: 'Name integration' });

      expect(
        modal.getByText('Enter a name for your Microsoft Azure integration.'),
      ).toBeInTheDocument();
      expect(modal.queryByRole('radio')).not.toBeInTheDocument();
    });

    await step('Back returns to the provider step, choice intact', async () => {
      await user.click(modal.getByRole('button', { name: 'Back' }));

      const azure = await modal.findByRole('radio', {
        name: 'Microsoft Azure',
      });
      expect(azure).toBeChecked();
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
 * Opened for a provider the catalogue turns out not to offer — a stale
 * dropdown, or a deep link. The pre-selection is dropped rather than carried
 * as an answer no card can show, so the wizard asks the question instead of
 * skipping it.
 */
export const PreSelectedUnavailable: Story = {
  args: { sourceType: 'azure' },
  parameters: {
    msw: {
      handlers: createSourceTypesSubsetHandler([
        'openshift',
        'amazon',
        'google',
      ]),
    },
  },
  play: async ({ step }) => {
    const modal = within(document.body);

    await step(
      'It opens on the provider step with nothing chosen',
      async () => {
        await modal.findByRole('radio', { name: 'Amazon Web Services' });

        expect(
          modal.queryByRole('radio', { name: 'Microsoft Azure' }),
        ).not.toBeInTheDocument();
        expect(
          modal.queryByRole('heading', { name: 'Name integration' }),
        ).not.toBeInTheDocument();

        for (const radio of modal.getAllByRole('radio')) {
          expect(radio).not.toBeChecked();
        }
      },
    );

    await step(
      'The unanswered step still gates the primary button',
      async () => {
        // Waited for: the cards mount before final-form has run the validator,
        // so Next is briefly enabled on the first paint.
        await waitFor(() =>
          expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
        );
      },
    );
  },
};

/**
 * A catalogue that offers none of the providers we have cards for. There is
 * nothing to choose and the required card field could never be satisfied, so
 * this is treated the same as a catalogue that failed to load.
 */
export const NoProvidersOffered: Story = {
  parameters: {
    msw: { handlers: createSourceTypesSubsetHandler([]) },
  },
  play: async ({ args, step }) => {
    const user = userEvent.setup();
    const modal = await waitForModal();

    await step('The wizard reports itself unavailable', async () => {
      await modal.findByText('Unable to load integration types');
      expect(modal.queryByRole('radio')).not.toBeInTheDocument();
    });

    await step('Closing is the only action offered', async () => {
      await user.click(modal.getByRole('button', { name: 'Close' }));
      expect(args.onClose).toHaveBeenCalledTimes(1);
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
    const nameField = () =>
      body.getByRole('textbox', { name: 'Integration name' });

    await body.findByRole('heading', { name: 'Name integration' });
    await clearAndType(user, nameField, 'aws-production');

    await step('Cancel raises the confirmation', async () => {
      await user.click(body.getByRole('button', { name: 'Cancel' }));
      await body.findByText('Exit integration creation?');
      expect(args.onClose).not.toHaveBeenCalled();
    });

    await step('Staying returns to the wizard, answers intact', async () => {
      await user.click(body.getByRole('button', { name: 'Stay' }));
      await waitFor(() =>
        expect(
          body.queryByText('Exit integration creation?'),
        ).not.toBeInTheDocument(),
      );

      expect(nameField()).toHaveValue('aws-production');
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
 * OpenShift shows RHEL management only, not Cost Management.
 * Verifies the source type compatibility filter works in the other direction.
 */
export const OpenShiftApplications: Story = {
  args: { sourceType: 'openshift' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'ocp-east',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await step(
      'OpenShift shows RHEL management, not Cost Management',
      async () => {
        await modal.findByRole('heading', { name: 'Select applications' });
        expect(
          modal.getByRole('checkbox', { name: 'RHEL management' }),
        ).toBeInTheDocument();
        expect(
          modal.queryByRole('checkbox', { name: 'Cost Management' }),
        ).not.toBeInTheDocument();
      },
    );

    await step('Selecting the application enables Next', async () => {
      await user.click(
        modal.getByRole('checkbox', { name: 'RHEL management' }),
      );

      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
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

/**
 * Reaching the application step without selecting anything shows the
 * validation error when the field is touched then emptied.
 */
export const NoApplicationSelected: Story = {
  args: { sourceType: 'amazon' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-test',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await step(
      'Application step shows with no checkboxes selected',
      async () => {
        await modal.findByRole('heading', { name: 'Select applications' });

        const checkboxes = modal.getAllByRole('checkbox');
        for (const cb of checkboxes) {
          expect(cb).not.toBeChecked();
        }
      },
    );

    await step('Next is disabled when nothing is selected', async () => {
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
      );
    });

    await step(
      'Selecting and deselecting shows the validation error',
      async () => {
        // Select then deselect to trigger touched + empty validation
        await user.click(
          modal.getByRole('checkbox', { name: 'Cost Management' }),
        );
        await user.click(
          modal.getByRole('checkbox', { name: 'Cost Management' }),
        );

        await waitFor(() =>
          expect(
            modal.queryByText('Select at least one application to continue.'),
          ).toBeInTheDocument(),
        );
      },
    );
  },
};

/**
 * Source creation succeeds but application association fails. The wizard
 * closes and shows a warning notification rather than a success.
 */
export const PartialFailure: Story = {
  args: { sourceType: 'amazon' },
  parameters: {
    msw: { handlers: createFailingApplicationHandlers() },
    a11y: { test: 'error' },
  },
  play: async ({ args, step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    // Walk through the wizard to the review step
    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-partial',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await modal.findByRole('heading', { name: 'Select applications' });
    await user.click(modal.getByRole('checkbox', { name: 'Cost Management' }));
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await modal.findByRole('heading', {
      name: 'Review integration details',
    });

    await step(
      'Submitting with failing app creation closes the wizard',
      async () => {
        await user.click(modal.getByRole('button', { name: 'Add' }));

        await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
      },
    );

    await step(
      'A warning notification appears and can be dismissed',
      async () => {
        // The notification is dispatched through Redux after submission and
        // renders asynchronously via the notifications portal.
        const notificationTitle = await modal.findByText(
          /aws-partial was created/,
        );

        // Dismiss the notification so its h4 heading (hardcoded by PF Alert)
        // does not leave an invalid heading order in the DOM for the
        // post-play a11y check.
        const alertContainer = notificationTitle.closest(
          '.pf-v6-c-alert',
        ) as HTMLElement;
        await user.click(
          within(alertContainer).getByRole('button', { name: /close/i }),
        );
        await waitFor(() =>
          expect(
            modal.queryByText(/aws-partial was created/),
          ).not.toBeInTheDocument(),
        );
      },
    );
  },
};
