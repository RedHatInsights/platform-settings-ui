import type { AxiosInstance } from 'axios';

export interface Notification {
  variant: 'success' | 'danger' | 'warning' | 'info' | 'custom';
  title: React.ReactNode;
  description?: React.ReactNode;
}

export type Environment = 'production' | 'stage' | 'qa';

export type NotificationVariant = 'success' | 'danger' | 'warning' | 'info';

export type NotifyFn = (
  variant: NotificationVariant,
  title: string,
  description?: string,
) => void;

export interface AppServices {
  appAction: (action: string) => void;
  addNotification: (notification: Notification) => void;
  getToken: () => Promise<string>;
  environment: Environment;
  axios: AxiosInstance;
  notify: NotifyFn;
}
