import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import {
  MemoryRouter,
  Route,
  Routes,
  useOutletContext,
} from 'react-router-dom';
// eslint-disable-next-line no-restricted-imports -- Page test stubs Chrome's document title hook
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useAppServices } from '../../shared/ServiceContext';
import DataIntegrationsPage from './DataIntegrationsPage';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: jest.fn(),
}));
jest.mock('../../shared/ServiceContext', () => ({
  useAppServices: jest.fn(),
}));
jest.mock('./components/AddIntegrationWizard', () => ({
  __esModule: true,
  default: ({ sourceType }: { sourceType: string }) => (
    <div data-testid="integration-wizard">{sourceType}</div>
  ),
}));

const List = () => {
  const { canWrite } = useOutletContext<{ canWrite: boolean }>();
  return <div data-testid="list-permission">{String(canWrite)}</div>;
};

function renderPage(isOrgAdmin: boolean) {
  jest
    .mocked(useAppServices)
    .mockReturnValue({ isOrgAdmin } as ReturnType<typeof useAppServices>);
  return render(
    <IntlProvider locale="en">
      <MemoryRouter initialEntries={['/settings/data-integrations?add=amazon']}>
        <Routes>
          <Route
            path="/settings/data-integrations"
            element={<DataIntegrationsPage />}
          >
            <Route index element={<List />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </IntlProvider>,
  );
}

beforeEach(() => {
  jest.mocked(useChrome).mockReturnValue({
    updateDocumentTitle: jest.fn(),
  } as ReturnType<typeof useChrome>);
});

it('does not open the deep-linked wizard for a non-admin', () => {
  renderPage(false);

  expect(
    screen.getByRole('button', { name: 'Add data integration' }),
  ).toBeDisabled();
  expect(screen.queryByTestId('integration-wizard')).not.toBeInTheDocument();
  expect(screen.getByTestId('list-permission')).toHaveTextContent('false');
});

it('opens the deep-linked wizard for an admin', () => {
  renderPage(true);

  expect(
    screen.getByRole('button', { name: 'Add data integration' }),
  ).toBeEnabled();
  expect(screen.getByTestId('integration-wizard')).toHaveTextContent('amazon');
  expect(screen.getByTestId('list-permission')).toHaveTextContent('true');
});
