import { createBrowserServices } from './AppServices.browser';
import { createCliServices } from './AppServices.cli';

const chrome = {
  appAction: jest.fn(),
  auth: { getToken: jest.fn().mockResolvedValue(undefined) },
  isBeta: jest.fn().mockReturnValue(false),
  isProd: jest.fn().mockReturnValue(false),
};

it('forwards help topics to Chrome when available', () => {
  const setActiveTopic = jest.fn();
  const services = createBrowserServices(
    { ...chrome, helpTopics: { setActiveTopic } },
    jest.fn(),
    false,
  );

  services.openHelpTopic('learn');

  expect(setActiveTopic).toHaveBeenCalledWith('learn');
});

it('allows help topics to be unavailable in Chrome', () => {
  const services = createBrowserServices(chrome, jest.fn(), false);

  expect(() => services.openHelpTopic('learn')).not.toThrow();
});

it('provides a no-op help topic service in CLI tests', () => {
  expect(() => createCliServices().openHelpTopic('learn')).not.toThrow();
});
