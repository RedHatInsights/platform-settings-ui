import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from './AboutPage';

const openHelpTopic = fn();

const meta = {
  title: 'Features/SettingsOverview/AboutPage',
  component: AboutPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/settings/overview']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  beforeEach: () => {
    openHelpTopic.mockClear();
  },
} satisfies Meta<typeof AboutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - shows the Settings Overview About page with all content
 */
export const Default: Story = {
  parameters: {
    services: { openHelpTopic },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Page header displays correctly', async () => {
      const heading = await canvas.findByRole(
        'heading',
        { name: /settings overview/i },
        { timeout: 5000 },
      );
      expect(heading).toBeInTheDocument();
      expect(
        canvas.getByText(/manage all things related to eventing/i),
      ).toBeInTheDocument();
      expect(
        canvas.getByRole('link', { name: /learn more/i }),
      ).toBeInTheDocument();
    });

    await step('Learn more opens the help topic', async () => {
      await userEvent.click(canvas.getByRole('link', { name: /learn more/i }));
      expect(openHelpTopic).toHaveBeenCalledWith('learn');
    });

    await step('Section heading displays', async () => {
      expect(
        canvas.getByRole('heading', {
          name: /get started with hybrid cloud console settings/i,
        }),
      ).toBeInTheDocument();
    });

    await step('Alert Manager card displays', async () => {
      expect(canvas.getByText(/^alert manager$/i)).toBeInTheDocument();
      expect(
        canvas.getByText(/set up, modify, and view how fired events/i),
      ).toBeInTheDocument();
      expect(
        canvas.getByRole('button', { name: /manage alerts/i }),
      ).toBeInTheDocument();
    });

    await step('Data Integrations card displays', async () => {
      expect(canvas.getByText(/^data integrations$/i)).toBeInTheDocument();
      expect(
        canvas.getByText(/connect your cloud provider accounts/i),
      ).toBeInTheDocument();
      const dataIntegrationButtons = canvas.getAllByRole('button', {
        name: /manage data integrations/i,
      });
      expect(dataIntegrationButtons.length).toBeGreaterThan(0);
    });

    await step('Use Cases card displays with all 4 use cases', async () => {
      expect(canvas.getByText(/^use cases$/i)).toBeInTheDocument();

      // Verify all 4 use case titles are present
      expect(
        canvas.getByText(/customize your own alert notifiers/i),
      ).toBeInTheDocument();
      expect(
        canvas.getByText(
          /manage the default alert settings for your organization/i,
        ),
      ).toBeInTheDocument();
      expect(
        canvas.getByText(/view all fired events in your organization/i),
      ).toBeInTheDocument();
      expect(
        canvas.getByText(/integrate data from popular cloud providers/i),
      ).toBeInTheDocument();
    });

    await step('Recommended Content card displays', async () => {
      expect(canvas.getByText(/^recommended content$/i)).toBeInTheDocument();
      expect(
        canvas.getByText(/getting started with alert manager/i),
      ).toBeInTheDocument();
      expect(
        canvas.getByText(/data integrations best practices/i),
      ).toBeInTheDocument();
      expect(canvas.getByText(/settings documentation/i)).toBeInTheDocument();
    });
  },
};

/**
 * Use case expandable sections interaction
 */
export const ExpandableUseCases: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await step('Wait for page to render', async () => {
      await canvas.findByRole(
        'heading',
        { name: /settings overview/i },
        { timeout: 5000 },
      );
    });

    await step('First use case is expanded by default', async () => {
      expect(
        canvas.getByText(/determine how you, as an individual user/i),
      ).toBeInTheDocument();

      // Verify aria-expanded is true
      const useCase1Toggle = canvas.getByRole('button', {
        name: /customize your own alert notifiers/i,
      });
      expect(useCase1Toggle).toHaveAttribute('aria-expanded', 'true');
    });

    await step('Other use cases are collapsed initially', async () => {
      expect(
        canvas.queryByText(/configure alert notifications for your entire/i),
      ).not.toBeInTheDocument();
      expect(
        canvas.queryByText(/view a log of all fired events/i),
      ).not.toBeInTheDocument();
      expect(
        canvas.queryByText(/sync up your data sources from other/i),
      ).not.toBeInTheDocument();
    });

    await step('Expand second use case', async () => {
      const useCase2Toggle = canvas.getByRole('button', {
        name: /manage the default alert settings/i,
      });
      expect(useCase2Toggle).toHaveAttribute('aria-expanded', 'false');
      await user.click(useCase2Toggle);

      await waitFor(() => {
        expect(
          canvas.queryByText(/configure alert notifications for your entire/i),
        ).toBeInTheDocument();
      });
      expect(useCase2Toggle).toHaveAttribute('aria-expanded', 'true');
    });

    await step('Expand third use case', async () => {
      const useCase3Toggle = canvas.getByRole('button', {
        name: /view all fired events in your organization/i,
      });
      await user.click(useCase3Toggle);

      await waitFor(() => {
        expect(
          canvas.queryByText(/view a log of all fired events/i),
        ).toBeInTheDocument();
      });
      expect(useCase3Toggle).toHaveAttribute('aria-expanded', 'true');
    });

    await step('Expand fourth use case', async () => {
      const useCase4Toggle = canvas.getByRole('button', {
        name: /integrate data from popular cloud providers/i,
      });
      await user.click(useCase4Toggle);

      await waitFor(() => {
        expect(
          canvas.queryByText(/sync up your data sources from other/i),
        ).toBeInTheDocument();
      });
      expect(useCase4Toggle).toHaveAttribute('aria-expanded', 'true');
    });

    await step('Collapse first use case', async () => {
      const useCase1Toggle = canvas.getByRole('button', {
        name: /customize your own alert notifiers/i,
      });
      await user.click(useCase1Toggle);

      await waitFor(() => {
        expect(
          canvas.queryByText(/determine how you, as an individual user/i),
        ).not.toBeInTheDocument();
      });
      expect(useCase1Toggle).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

/**
 * Card navigation links
 */
export const NavigationLinks: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for page to render', async () => {
      await canvas.findByRole(
        'heading',
        { name: /settings overview/i },
        { timeout: 5000 },
      );
    });

    await step('Alert Manager card button exists', async () => {
      const alertManagerButton = canvas.getByRole('button', {
        name: /manage alerts/i,
      });
      expect(alertManagerButton).toBeInTheDocument();
    });

    await step('Data Integrations card button exists', async () => {
      const dataIntegrationsButton = canvas.getByRole('button', {
        name: /manage data integrations/i,
      });
      expect(dataIntegrationsButton).toBeInTheDocument();
    });

    await step('Use case buttons exist as links', async () => {
      // Use case buttons are AppLink with button classes, not Button components
      const useCaseLinks = canvas.getAllByRole('link');
      const linkTexts = useCaseLinks.map((link) => link.textContent);

      expect(
        linkTexts.some((text) => text?.includes('Manage my notifiers')),
      ).toBe(true);
      expect(
        linkTexts.some((text) =>
          text?.includes('Manage Organization notifiers'),
        ),
      ).toBe(true);
      expect(linkTexts.some((text) => text?.includes('View event log'))).toBe(
        true,
      );
      // Use case 4 also has "Manage data integrations"
      expect(
        linkTexts.filter((text) => text?.includes('Manage data integrations'))
          .length,
      ).toBeGreaterThanOrEqual(1);
    });

    await step('Recommended content links exist', async () => {
      const alertManagerLink = canvas.getByRole('link', {
        name: /getting started with alert manager/i,
      });
      expect(alertManagerLink).toBeInTheDocument();

      const dataIntLink = canvas.getByRole('link', {
        name: /data integrations best practices/i,
      });
      expect(dataIntLink).toBeInTheDocument();
    });
  },
};

/**
 * Recommended content links
 */
export const RecommendedContent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for page to render
    await waitFor(async () => {
      expect(
        await canvas.findByRole('heading', { name: /settings overview/i }),
      ).toBeInTheDocument();
    });

    // Check recommended content items are present
    expect(
      canvas.getByText(/getting started with alert manager/i),
    ).toBeInTheDocument();
    expect(
      canvas.getByText(/data integrations best practices/i),
    ).toBeInTheDocument();
    expect(canvas.getByText(/settings documentation/i)).toBeInTheDocument();

    // Check external documentation link
    const docLink = canvas.getByRole('link', {
      name: /settings documentation/i,
    });
    expect(docLink).toHaveAttribute(
      'href',
      'https://access.redhat.com/documentation/en-us/red_hat_hybrid_cloud_console',
    );
  },
};

/**
 * Button variants - Alert Manager uses primary, Data Integrations uses secondary
 */
export const ButtonVariants: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for page to render', async () => {
      await canvas.findByRole(
        'heading',
        { name: /settings overview/i },
        { timeout: 5000 },
      );
    });

    await step('Alert Manager button is primary variant', async () => {
      const alertButton = canvas.getByRole('button', {
        name: /manage alerts/i,
      });
      expect(alertButton).toHaveClass('pf-v6-c-button');
      expect(alertButton).toHaveClass('pf-m-primary');
    });

    await step(
      'Data Integrations card button is secondary variant',
      async () => {
        const dataIntButton = canvas.getByRole('button', {
          name: /manage data integrations/i,
        });
        expect(dataIntButton).toHaveClass('pf-v6-c-button');
        expect(dataIntButton).toHaveClass('pf-m-secondary');
      },
    );

    await step('Use case links styled as secondary buttons', async () => {
      // Use case buttons are AppLink elements with button classes
      const useCaseLinks = [
        canvas.getByRole('link', { name: /manage my notifiers/i }),
        canvas.getByRole('link', { name: /manage organization notifiers/i }),
        canvas.getByRole('link', { name: /view event log/i }),
      ];

      useCaseLinks.forEach((link) => {
        expect(link).toHaveClass('pf-v6-c-button');
        expect(link).toHaveClass('pf-m-secondary');
      });
    });
  },
};
