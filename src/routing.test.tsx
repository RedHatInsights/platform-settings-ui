import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Routing from './Routing';

const languagePath = '/settings/user-preferences/language';

const renderChromeRoute = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path={`${languagePath}/*`} element={<Routing />} />
        <Route path="*" element={<h1>Outside Language</h1>} />
      </Routes>
    </MemoryRouter>,
  );

test.each([languagePath, `${languagePath}/`])(
  'renders Language at %s',
  (path) => {
    renderChromeRoute(path);
    expect(screen.getByRole('heading', { name: 'Language' })).toBeVisible();
  },
);

test('renders the Language fallback for an undefined child', () => {
  renderChromeRoute(`${languagePath}/missing`);
  expect(
    screen.getByRole('heading', { name: 'Language page not found' }),
  ).toBeVisible();
});

test.each([
  '/settings',
  '/settings/user-preferences',
  '/settings/user-preferences/notifications',
  '/settings/user-preferences/languages',
])('does not mount Language at %s', (path) => {
  renderChromeRoute(path);
  expect(
    screen.getByRole('heading', { name: 'Outside Language' }),
  ).toBeVisible();
});
