import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StorybookMockProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import { waitForModal } from '../../../../shared/interactionHelpers';
import SourceDetailPage from './SourceDetailPage';
import { createSourcesHandlers, sourcesDb } from '../../data/mocks/sources';

/**
 * The source detail view for a single data integration.
 *
 * Phase 1 is read-only: every field renders as text, and Save, Pause, and
 * Delete are deferred — Save raises a toast and Pause/Delete open "coming
 * soon" modals. Users reach the page by clicking a source name in the
 * "My data integrations" table.
 *
 * Route: `/settings/data-integrations/:sourceId`
 *
 * The decorator nests a `StorybookMockProvider` with `app="data-integrations"`
 * because `useAppNavigate` builds its basename from Chrome's
 * `/${getBundle()}/${getApp()}`, and mounts the story under a parameterised
 * route so `useParams().sourceId` resolves the way it does in the console.
 *
 * Note for play functions: no seed source carries `last_checked_at`, so the
 * header always renders the "Waiting for update" spinner. `waitForContentReady`
 * would never settle here — wait on the source name instead.
 */
const meta = {
  title: 'Features/DataIntegrations/SourceDetailPage',
  component: SourceDetailPage,
  decorators: [
    (Story, { parameters }) => (
      <StorybookMockProvider bundle="settings" app="data-integrations">
        <MemoryRouter
          initialEntries={[
            parameters.initialRoute ?? '/settings/data-integrations/101',
          ]}
        >
          <Routes>
            <Route
              path="/settings/data-integrations/:sourceId"
              element={<Story />}
            />
          </Routes>
        </MemoryRouter>
      </StorybookMockProvider>
    ),
  ],
  parameters: {
    msw: { handlers: createSourcesHandlers() },
  },
  beforeEach: () => {
    sourcesDb.reset();
  },
} satisfies Meta<typeof SourceDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Source 101 — an available AWS account with Cost Management and
 * Subscriptions attached. Available sources open the applications section by
 * default.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Header shows the source name and provider icon', async () => {
      // The name renders twice: as the page title and as the Name field value.
      const names = await canvas.findAllByText('AWS production account');
      expect(names.length).toBe(2);

      expect(canvas.getByAltText('Amazon Web Services')).toHaveAttribute(
        'src',
        '/apps/frontend-assets/partners-icons/aws-logomark.svg',
      );
    });

    await step('Status badge reads Available', async () => {
      expect(canvas.getByText('Available')).toBeInTheDocument();
    });

    await step('Header metadata lists both timestamps', async () => {
      expect(canvas.getByText(/Last modified/)).toBeInTheDocument();
      expect(canvas.getByText(/Last availability check/)).toBeInTheDocument();
    });

    await step('Detail fields render as read-only text', async () => {
      expect(canvas.getByText('Name')).toBeInTheDocument();
      expect(canvas.getByText('Date added')).toBeInTheDocument();
      expect(canvas.getByText('Configuration mode')).toBeInTheDocument();
      expect(canvas.getByText('Integration type')).toBeInTheDocument();
      expect(canvas.getByText('Amazon Web Services')).toBeInTheDocument();
      expect(
        canvas.queryByRole('textbox', { name: 'Name' }),
      ).not.toBeInTheDocument();
    });

    await step('Connected applications lists both services', async () => {
      expect(canvas.getByText('Connected applications')).toBeInTheDocument();
      expect(canvas.getByLabelText('Cost Management')).toBeInTheDocument();
      expect(canvas.getByLabelText('Subscriptions')).toBeInTheDocument();
    });

    await step('Save, Cancel, and Actions are available', async () => {
      expect(canvas.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(
        canvas.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
      expect(
        canvas.getByRole('button', { name: 'Actions' }),
      ).toBeInTheDocument();
    });
  },
};

/**
 * Two days old, so `getDateFormatType` stays on the relative side of the
 * three-month threshold it mirrors from TableView. Computed rather than
 * seeded, because a fixed timestamp would cross the threshold three months
 * after it was written.
 */
const twoDaysAgo = () =>
  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

/**
 * Pins how the detail page renders a "Date added" older than three months.
 *
 * `SourcesTable.stories.tsx` > `DateAddedFormat` asserts this exact string for
 * this exact source. The two surfaces drifted once already, so if either one
 * changes format, one of the two stories fails.
 */
export const DateAddedMatchesTable: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Date added matches the sources table', async () => {
      await canvas.findAllByText('AWS production account');

      // created_at 2026-01-14T09:12:00Z, rendered by DateFormat onlyDate.
      expect(canvas.getByText('14 Jan 2026')).toBeVisible();
    });
  },
};

/**
 * The other half of the mirrored rule — under three months old, the detail
 * page switches to relative time, exactly as the table's `format: 'date'`
 * column does.
 *
 * `SourcesTable.stories.tsx` > `DateAddedRelativeFormat` pins the same source
 * against the same expected string. The header's "Last modified" also renders
 * relative time, but from `updated_at`, so it never collides with this.
 */
export const DateAddedRelativeMatchesTable: Story = {
  beforeEach: () => {
    sourcesDb.update('101', { created_at: twoDaysAgo() });
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Date added matches the sources table', async () => {
      await canvas.findAllByText('AWS production account');

      expect(canvas.getByText('2 days ago')).toBeVisible();
    });
  },
};

/**
 * Checkboxes are interactive in Phase 1 even though nothing is persisted, and
 * Save reports that persistence is still to come.
 */
export const DeferredSave: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Applications start checked', async () => {
      await canvas.findAllByText('AWS production account');
      expect(canvas.getByLabelText('Cost Management')).toBeChecked();
    });

    await step('Unchecking an application is allowed', async () => {
      await user.click(canvas.getByLabelText('Cost Management'));
      expect(canvas.getByLabelText('Cost Management')).not.toBeChecked();
    });

    await step('Save reports that the action is deferred', async () => {
      await user.click(canvas.getByRole('button', { name: 'Save' }));

      const alerts = within(document.body);
      expect(
        await alerts.findByText('Save functionality coming soon'),
      ).toBeInTheDocument();
    });
  },
};

/**
 * The Actions menu is reachable and reports its state by keyboard alone.
 *
 * `Dropdown` does not pass its open state into a render-prop toggle, so
 * `MenuToggle` needs `isExpanded` explicitly — without it the control stays
 * `aria-expanded="false"` while the menu is open and assistive technology
 * announces it as collapsed.
 */
export const ActionsMenuKeyboardAccessible: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const body = within(document.body);

    await canvas.findAllByText('AWS production account');
    const toggle = canvas.getByRole('button', { name: 'Actions' });

    await step('The toggle starts collapsed', async () => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    await step('Enter opens the menu and updates the state', async () => {
      toggle.focus();
      await user.keyboard('{Enter}');

      await body.findByRole('menuitem', { name: /Delete/ });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    await step('Escape closes it and restores the state', async () => {
      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(toggle).toHaveAttribute('aria-expanded', 'false'),
      );
    });
  },
};

/**
 * Source 108 — an availability check is running, so Pause is unavailable
 * until it settles. Delete stays open.
 */
export const InProgress: Story = {
  parameters: {
    initialRoute: '/settings/data-integrations/108',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    // Dropdown menus render into document.body, outside the story canvas.
    const body = within(document.body);

    await step('Status badge reads In progress', async () => {
      await canvas.findAllByText('AWS development account');
      expect(canvas.getByText('In progress')).toBeInTheDocument();
    });

    await step('Pause is disabled while the check runs', async () => {
      await user.click(canvas.getByRole('button', { name: 'Actions' }));

      const pauseItem = await body.findByRole('menuitem', { name: /Pause/ });
      expect(pauseItem).toBeDisabled();
      expect(
        body.getByText('Cannot pause while availability check is in progress'),
      ).toBeInTheDocument();
    });

    await step('Delete stays enabled', async () => {
      expect(body.getByRole('menuitem', { name: /Delete/ })).toBeEnabled();
    });
  },
};

/**
 * Source 109 — paused. The paused badge takes precedence over the underlying
 * availability status, and the dropdown offers Resume in place of Pause.
 */
export const Paused: Story = {
  parameters: {
    initialRoute: '/settings/data-integrations/109',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const body = within(document.body);

    await step('Header shows the Google Cloud icon', async () => {
      await canvas.findAllByText('Google Cloud test project');
      expect(canvas.getByAltText('Google Cloud')).toHaveAttribute(
        'src',
        '/apps/frontend-assets/partners-icons/google-cloud-logomark.svg',
      );
    });

    await step('Paused wins over the available status', async () => {
      expect(canvas.getByText('Paused')).toBeInTheDocument();
      expect(canvas.queryByText('Available')).not.toBeInTheDocument();
    });

    await step('The dropdown offers Resume, not Pause', async () => {
      await user.click(canvas.getByRole('button', { name: 'Actions' }));

      expect(
        await body.findByRole('menuitem', { name: /Resume/ }),
      ).toBeInTheDocument();
      expect(
        body.queryByRole('menuitem', { name: /^Pause/ }),
      ).not.toBeInTheDocument();
    });
  },
};

/**
 * Source 102 — unavailable after a failed role assumption. Non-available
 * sources render the applications section collapsed.
 */
export const Unavailable: Story = {
  parameters: {
    initialRoute: '/settings/data-integrations/102',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Header and badge reflect the failure', async () => {
      await canvas.findAllByText('AWS sandbox account');
      expect(canvas.getByText('Unavailable')).toBeInTheDocument();
    });

    await step('Applications are collapsed until expanded', async () => {
      const toggle = canvas.getByRole('button', {
        name: 'Connected applications',
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      // getByRole skips hidden nodes, so finding the region proves it opened.
      const region = canvas.getByRole('region', {
        name: 'Connected applications',
      });
      expect(
        within(region).getByLabelText('Cost Management'),
      ).toBeInTheDocument();
    });
  },
};

/**
 * Source 105 — an OpenShift cluster where one application is healthy and one
 * is not.
 */
export const PartiallyAvailable: Story = {
  parameters: {
    initialRoute: '/settings/data-integrations/105',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Header shows the OpenShift icon and badge', async () => {
      await canvas.findAllByText('OpenShift cluster: east');
      expect(
        canvas.getByAltText('OpenShift Container Platform'),
      ).toHaveAttribute(
        'src',
        '/apps/frontend-assets/technology-icons/openshift.svg',
      );
      expect(canvas.getByText('Partially available')).toBeInTheDocument();
    });

    await step('Both applications are listed once expanded', async () => {
      await user.click(
        canvas.getByRole('button', { name: 'Connected applications' }),
      );

      const region = canvas.getByRole('region', {
        name: 'Connected applications',
      });
      expect(
        within(region).getByLabelText('Cost Management'),
      ).toBeInTheDocument();
      expect(
        within(region).getByLabelText('RHEL Management'),
      ).toBeInTheDocument();
    });
  },
};

/**
 * Delete is deferred in Phase 1 — the dropdown item opens an explanatory
 * modal instead of calling the API, and dismissing it leaves the source in
 * place.
 */
export const DeleteIsDeferred: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const body = within(document.body);

    await step('Choose Delete from the Actions dropdown', async () => {
      await canvas.findAllByText('AWS production account');
      await user.click(canvas.getByRole('button', { name: 'Actions' }));
      await user.click(await body.findByRole('menuitem', { name: /Delete/ }));
    });

    await step('The modal explains the action is not wired up', async () => {
      const modal = await waitForModal();

      expect(modal.getByText('Delete data integration?')).toBeInTheDocument();
      expect(
        modal.getByText('Delete functionality coming soon'),
      ).toBeInTheDocument();
    });

    await step('Dismissing the modal leaves the source intact', async () => {
      const modal = await waitForModal();
      await user.click(modal.getByRole('button', { name: 'OK' }));

      expect(
        (await canvas.findAllByText('AWS production account')).length,
      ).toBe(2);
    });
  },
};

/**
 * Pause is deferred the same way as Delete.
 */
export const PauseIsDeferred: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const body = within(document.body);

    await step('Choose Pause from the Actions dropdown', async () => {
      await canvas.findAllByText('AWS production account');
      await user.click(canvas.getByRole('button', { name: 'Actions' }));
      await user.click(await body.findByRole('menuitem', { name: /^Pause/ }));
    });

    await step('The modal explains the action is not wired up', async () => {
      const modal = await waitForModal();

      expect(modal.getByText('Pause data integration')).toBeInTheDocument();
      expect(
        modal.getByText('Pause functionality coming soon'),
      ).toBeInTheDocument();
    });
  },
};

/**
 * An id that does not resolve renders the not-found state rather than an
 * empty form. `getSource` throws `SourceNotFoundError`, which the page
 * distinguishes from a transport failure.
 */
export const NotFound: Story = {
  parameters: {
    initialRoute: '/settings/data-integrations/999',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('The not-found copy renders', async () => {
      expect(
        await canvas.findByRole('heading', { name: 'Source not found' }),
      ).toBeInTheDocument();
      expect(
        canvas.getByText(
          'The data integration you are looking for does not exist or has been deleted.',
        ),
      ).toBeInTheDocument();
    });

    await step('A route back to the list is offered', async () => {
      expect(
        canvas.getByRole('button', { name: 'Back to data integrations' }),
      ).toBeInTheDocument();
    });
  },
};

/**
 * Without org admin the destructive actions are withheld, but the page still
 * renders in full.
 */
export const NonAdmin: Story = {
  parameters: {
    services: { isOrgAdmin: false },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('The page renders', async () => {
      await canvas.findAllByText('AWS production account');
    });

    await step('The Actions dropdown is withheld', async () => {
      expect(
        canvas.queryByRole('button', { name: 'Actions' }),
      ).not.toBeInTheDocument();
    });

    await step('Save and Cancel remain', async () => {
      expect(canvas.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(
        canvas.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
    });
  },
};
