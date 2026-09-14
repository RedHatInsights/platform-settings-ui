import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, within } from 'storybook/test';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { StorybookMockProvider } from '@redhat-cloud-services/hcc-storybook-hub';
import {
  waitForModal,
  waitForModalClose,
} from '../../shared/interactionHelpers';
import DataIntegrationsPage from './DataIntegrationsPage';
import MyDataIntegrationsTab from './components/MyDataIntegrationsTab';
import AboutTab from './components/AboutTab';

const DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html-single/configuring_cloud_integrations_for_red_hat_services/index';

/**
 * Renders the current pathname so play functions can assert on tab navigation
 * without reaching into router internals.
 */
const LocationProbe = () => {
  const { pathname } = useLocation();
  return <div data-testid="location-probe">{pathname}</div>;
};

/**
 * The Data Integrations page shell — page header, the "Add data integration"
 * dropdown, and the two routed tabs.
 *
 * The tab bodies are placeholders: the integrations table lands with
 * RHCLOUD-50925 and the About content with RHCLOUD-49534.
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
              <Route path="about" element={<AboutTab />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </StorybookMockProvider>
    ),
  ],
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

    await step('The default tab body renders', async () => {
      expect(
        canvas.getByText('The data integrations table is coming soon.'),
      ).toBeInTheDocument();
    });

    await step('The add dropdown is available and enabled', async () => {
      expect(
        canvas.getByRole('button', { name: 'Add data integration' }),
      ).toBeEnabled();
    });
  },
};

/**
 * Selecting a tab swaps the routed body and updates the URL, so a reload or a
 * shared link lands on the same tab.
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
      await canvas.findByText('/settings/data-integrations/about');
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
        canvas.getByText('Data integration onboarding content is coming soon.'),
      ).toBeInTheDocument();
    });

    await step('Switch back to My data integrations', async () => {
      await user.click(
        canvas.getByRole('tab', { name: 'My data integrations' }),
      );
      await canvas.findByText('The data integrations table is coming soon.');
      expect(
        canvas.getByRole('tab', { name: 'My data integrations' }),
      ).toHaveAttribute('aria-selected', 'true');
    });
  },
};

/**
 * Deep-linking straight to /about restores the About tab. This is the payoff of
 * routing the tabs rather than holding the active tab in component state.
 */
export const DeepLinkedAboutTab: Story = {
  parameters: { initialRoute: '/settings/data-integrations/about' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('About is active on first render', async () => {
      const aboutTab = await canvas.findByRole('tab', { name: 'About' });
      expect(aboutTab).toHaveAttribute('aria-selected', 'true');
      expect(
        canvas.getByText('Data integration onboarding content is coming soon.'),
      ).toBeInTheDocument();
    });
  },
};

/**
 * The dropdown lists the four supported providers in two groups and opens the
 * (placeholder) creation wizard for whichever one is picked.
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

      const modal = await waitForModal();
      expect(
        modal.getByText(
          'The creation wizard for Amazon Web Services is not available yet. It will be added in a follow-up release.',
        ),
      ).toBeInTheDocument();
    });

    await step('Closing the wizard returns to the page', async () => {
      const modal = await waitForModal();
      const closeButtons = modal.getAllByRole('button', { name: /close/i });
      await user.click(closeButtons[closeButtons.length - 1]);
      await waitForModalClose();
    });
  },
};
