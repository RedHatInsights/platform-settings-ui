import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { StorybookMockProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import AddIntegrationWizard from './AddIntegrationWizard';
import {
  createFailingBulkCreateHandler,
  createFailingSourceTypesHandler,
  createFlakyBulkCreateHandler,
  createNetworkErrorBulkCreateHandler,
  createPendingSourceTypesHandler,
  createSourceTypesSubsetHandler,
  createSourcesHandlers,
  sourcesDb,
} from '../data/mocks/sources';
import { clearAndType, waitForModal } from '../../../shared/interactionHelpers';

const ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const ARN = 'arn:aws:iam:123456789:role/CostManagement';

/**
 * Walks an AWS wizard that opened pre-selected from naming through to review,
 * taking account authorization and picking Cost Management on the way.
 *
 * Shared because five stories below only differ in what happens once they get
 * there, and the walk itself is already asserted end to end by
 * {@link AmazonHappyPath}.
 */
async function fillAwsDetails(
  user: ReturnType<typeof userEvent.setup>,
  name = 'aws-production',
) {
  const modal = within(document.body);

  await modal.findByRole('heading', { name: 'Name integration' });
  await clearAndType(
    user,
    () => modal.getByRole('textbox', { name: 'Integration name' }),
    name,
  );
  await waitFor(() =>
    expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
  );
  await user.click(modal.getByRole('button', { name: 'Next' }));

  await modal.findByRole('heading', { name: 'Select configuration' });
  await user.click(modal.getByRole('radio', { name: /Account authorization/ }));
  await clearAndType(
    user,
    () => modal.getByRole('textbox', { name: 'Access key ID' }),
    ACCESS_KEY_ID,
  );
  await clearAndType(
    user,
    // By label rather than by role: it is a password input, which has no
    // role. The regex is because PatternFly puts the required asterisk inside
    // the label element, so the text is not an exact match.
    () => modal.getByLabelText(/Secret access key/),
    SECRET_ACCESS_KEY,
  );
  await waitFor(() =>
    expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
  );
  await user.click(modal.getByRole('button', { name: 'Next' }));

  await modal.findByRole('heading', { name: 'Select applications' });
  await user.click(modal.getByRole('checkbox', { name: 'Cost Management' }));
  await waitFor(() =>
    expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
  );
  await user.click(modal.getByRole('button', { name: 'Next' }));

  await modal.findByRole('heading', { name: 'Review details' });
}

/**
 * The Add Data Integration wizard, built as a data-driven-forms schema — see
 * `wizard/integrationWizardSchema.ts`.
 *
 * AWS goes all the way through: provider, name, configuration, applications,
 * review, create. The other three providers stop on the authentication step,
 * which has nothing to offer them until RHCLOUD-51317 — which is also why the
 * configuration and application steps are only ever exercised for AWS here.
 *
 * The cards are a radio group, which is why every assertion here reaches for
 * them by `role: 'radio'` — doing so also proves each card carries the
 * provider's name as its accessible name.
 */
const meta = {
  title: 'Features/DataIntegrations/AddIntegrationWizard',
  component: AddIntegrationWizard,
  // The success screen links to the new integration through `AppLink`, which
  // needs both a router and Chrome's bundle/app to build the basename from.
  decorators: [
    (Story) => (
      <StorybookMockProvider bundle="settings" app="data-integrations">
        <MemoryRouter initialEntries={['/settings/data-integrations']}>
          <Story />
        </MemoryRouter>
      </StorybookMockProvider>
    ),
  ],
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
  beforeEach: () => {
    sourcesDb.reset();
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

    await step('AWS is asked how it wants to be configured', async () => {
      await user.click(modal.getByRole('button', { name: 'Next' }));

      // Red Hat can manage AWS credentials, so the configuration choice
      // replaces the authentication-type question entirely.
      await modal.findByRole('heading', { name: 'Select configuration' });
      expect(
        modal.queryByRole('heading', { name: 'Select authentication type' }),
      ).not.toBeInTheDocument();
    });
  },
};

/**
 * The whole AWS path, ending in a created source.
 */
export const AmazonHappyPath: Story = {
  args: { sourceType: 'amazon' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await fillAwsDetails(user);

    await step('Review shows the answers, and hides the secret', async () => {
      expect(modal.getByText('Amazon Web Services')).toBeInTheDocument();
      expect(modal.getByText('aws-production')).toBeInTheDocument();
      expect(modal.getByText('Cost Management')).toBeInTheDocument();
      expect(modal.getByText('Account authorization')).toBeInTheDocument();
      expect(modal.getByText('Access key')).toBeInTheDocument();

      // The key is recognisable but not readable, and the secret is not on the
      // page in any form — the point of masking is defeated if it is in the
      // DOM behind a style.
      expect(modal.getByText(/^AKIA•+$/)).toBeInTheDocument();
      expect(modal.getByText('Hidden')).toBeInTheDocument();
      expect(document.body).not.toHaveTextContent(SECRET_ACCESS_KEY);
    });

    await step('Review submits rather than advancing', async () => {
      const add = modal.getByRole('button', { name: 'Add' });
      await waitFor(() => expect(add).toBeEnabled());
      await user.click(add);
    });

    await step('The created integration is confirmed by name', async () => {
      await modal.findByRole('heading', { name: 'Integration added' });
      expect(modal.getByText(/aws-production was created/)).toBeInTheDocument();

      const created = sourcesDb
        .findAll()
        .find(({ name }) => name === 'aws-production');
      expect(created).toBeDefined();

      // The link has to point at the source that was just made, which is the
      // one thing a hardcoded path would get wrong.
      expect(
        modal.getByRole('link', { name: 'View integration' }),
      ).toHaveAttribute('href', expect.stringContaining(String(created?.id)));
    });
  },
};

/**
 * The application step offers only what the chosen provider supports, and
 * refuses to advance until one is ticked — an integration that feeds nothing
 * is not something the wizard should be able to create.
 */
export const AmazonApplicationSelection: Story = {
  args: { sourceType: 'amazon' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-production',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await modal.findByRole('heading', { name: 'Select configuration' });
    await user.click(
      modal.getByRole('radio', { name: /Account authorization/ }),
    );
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Access key ID' }),
      ACCESS_KEY_ID,
    );
    await clearAndType(
      user,
      () => modal.getByLabelText(/Secret access key/),
      SECRET_ACCESS_KEY,
    );
    await waitFor(() =>
      expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await step('Only applications AWS supports are listed', async () => {
      await modal.findByRole('heading', { name: 'Select applications' });

      expect(
        modal.getByRole('checkbox', { name: 'Cost Management' }),
      ).toBeInTheDocument();
      // RHEL management is OpenShift-only.
      expect(
        modal.queryByRole('checkbox', { name: /RHEL management/i }),
      ).not.toBeInTheDocument();
    });

    await step('Next waits for at least one application', async () => {
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
      );

      await user.click(
        modal.getByRole('checkbox', { name: 'Cost Management' }),
      );

      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
    });

    await step('Clearing the selection explains why', async () => {
      await user.click(
        modal.getByRole('checkbox', { name: 'Cost Management' }),
      );

      await waitFor(() =>
        expect(
          modal.queryByText('Select at least one application to continue.'),
        ).toBeInTheDocument(),
      );
    });
  },
};

/**
 * Correcting a value from review. Back is the only way — the review step
 * offers no per-row Edit, because an existing integration is edited from the
 * table's row kebab and nowhere else. Back has to land on a step that still
 * holds what the user typed, and Next has to return to a review that reflects
 * the change.
 */
export const AmazonReviewBack: Story = {
  args: { sourceType: 'amazon' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await fillAwsDetails(user);

    await step('Review does not offer to edit anything', async () => {
      expect(modal.queryByRole('button', { name: /^Edit/ })).toBeNull();
    });

    await step(
      'Back walks to the configuration step, values intact',
      async () => {
        await user.click(modal.getByRole('button', { name: 'Back' }));
        await modal.findByRole('heading', { name: 'Select applications' });
        expect(
          modal.getByRole('checkbox', { name: 'Cost Management' }),
        ).toBeChecked();

        await user.click(modal.getByRole('button', { name: 'Back' }));
        await modal.findByRole('heading', { name: 'Select configuration' });
        expect(
          modal.getByRole('radio', { name: /Account authorization/ }),
        ).toBeChecked();
        expect(
          modal.getByRole('textbox', { name: 'Access key ID' }),
        ).toHaveValue(ACCESS_KEY_ID);
      },
    );

    await step('The change shows up back on review', async () => {
      await clearAndType(
        user,
        () => modal.getByRole('textbox', { name: 'Access key ID' }),
        'AKIAEXAMPLECHANGED00',
      );
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await modal.findByRole('heading', { name: 'Select applications' });
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await modal.findByRole('heading', { name: 'Review details' });
      expect(modal.getByText(/^AKIA•+$/)).toBeInTheDocument();
    });
  },
};

/**
 * The manual half of the configuration choice. It asks for a role to assume
 * instead of an access key — `sources-ui` pairs `manual_configuration` with
 * the `arn` authentication type, never with the superkey credential — and the
 * review shows the ARN in full, because it is an identifier, not a secret.
 */
export const AmazonManualConfiguration: Story = {
  args: { sourceType: 'amazon' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-manual',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await step('Choosing manual hides the access key fields', async () => {
      await modal.findByRole('heading', { name: 'Select configuration' });

      await user.click(
        modal.getByRole('radio', { name: /Account authorization/ }),
      );
      expect(
        modal.getByRole('textbox', { name: 'Access key ID' }),
      ).toBeInTheDocument();

      await user.click(
        modal.getByRole('radio', { name: 'Manual configuration' }),
      );
      expect(
        modal.queryByRole('textbox', { name: 'Access key ID' }),
      ).not.toBeInTheDocument();
    });

    await step('It asks for a role ARN, and checks the format', async () => {
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await modal.findByRole('heading', { name: 'Enter credentials' });
      await clearAndType(
        user,
        () => modal.getByRole('textbox', { name: 'ARN' }),
        'not-an-arn',
      );

      // A filled field is not a valid one: the prefix check is what keeps
      // Next disabled here, where the access key has nothing but REQUIRED.
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
      );
    });

    await step('A valid ARN carries through to review', async () => {
      await clearAndType(
        user,
        () => modal.getByRole('textbox', { name: 'ARN' }),
        ARN,
      );
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await modal.findByRole('heading', { name: 'Select applications' });
      await user.click(
        modal.getByRole('checkbox', { name: 'Cost Management' }),
      );
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await modal.findByRole('heading', { name: 'Review details' });
      expect(modal.getByText('Manual configuration')).toBeInTheDocument();
      // Shown in full: an ARN names a role, it is not a credential to hide.
      expect(modal.getByText(ARN)).toBeInTheDocument();
    });
  },
};

/**
 * A create that fails once. The error names the reason the API gave, and Retry
 * submits the same values again rather than making the user retype them.
 */
export const AmazonSubmitErrorRetry: Story = {
  args: { sourceType: 'amazon' },
  parameters: {
    msw: {
      handlers: [
        ...createFlakyBulkCreateHandler(1),
        ...createSourcesHandlers(),
      ],
    },
  },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await fillAwsDetails(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));

    await step('The failure is reported with the API reason', async () => {
      await modal.findByRole('heading', { name: 'Unable to add integration' });
      expect(modal.getByText('Internal Server Error')).toBeInTheDocument();
    });

    await step('Retry goes through', async () => {
      await user.click(modal.getByRole('button', { name: 'Retry' }));

      await modal.findByRole('heading', { name: 'Integration added' });
    });
  },
};

/**
 * A 400 the user can act on — the name is taken. "Edit details" has to put
 * them back on review with everything still filled in, or the reason the
 * result step is a wizard step rather than a swapped modal body is moot.
 */
export const AmazonSubmitError400: Story = {
  args: { sourceType: 'amazon' },
  parameters: {
    msw: {
      handlers: [
        ...createFailingBulkCreateHandler(400, 'Name has already been taken'),
        ...createSourcesHandlers(),
      ],
    },
  },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await fillAwsDetails(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));

    await step("The API's reason is what is shown", async () => {
      await modal.findByRole('heading', { name: 'Unable to add integration' });
      expect(
        modal.getByText('Name has already been taken'),
      ).toBeInTheDocument();
    });

    await step('Edit details returns to review, answers intact', async () => {
      await user.click(modal.getByRole('button', { name: 'Edit details' }));

      await modal.findByRole('heading', { name: 'Review details' });
      expect(modal.getByText('aws-production')).toBeInTheDocument();
      expect(modal.getByText(/^AKIA•+$/)).toBeInTheDocument();
    });
  },
};

/**
 * A request that never reaches the API. There is no response to read a reason
 * out of, so the generic copy stands in — and Retry is still the way forward.
 */
export const AmazonSubmitNetworkError: Story = {
  args: { sourceType: 'amazon' },
  parameters: {
    msw: {
      handlers: [
        ...createNetworkErrorBulkCreateHandler(),
        ...createSourcesHandlers(),
      ],
    },
  },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await fillAwsDetails(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));

    await step('The generic failure copy stands in', async () => {
      await modal.findByRole('heading', { name: 'Unable to add integration' });
      expect(
        modal.getByText(/Check your connection and try again/),
      ).toBeInTheDocument();
      expect(modal.getByRole('button', { name: 'Retry' })).toBeEnabled();
    });
  },
};

/**
 * Adding a second integration after a successful one. The wizard has to come
 * back empty: a form still holding the last answers would silently create a
 * near-duplicate.
 */
export const SuccessAddAnother: Story = {
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await step('Add the first integration', async () => {
      await modal.findByRole('radio', { name: 'Amazon Web Services' });
      await user.click(
        modal.getByRole('radio', { name: 'Amazon Web Services' }),
      );
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await fillAwsDetails(user);
      await user.click(modal.getByRole('button', { name: 'Add' }));
      await modal.findByRole('heading', { name: 'Integration added' });
    });

    await step('Add another starts over from an empty form', async () => {
      await user.click(
        modal.getByRole('button', { name: 'Add another integration' }),
      );

      await modal.findByRole('heading', { name: 'Select integration type' });
      for (const radio of modal.getAllByRole('radio')) {
        expect(radio).not.toBeChecked();
      }
    });
  },
};

/**
 * A provider with no authentication type yet. It reaches the authentication
 * step and stops there with an explanation — the one thing it must not do is
 * offer a Next, because there is no step mapped behind it.
 */
export const UnsupportedProviderStopsAtAuthType: Story = {
  args: { sourceType: 'google' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'gcp-production',
    );
    await waitFor(() =>
      expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));

    await step('It lands on the authentication step', async () => {
      await modal.findByRole('heading', { name: 'Select authentication type' });
      expect(
        modal.getByText(/Adding this integration type is not supported yet/),
      ).toBeInTheDocument();
    });

    await step('There is no way forward, only back', async () => {
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
      );
      expect(modal.getByRole('button', { name: 'Back' })).toBeEnabled();
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
