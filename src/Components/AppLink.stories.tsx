/**
 * Component Stories — AppLink
 *
 * AppLink wraps React Router's Link with automatic basename prepending.
 * The basename is derived from Chrome's getBundle()/getApp() at runtime,
 * so links always resolve correctly regardless of deployment path.
 *
 * Use AppLink for declarative navigation. For programmatic navigation,
 * use useAppNavigate() instead.
 *
 * @component AppLink (src/Components/AppLink/)
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { expect, userEvent, within } from 'storybook/test';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';
import { AppLink } from './AppLink';

const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

const meta: Meta<typeof AppLink> = {
  component: AppLink,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/settings/user-preferences']}>
        <Routes>
          <Route
            path="/settings/user-preferences/*"
            element={
              <>
                <Story />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppLink>;

export const Default: Story = {
  args: {
    to: '/language',
    children: 'Language',
  },
  play: async ({ canvasElement, step }) => {
    const user = userEvent.setup();

    await step('Verify link renders with correct text', async () => {
      const canvas = within(canvasElement);
      const link = canvas.getByRole('link', { name: 'Language' });
      expect(link).toBeInTheDocument();
    });

    await step('Click link and verify navigation', async () => {
      const canvas = within(canvasElement);
      const link = canvas.getByRole('link', { name: 'Language' });
      await user.click(link);
      const location = canvas.getByTestId('current-location');
      expect(location.textContent).toBe('/settings/user-preferences/language');
    });
  },
};

export const IdempotentBasename: Story = {
  args: {
    to: '/settings/user-preferences/language',
    children: 'Already prefixed link',
  },
  play: async ({ canvasElement, step }) => {
    const user = userEvent.setup();

    await step(
      'Click link with already-prefixed path — should not double-prepend',
      async () => {
        const canvas = within(canvasElement);
        const link = canvas.getByRole('link', {
          name: 'Already prefixed link',
        });
        await user.click(link);
        const location = canvas.getByTestId('current-location');
        expect(location.textContent).toBe(
          '/settings/user-preferences/language',
        );
      },
    );
  },
};
