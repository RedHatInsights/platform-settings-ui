import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { StorybookMockProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import AddIntegrationWizard from './AddIntegrationWizard';
import {
  bulkCreateRequests,
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

async function advance(user: ReturnType<typeof userEvent.setup>) {
  const modal = within(document.body);
  await waitFor(() =>
    expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
  );
  await user.click(modal.getByRole('button', { name: 'Next' }));
}

async function selectProviderApplication(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  application: string,
) {
  const modal = within(document.body);
  await modal.findByRole('heading', { name: 'Name integration' });
  await clearAndType(
    user,
    () => modal.getByRole('textbox', { name: 'Integration name' }),
    name,
  );
  await advance(user);
  await modal.findByRole('heading', { name: 'Select application' });
  expect(
    modal.getByText(
      'Analyze, forecast, and optimize your Red Hat OpenShift cluster costs in hybrid cloud environments.',
    ),
  ).toBeInTheDocument();
  if (application === 'RHEL management') {
    expect(modal.getByText('Red Hat gold images')).toBeInTheDocument();
    expect(modal.getByText('Autoregistration')).toBeInTheDocument();
    expect(
      modal.queryByText('High precision subscription watch data'),
    ).not.toBeInTheDocument();
  }
  await user.click(
    modal.getByRole('radio', {
      name: application === 'RHEL management' ? /RHEL management/ : application,
    }),
  );
  await advance(user);
}

/**
 * Walks an AWS wizard that opened pre-selected from naming through to review,
 * taking account authorization and leaving its applications on.
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

  // Account authorization turns everything on for the user, so there is
  // nothing to click here.
  await modal.findByRole('heading', { name: 'Select applications' });
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
 * All four providers can proceed through their source-ui application and
 * authentication paths. AWS alone offers account authorization.
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
 * A name returned by Sources must make the current step invalid, not merely
 * decorate the text field with an error.
 */
export const DuplicateName: Story = {
  args: { sourceType: 'amazon' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'AWS production account',
    );
    await user.tab();

    await step('Duplicate names block the wizard', async () => {
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
      );
      expect(
        modal.getByRole('heading', { name: 'Name integration' }),
      ).toBeInTheDocument();
      expect(
        modal.getByRole('textbox', { name: 'Integration name' }),
      ).toHaveAttribute('aria-invalid', 'true');
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
      // All AWS applications, because account authorization turned them on.
      expect(
        modal.getByText('Cost Management, RHEL management, Launch images'),
      ).toBeInTheDocument();
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
 * The application step after account authorization: everything the provider
 * supports, already on, with the RHEL management bundle spelling out what it
 * includes. Nothing is required — these can be turned on after creation.
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

    await step('Account authorization turns everything on', async () => {
      await modal.findByRole('heading', { name: 'Select applications' });

      // Red Hat is managing the credentials, so it can set the whole
      // subscription up; the user turns off what they do not want.
      for (const toggle of modal.getAllByRole('switch')) {
        expect(toggle).toBeChecked();
      }
    });

    await step('AWS is offered its applications', async () => {
      expect(
        modal.getByRole('switch', { name: 'Cost Management' }),
      ).toBeInTheDocument();
      expect(
        modal.getByRole('switch', { name: /RHEL management/ }),
      ).toBeInTheDocument();
      expect(
        modal.getByRole('switch', { name: 'Launch images' }),
      ).toBeInTheDocument();
    });

    await step('The bundle lists what it includes', async () => {
      expect(modal.getByText('Bundle')).toBeInTheDocument();
      expect(modal.getByText('Red Hat gold images')).toBeInTheDocument();
      expect(
        modal.getByText('High precision subscription watch data'),
      ).toBeInTheDocument();
      expect(modal.getByText('Autoregistration')).toBeInTheDocument();
    });

    await step('Turning everything off is allowed', async () => {
      for (const toggle of modal.getAllByRole('switch')) {
        await user.click(toggle);
      }

      // Nothing is required: applications can be connected after creation,
      // which is what the step's own description promises.
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
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

    await step(
      'Switching to manual asks for one application instead',
      async () => {
        await user.click(modal.getByRole('button', { name: 'Back' }));
        await modal.findByRole('heading', { name: 'Select applications' });
        await user.click(modal.getByRole('button', { name: 'Back' }));

        await modal.findByRole('heading', { name: 'Select configuration' });
        await user.click(
          modal.getByRole('radio', { name: 'Manual configuration' }),
        );
        await user.click(modal.getByRole('button', { name: 'Next' }));

        await modal.findByRole('heading', { name: 'Select application' });
        expect(modal.queryAllByRole('switch')).toHaveLength(0);
      },
    );
  },
};

/**
 * Manual AWS configuration binds a role to one application.
 */
export const AmazonManualConfiguration: Story = {
  args: { sourceType: 'amazon' },
  parameters: {
    featureFlags: {
      'platform.sources.integrations.new-hccm-stg-account': true,
    },
  },
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
      // Unregistered, not just hidden: a required access key left behind
      // would hold Next disabled with nothing on screen to explain it.
      expect(
        modal.queryByRole('textbox', { name: 'Access key ID' }),
      ).not.toBeInTheDocument();
      await waitFor(() =>
        expect(modal.queryByRole('button', { name: 'Next' })).toBeEnabled(),
      );
    });

    await step('It asks for one application', async () => {
      await user.click(modal.getByRole('button', { name: 'Next' }));

      await modal.findByRole('heading', { name: 'Select application' });
      expect(
        modal.getByRole('link', { name: 'Learn more' }),
      ).toBeInTheDocument();
      expect(
        modal.getByText(
          'Analyze, forecast, and optimize your Red Hat OpenShift cluster costs in hybrid cloud environments.',
        ),
      ).toBeInTheDocument();
      expect(modal.getByText('RHEL management')).toBeInTheDocument();
      expect(modal.getByText('Bundle')).toBeInTheDocument();
      expect(modal.getByText('Red Hat gold images')).toBeInTheDocument();
      expect(
        modal.getByText('High precision subscription watch data'),
      ).toBeInTheDocument();
      expect(modal.getByText('Autoregistration')).toBeInTheDocument();
      expect(
        modal.queryByRole('heading', { name: 'Enter credentials' }),
      ).not.toBeInTheDocument();
    });

    await step('Cost Management collects its AWS details', async () => {
      await user.click(modal.getByRole('radio', { name: 'Cost Management' }));
      await user.click(modal.getByRole('button', { name: 'Next' }));
      await modal.findByRole('heading', { name: 'Create storage' });
      expect(
        modal.getByText(
          'To store the data export (previously called a cost and usage report) for cost management, create an Amazon S3 bucket.',
        ),
      ).toBeInTheDocument();
      expect(modal.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
        'href',
        'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int#creating-an-aws-s3-bucket-hcs-n',
      );
      await clearAndType(
        user,
        () => modal.getByRole('textbox', { name: 'S3 bucket name' }),
        'my-cost-bucket',
      );
      await user.click(modal.getByRole('button', { name: 'AWS region' }));
      await user.click(modal.getByRole('option', { name: 'us-east-1' }));
      await user.click(modal.getByRole('button', { name: 'Next' }));
      await modal.findByRole('heading', {
        name: 'Create cost and usage report',
      });
      expect(
        modal.getByText('Export type: Legacy CUR export'),
      ).toBeInTheDocument();
      await user.click(modal.getByRole('button', { name: 'Next' }));
      await modal.findByRole('heading', {
        name: 'Tag aliases and organizational units',
      });
      await user.click(modal.getByRole('button', { name: 'Next' }));
      await modal.findByRole('heading', { name: 'Create IAM policy' });
      await user.click(modal.getByRole('button', { name: 'Next' }));
      await modal.findByRole('heading', { name: 'Create IAM role' });
      expect(
        modal.getByText(
          'Enable the external ID requirement and use this value:',
        ),
      ).toBeInTheDocument();
      expect(modal.getByDisplayValue('148761653619')).toBeInTheDocument();
      const externalId = (
        modal.getByRole('textbox', { name: 'External ID' }) as HTMLInputElement
      ).value;
      expect(modal.getByRole('textbox', { name: 'External ID' })).toHaveValue(
        externalId,
      );
      await user.click(modal.getByRole('button', { name: 'Next' }));
      await modal.findByRole('heading', { name: 'Enter ARN' });
      await clearAndType(
        user,
        () => modal.getByRole('textbox', { name: 'IAM role ARN' }),
        'arn:aws:iam::123456789:role/CostManagement',
      );
      await user.click(modal.getByRole('button', { name: 'Next' }));
    });

    await step('Review names the mode and the IAM role', async () => {
      await modal.findByRole('heading', { name: 'Review details' });

      expect(modal.getByText('Manual configuration')).toBeInTheDocument();
      expect(modal.getByText('Cost Management')).toBeInTheDocument();
      expect(modal.queryByText('Access key ID')).not.toBeInTheDocument();
      expect(modal.queryByText('Secret access key')).not.toBeInTheDocument();
      expect(
        modal.getByText('arn:aws:iam::123456789:role/CostManagement'),
      ).toBeInTheDocument();
    });

    await step('It still creates the integration', async () => {
      await user.click(modal.getByRole('button', { name: 'Add' }));

      await modal.findByRole('heading', { name: 'Integration added' });
      expect(
        sourcesDb.findAll().find(({ name }) => name === 'aws-manual'),
      ).toBeDefined();
      const request = bulkCreateRequests[bulkCreateRequests.length - 1];
      expect(request.sources[0].name).toBe('aws-manual');
      expect(request.authentications[0]).toEqual(
        expect.objectContaining({
          authtype: 'arn',
          username: 'arn:aws:iam::123456789:role/CostManagement',
          resource_type: 'application',
          resource_name: '/insights/platform/cost-management',
          extra: { external_id: expect.any(String) },
        }),
      );
      expect(request.applications).toEqual([
        expect.objectContaining({
          application_type_id: '1',
          extra: expect.objectContaining({
            bucket: 'my-cost-bucket',
            bucket_region: 'us-east-1',
          }),
        }),
      ]);
    });
  },
};

export const AmazonManualHcsEnrollment: Story = {
  args: { sourceType: 'amazon' },
  parameters: {
    msw: { handlers: createSourcesHandlers(undefined, true) },
  },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-hcs',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select configuration' });
    await user.click(
      modal.getByRole('radio', { name: 'Manual configuration' }),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select application' });
    await modal.findByRole('radio', { name: 'Hybrid Committed Spend' });
    await user.click(
      modal.getByRole('radio', { name: 'Hybrid Committed Spend' }),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Create storage' });
    expect(
      modal.getByText(
        'To store the data export (previously called a cost and usage report) for cost management, create an Amazon S3 bucket.',
      ),
    ).toBeInTheDocument();
    expect(
      modal.queryByRole('link', { name: 'AWS setup instructions' }),
    ).not.toBeInTheDocument();
  },
};

export const AmazonManualSwitchApplication: Story = {
  args: { sourceType: 'amazon' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-switch',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select configuration' });
    await user.click(
      modal.getByRole('radio', { name: 'Manual configuration' }),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select application' });
    await user.click(modal.getByRole('radio', { name: /RHEL management/ }));
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Create IAM policy' });
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Create IAM role' });
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Enter ARN' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'IAM role ARN' }),
      'arn:aws:iam::123456789:role/SubscriptionWatch',
    );
    await user.click(modal.getByRole('button', { name: 'Back' }));
    await modal.findByRole('heading', { name: 'Create IAM role' });
    await user.click(modal.getByRole('button', { name: 'Back' }));
    await modal.findByRole('heading', { name: 'Create IAM policy' });
    await user.click(modal.getByRole('button', { name: 'Back' }));
    await modal.findByRole('heading', { name: 'Select application' });
    await user.click(modal.getByRole('radio', { name: 'Cost Management' }));
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Create storage' });
    expect(modal.getByRole('textbox', { name: 'S3 bucket name' })).toHaveValue(
      '',
    );
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'S3 bucket name' }),
      'new-bucket',
    );
    await user.click(modal.getByRole('button', { name: 'AWS region' }));
    await user.click(modal.getByRole('option', { name: 'us-east-1' }));
    for (const heading of [
      'Create cost and usage report',
      'Tag aliases and organizational units',
      'Create IAM policy',
      'Create IAM role',
      'Enter ARN',
    ]) {
      await user.click(modal.getByRole('button', { name: 'Next' }));
      await modal.findByRole('heading', { name: heading });
    }
    expect(modal.getByRole('textbox', { name: 'IAM role ARN' })).toHaveValue(
      '',
    );
  },
};

export const AmazonManualRhelManagement: Story = {
  args: { sourceType: 'amazon' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-rhel',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select configuration' });
    await user.click(
      modal.getByRole('radio', { name: 'Manual configuration' }),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select application' });
    await user.click(modal.getByRole('radio', { name: /RHEL management/ }));
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Create IAM policy' });
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Create IAM role' });
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Enter ARN' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'IAM role ARN' }),
      'arn:aws:iam::123456789:role/SubscriptionWatch',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Review details' });
    expect(modal.getByText('RHEL management IAM role')).toBeInTheDocument();
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    const request = bulkCreateRequests[bulkCreateRequests.length - 1];
    expect(request.authentications[0]).toEqual(
      expect.objectContaining({
        authtype: 'cloud-meter-arn',
        resource_type: 'application',
        resource_name: '/insights/platform/cloud-meter',
        extra: { external_id: expect.any(String) },
      }),
    );
    expect(request.applications).toEqual([
      expect.objectContaining({ application_type_id: '2' }),
    ]);
  },
};

export const AmazonManualLaunchImages: Story = {
  args: { sourceType: 'amazon' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'aws-launch-images',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select configuration' });
    await user.click(
      modal.getByRole('radio', { name: 'Manual configuration' }),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Select application' });
    await user.click(modal.getByRole('radio', { name: 'Launch images' }));
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'AWS Account Number' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Account number' }),
      '123456789012',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Create IAM role' });
    expect(
      await modal.findByRole('link', {
        name: 'Connect AWS with CloudFormation',
      }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('ProvisioningAwsAccount=012345678901'),
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Enter ARN' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'IAM role ARN' }),
      'arn:aws:iam::123456789012:role/RH-HCC-provisioning-role',
    );
    await user.click(modal.getByRole('button', { name: 'Next' }));
    await modal.findByRole('heading', { name: 'Review details' });
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    const request = bulkCreateRequests[bulkCreateRequests.length - 1];
    expect(request.authentications[0]).toEqual(
      expect.objectContaining({
        authtype: 'provisioning-arn',
        resource_type: 'application',
        resource_name: '/insights/platform/provisioning',
      }),
    );
    expect(request.applications).toEqual([
      expect.objectContaining({ application_type_id: '3' }),
    ]);
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

export const OpenshiftCostManagement: Story = {
  args: { sourceType: 'openshift' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await modal.findByRole('heading', { name: 'Name integration' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Integration name' }),
      'openshift-cost',
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Select application' });
    expect(
      await modal.findByRole('radio', { name: /Hybrid Committed Spend/ }),
    ).toBeChecked();
    expect(
      modal.getByText('Track Red Hat committed spend'),
    ).toBeInTheDocument();
    await advance(user);
    await modal.findByRole('heading', {
      name: 'Install and configure operator',
    });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Cluster Identifier' }),
      'cluster_1',
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Review details' });
    expect(modal.getByText('Name', { exact: true })).toBeInTheDocument();
    expect(
      modal.getByText('Manage permissions in User Access'),
    ).toBeInTheDocument();
    expect(
      modal.getByText(
        'Make sure to manage permissions for this integration in custom roles that contain permissions for Cost Management.',
      ),
    ).toBeInTheDocument();
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    const request = bulkCreateRequests[bulkCreateRequests.length - 1];
    expect(request.sources[0].source_ref).toBe('cluster_1');
    expect(request.endpoints).toEqual([]);
    expect(request.authentications[0].resource_type).toBe('application');
  },
};

export const AzureCostManagement: Story = {
  args: { sourceType: 'azure' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(user, 'azure-cost', 'Cost Management');
    await modal.findByRole('heading', { name: 'Specify cost export scope' });
    await advance(user);
    await modal.findByRole('heading', {
      name: 'Resource group and storage account',
    });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Resource group name' }),
      'group_1',
    );
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Storage account name' }),
      'storage_1',
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Daily export' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Subscription ID' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Subscription ID' }),
      'subscription_1',
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Roles' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Tenant (Directory) ID' }),
      'tenant_1',
    );
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Client (Application) ID' }),
      'client_1',
    );
    await clearAndType(
      user,
      () => modal.getByLabelText(/Client secret/),
      'secret_1',
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Review details' });
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    const request = bulkCreateRequests[bulkCreateRequests.length - 1];
    expect(request.applications[0].extra).toEqual(
      expect.objectContaining({
        resource_group: 'group_1',
        storage_account: 'storage_1',
        subscription_id: 'subscription_1',
      }),
    );
    expect(request.authentications[0]).toEqual(
      expect.objectContaining({
        resource_type: 'application',
        extra: { azure: { tenant_id: 'tenant_1' } },
      }),
    );
  },
};

export const AzureCostCustomExport: Story = {
  args: { sourceType: 'azure' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(user, 'azure-custom', 'Cost Management');
    await user.click(
      modal.getByRole('radio', {
        name: 'I wish to manually customize the data set sent to Cost Management',
      }),
    );
    expect(
      modal.queryByRole('textbox', { name: 'Cost export scope' }),
    ).not.toBeInTheDocument();
    await advance(user);
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Resource group name' }),
      'group_custom',
    );
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Storage account name' }),
      'storage_custom',
    );
    await advance(user);
    expect(
      modal.queryByRole('textbox', { name: 'Cost export name' }),
    ).not.toBeInTheDocument();
    await advance(user);
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Subscription ID' }),
      'subscription_custom',
    );
    await advance(user);
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Tenant (Directory) ID' }),
      'tenant_custom',
    );
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Client (Application) ID' }),
      'client_custom',
    );
    await clearAndType(
      user,
      () => modal.getByLabelText(/Client secret/),
      'secret_custom',
    );
    await advance(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    expect(
      bulkCreateRequests[bulkCreateRequests.length - 1].applications[0].extra,
    ).toEqual(
      expect.objectContaining({
        storage_only: true,
      }),
    );
  },
};

export const GoogleCostManagement: Story = {
  args: { sourceType: 'google' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(user, 'google-cost', 'Cost Management');
    await modal.findByRole('heading', { name: 'Project' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Project ID' }),
      'project-1',
    );
    await user.click(
      modal.getByRole('textbox', { name: 'Service Account JSON' }),
    );
    await user.paste('{"type":"service_account"}');
    await advance(user);
    await modal.findByRole('heading', { name: 'Create IAM role' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Assign access' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Create dataset' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Dataset ID' }),
      'billing_dataset',
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Billing export' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Review details' });
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    const request = bulkCreateRequests[bulkCreateRequests.length - 1];
    expect(request.endpoints).toEqual([]);
    expect(request.applications[0].extra).toEqual(
      expect.objectContaining({ dataset: 'billing_dataset' }),
    );
    expect(request.authentications[0].resource_type).toBe('application');
  },
};

export const GoogleCostCustomExport: Story = {
  args: { sourceType: 'google' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(user, 'google-custom', 'Cost Management');
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Project ID' }),
      'project-custom',
    );
    await user.click(
      modal.getByRole('textbox', { name: 'Service Account JSON' }),
    );
    await user.paste('{"type":"service_account"}');
    await user.click(
      modal.getByRole('radio', {
        name: 'I wish to manually customize the dataset sent to Cost Management',
      }),
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Create cloud storage bucket' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Cloud storage bucket name' }),
      'custom-bucket',
    );
    await advance(user);
    await advance(user);
    await advance(user);
    await modal.findByRole('heading', { name: 'Create dataset' });
    expect(
      modal.queryByRole('textbox', { name: 'Dataset ID' }),
    ).not.toBeInTheDocument();
    await advance(user);
    await advance(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    expect(
      bulkCreateRequests[bulkCreateRequests.length - 1].applications[0].extra,
    ).toEqual(
      expect.objectContaining({
        bucket: 'custom-bucket',
        storage_only: true,
      }),
    );
  },
};

export const GoogleRhelManagement: Story = {
  args: { sourceType: 'google' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(user, 'google-rhel', 'Cost Management');
    await modal.findByRole('heading', { name: 'Project' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Project ID' }),
      'old-project',
    );
    await user.click(
      modal.getByRole('textbox', { name: 'Service Account JSON' }),
    );
    await user.paste('{"type":"service_account"}');
    await user.click(modal.getByRole('button', { name: 'Back' }));
    await modal.findByRole('heading', { name: 'Select application' });
    await user.click(modal.getByRole('radio', { name: /RHEL management/ }));
    await advance(user);
    await modal.findByRole('heading', { name: 'Obtain offline token' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Run Ansible playbook' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Review details' });
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    const request = bulkCreateRequests[bulkCreateRequests.length - 1];
    expect(request.authentications).toEqual([]);
    expect(request.applications[0].application_type_id).toBe('2');
    expect(request.applications[0].extra).toEqual({ hcs: false });
  },
};

export const AzureRhelManagementLegacy: Story = {
  args: { sourceType: 'azure' },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(user, 'azure-rhel', 'RHEL management');
    await modal.findByRole('heading', { name: 'Obtain offline token' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Run Ansible playbook' });
    await advance(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    expect(
      bulkCreateRequests[bulkCreateRequests.length - 1].authentications,
    ).toEqual([]);
  },
};

export const AzureRhelManagementLighthouse: Story = {
  args: { sourceType: 'azure' },
  parameters: { featureFlags: { 'sources.wizard.lighthouse': true } },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(
      user,
      'azure-lighthouse',
      'RHEL management',
    );
    await modal.findByRole('heading', { name: 'Configure Azure Lighthouse' });
    await waitFor(() =>
      expect(modal.queryByRole('button', { name: 'Next' })).toBeDisabled(),
    );
    await user.click(
      await modal.findByRole('link', { name: 'Go to Lighthouse' }),
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Set subscription ID' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Subscription ID' }),
      'subscription-id',
    );
    await advance(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Integration added' });
    expect(
      bulkCreateRequests[bulkCreateRequests.length - 1].authentications[0],
    ).toEqual(
      expect.objectContaining({
        authtype: 'lighthouse_subscription_id',
        resource_type: 'application',
        username: 'subscription-id',
      }),
    );
  },
};

export const GoogleSubmitErrorRetry: Story = {
  args: { sourceType: 'google' },
  parameters: {
    msw: {
      handlers: [
        ...createFlakyBulkCreateHandler(1),
        ...createSourcesHandlers(),
      ],
    },
  },
  play: async () => {
    const user = userEvent.setup();
    const modal = within(document.body);
    await selectProviderApplication(user, 'google-retry', 'Cost Management');
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Project ID' }),
      'retry-project',
    );
    await user.click(
      modal.getByRole('textbox', { name: 'Service Account JSON' }),
    );
    await user.paste('{"type":"service_account"}');
    await advance(user);
    await modal.findByRole('heading', { name: 'Create IAM role' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Assign access' });
    await advance(user);
    await modal.findByRole('heading', { name: 'Create dataset' });
    await clearAndType(
      user,
      () => modal.getByRole('textbox', { name: 'Dataset ID' }),
      'retry_dataset',
    );
    await advance(user);
    await modal.findByRole('heading', { name: 'Billing export' });
    await advance(user);
    await user.click(modal.getByRole('button', { name: 'Add' }));
    await modal.findByRole('heading', { name: 'Unable to add integration' });
    await user.click(modal.getByRole('button', { name: 'Retry' }));
    await modal.findByRole('heading', { name: 'Integration added' });
  },
};

/**
 * Opened from a dropdown with the provider already picked, which is how every
 * entry point in the app opens it. The provider step is answered, so the
 * wizard starts on naming rather than asking the same question twice.
 */
export const PreSelected: Story = {
  args: { sourceType: 'openshift' },
  play: async ({ step }) => {
    const user = userEvent.setup();
    const modal = within(document.body);

    await step('It opens on the naming step, not the first', async () => {
      await modal.findByRole('heading', { name: 'Name integration' });

      expect(
        modal.getByText(
          'Enter a name for your OpenShift Container Platform integration.',
        ),
      ).toBeInTheDocument();
      expect(modal.queryByRole('radio')).not.toBeInTheDocument();
    });

    await step('Back returns to the provider step, choice intact', async () => {
      await user.click(modal.getByRole('button', { name: 'Back' }));

      const openshift = await modal.findByRole('radio', {
        name: 'OpenShift Container Platform',
      });
      expect(openshift).toBeChecked();
    });

    await step('A different provider can be chosen instead', async () => {
      await user.click(
        modal.getByRole('radio', { name: 'Amazon Web Services' }),
      );

      expect(
        modal.getByRole('radio', { name: 'Amazon Web Services' }),
      ).toBeChecked();
      expect(
        modal.getByRole('radio', { name: 'OpenShift Container Platform' }),
      ).not.toBeChecked();
      await advance(user);
      await modal.findByRole('heading', { name: 'Name integration' });
      expect(
        modal.getByText(
          'Enter a name for your Amazon Web Services integration.',
        ),
      ).toBeInTheDocument();
      await clearAndType(
        user,
        () => modal.getByRole('textbox', { name: 'Integration name' }),
        'amazon-after-switch',
      );
      await advance(user);
      await modal.findByRole('heading', { name: 'Select configuration' });
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
