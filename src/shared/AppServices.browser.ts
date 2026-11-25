import Axios from 'axios';
import type {
  AppServices,
  Environment,
  Notification,
} from './AppServices.types';

export function createBrowserServices(
  chrome: {
    appAction: (action: string) => void;
    auth: { getToken: () => Promise<string | undefined> };
    isBeta: () => boolean;
    isProd: () => boolean;
  },
  addNotification: (notification: Notification) => void,
): AppServices {
  const environment: Environment = chrome.isProd() ? 'production' : 'stage';

  const axiosInstance = Axios.create();
  axiosInstance.interceptors.request.use(async (config) => {
    const token = await chrome.auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const notify: AppServices['notify'] = (variant, title, description) => {
    addNotification({ variant, title, description });
  };

  return {
    appAction: chrome.appAction,
    addNotification,
    getToken: async () => (await chrome.auth.getToken()) ?? '',
    environment,
    axios: axiosInstance,
    notify,
  };
}
