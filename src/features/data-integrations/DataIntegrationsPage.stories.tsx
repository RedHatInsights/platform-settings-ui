import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, within } from 'storybook/test';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { StorybookMockProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import { waitForModalClose } from '../../shared/interactionHelpers';
import DataIntegrationsPage from './DataIntegrationsPage';
import MyDataIntegrationsTab from './components/MyDataIntegrationsTab';
import SourceDetailPage from './features/source-detail/SourceDetailPage';
import { createSourcesHandlers, sourcesDb } from './data/mocks/sources';

const DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html-single/configuring_cloud_integrations_for_red_hat_services/index';

/**
 * Renders the current location so play functions can assert on tab navigation
 * without reaching into router internals. Tabs live in the query string
 * (`?tab=about`), so the search has to be part of the probe.
 */
const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="location-probe">{`${pathname}${search}`}</div>;
};

/**
 * The Data Integrations page shell — page header, the "Add data integration"
 * dropdown, and the two routed tabs.
 *
 * The About tab renders its real content; the integrations table is still a
 * placeholder and lands with RHCLOUD-50925.
 *
 * The decorator nests a `StorybookMockProvider` with `app="data-integrations"`
 * because `useAppNavigate` builds its basename from Chrome's
 * `/${getBundle()}/${getApp()}`. In the real console `getApp()` is the second
 * path segment, so this reproduces the production basename
 * `/settings/data-integrations`.
 */
const meta = {
  title: 'Features/DataIntegrations/DataIntegrationsPage',
  component: DataIntegrationsPage,
  decorators: [
    (Story, { parameters }) => (
      <StorybookMockProvider bundle="settings" app="data-integrations">
        <MemoryRouter
          initialEntries={[
            parameters.initialRoute ?? '/settings/data-integrations',
          ]}
        >
          <LocationProbe />
          <Routes>
            <Route path="/settings/data-integrations" element={<Story />}>
              <Route index element={<MyDataIntegrationsTab />} />
              {/* Mirrors Routing.tsx: the detail view is a child of the shell,
                  which renders it standalone. Needed so a play function can
                  walk list -> detail -> list the way a user does. */}
              <Route path=":sourceId" element={<SourceDetailPage />} />
            </Route>
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
} satisfies Meta<typeof DataIntegrationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state — the shell on the "My data integrations" tab.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Header renders the title and subtitle', async () => {
      const heading = await canvas.findByRole('heading', {
        name: 'Data Integrations',
      });
      expect(heading).toBeInTheDocument();
      expect(
        canvas.getByText(
          'Manage your sourcing and sharing with popular cloud providers.',
        ),
      ).toBeInTheDocument();
    });

    await step('Learn more points at the cloud integrations doc', async () => {
      const learnMore = canvas.getByRole('link', { name: /learn more/i });
      expect(learnMore).toHaveAttribute('href', DOCS_URL);
      expect(learnMore).toHaveAttribute('target', '_blank');
    });

    await step(
      'Both tabs render with My data integrations active',
      async () => {
        expect(
          canvas.getByRole('tab', { name: 'My data integrations' }),
        ).toHaveAttribute('aria-selected', 'true');
        expect(canvas.getByRole('tab', { name: 'About' })).toHaveAttribute(
          'aria-selected',
          'false',
        );
      },
    );

    await step('The default tab body renders with table', async () => {
      // Wait for table view to load with data
      await expect(
        canvas.findByTestId('table-view', {}, { timeout: 10000 }),
      ).resolves.toBeInTheDocument();
    });

    await step('The add dropdown is available and enabled', async () => {
      expect(
        canvas.getByRole('button', { name: 'Add data integration' }),
      ).toBeEnabled();
    });
  },
};

/**
 * Selecting a tab swaps the body and updates the query string, so a reload or
 * a shared link lands on the same tab.
 */
export const SwitchToAboutTab: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Start on My data integrations', async () => {
      await canvas.findByRole('heading', { name: 'Data Integrations' });
      expect(canvas.getByTestId('location-probe')).toHaveTextContent(
        '/settings/data-integrations',
      );
    });

    await step('Click the About tab', async () => {
      await user.click(canvas.getByRole('tab', { name: 'About' }));
      await canvas.findByText('/settings/data-integrations?tab=about');
    });

    await step('About becomes active and renders its body', async () => {
      expect(canvas.getByRole('tab', { name: 'About' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(
        canvas.getByRole('tab', { name: 'My data integrations' }),
      ).toHaveAttribute('aria-selected', 'false');
      expect(
        canvas.getByRole('heading', {
          name: 'Get started with Data Integration',
        }),
      ).toBeInTheDocument();
    });

    await step('Switch back to My data integrations', async () => {
      await user.click(
        canvas.getByRole('tab', { name: 'My data integrations' }),
      );
      await canvas.findByTestId('table-view', {}, { timeout: 10000 });
      expect(
        canvas.getByRole('tab', { name: 'My data integrations' }),
      ).toHaveAttribute('aria-selected', 'true');
    });
  },
};

/**
 * Deep-linking straight to `?tab=about` restores the About tab. This is the
 * payoff of keeping the active tab in the URL rather than in component state.
 */
export const DeepLinkedAboutTab: Story = {
  parameters: { initialRoute: '/settings/data-integrations?tab=about' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('About is active on first render', async () => {
      const aboutTab = await canvas.findByRole('tab', { name: 'About' });
      expect(aboutTab).toHaveAttribute('aria-selected', 'true');
      expect(
        canvas.getByRole('heading', {
          name: 'Get started with Data Integration',
        }),
      ).toBeInTheDocument();
    });
  },
};

/**
 * Opening a source and coming back keeps the list as the user left it.
 *
 * `useTableState({ syncWithUrl: true })` puts page size, page, sort, and
 * filters in the list's query string, but the detail route does not inherit
 * it — so the table hands it over as router state and the detail page
 * navigates back to it. Without that, Cancel dropped the user on a default
 * list and their page size was silently gone.
 */
export const ListStateSurvivesDetailRoundTrip: Story = {
  parameters: {
    // Standing in for a user who set the page size and sorted the table.
    // Reaching the same state through the PatternFly pagination menu would
    // pin the story to a toggle whose only accessible name is its
    // "1 - 9 of 9" template.
    initialRoute:
      '/settings/data-integrations?perPage=100&sortBy=type&sortDir=asc',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('The list starts with page size and sort applied', async () => {
      await canvas.findByTestId('table-view', {}, { timeout: 10000 });
      await canvas.findByText(
        '/settings/data-integrations?perPage=100&sortBy=type&sortDir=asc',
      );
    });

    await step('Open a source from the table', async () => {
      await user.click(
        await canvas.findByRole('link', { name: 'AWS production account' }),
      );

      await canvas.findByText('/settings/data-integrations/101');
      // The route changes before the source query resolves, so the probe
      // updating is not enough — wait for the form itself.
      await canvas.findByRole('button', { name: 'Save' }, { timeout: 10000 });
    });

    await step('Cancel returns to the list with that state', async () => {
      await user.click(canvas.getByRole('button', { name: 'Cancel' }));

      // The trailing slash is how useAppNavigate joins onto the basename; the
      // route matches either way.
      await canvas.findByText(
        '/settings/data-integrations/?perPage=100&sortBy=type&sortDir=asc',
      );
      await canvas.findByTestId('table-view', {}, { timeout: 10000 });
    });
  },
};

/**
 * Reaching the detail view by deep link leaves no list state to return to, so
 * Cancel falls back to the default list rather than erroring.
 */
export const DeepLinkedDetailFallsBackToPlainList: Story = {
  parameters: { initialRoute: '/settings/data-integrations/101' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('The detail view renders', async () => {
      await canvas.findAllByText('AWS production account');
    });

    await step('Cancel lands on the list with no query string', async () => {
      await user.click(
        await canvas.findByRole(
          'button',
          { name: 'Cancel' },
          { timeout: 10000 },
        ),
      );

      await canvas.findByText('/settings/data-integrations/');
      await canvas.findByTestId('table-view', {}, { timeout: 10000 });
    });
  },
};

/**
 * The dropdown lists the four supported providers in two groups and opens the
 * creation wizard for whichever one is picked.
 */
export const AddIntegrationDropdown: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Open the dropdown', async () => {
      const toggle = await canvas.findByRole('button', {
        name: 'Add data integration',
      });
      await user.click(toggle);
    });

    // The menu is appended to document.body, so it lives outside the canvas.
    const body = within(document.body);

    await step('Both groups and all four providers are listed', async () => {
      await body.findByRole('menuitem', {
        name: 'OpenShift Container Platform',
      });

      expect(body.getByText('Red Hat integrations')).toBeInTheDocument();
      expect(body.getByText('Other cloud providers')).toBeInTheDocument();
      expect(
        body.getByRole('menuitem', { name: 'Amazon Web Services' }),
      ).toBeInTheDocument();
      expect(
        body.getByRole('menuitem', { name: 'Google Cloud Platform' }),
      ).toBeInTheDocument();
      expect(
        body.getByRole('menuitem', { name: 'Microsoft Azure' }),
      ).toBeInTheDocument();
    });

    await step('Selecting a provider opens the wizard for it', async () => {
      await user.click(
        body.getByRole('menuitem', { name: 'Amazon Web Services' }),
      );

      // The wizard replaces a loading modal once the provider catalogue
      // answers, so the dialog to assert on is not the first one rendered.
      // Picking from the dropdown answers the provider step, so it opens on
      // naming.
      await body.findByRole('heading', { name: 'Name integration' });
      expect(
        body.getByText(
          'Enter a name for your Amazon Web Services integration.',
        ),
      ).toBeInTheDocument();
    });

    await step('Closing the wizard returns to the page', async () => {
      await user.click(body.getByRole('button', { name: 'Cancel' }));
      await user.click(await body.findByRole('button', { name: 'Exit' }));
      await waitForModalClose();
    });
  },
};
