import React from 'react';
import { type IntlShape, useIntl } from 'react-intl';
import {
  Label,
  LabelGroup,
} from '@patternfly/react-core/dist/dynamic/components/Label';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import { Skeleton } from '@patternfly/react-core/dist/dynamic/components/Skeleton';
import EnvelopeIcon from '@patternfly/react-icons/dist/js/icons/envelope-icon';
import LinkIcon from '@patternfly/react-icons/dist/js/icons/link-icon';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/js/icons/open-drawer-right-icon';
import type { EndpointType, NotifierSummary } from '../types';
import messages from '../messages';

const CAMEL_ICONS: Record<string, string> = {
  slack: '/apps/frontend-assets/partners-icons/slack.svg',
  google_chat: '/apps/frontend-assets/partners-icons/google-chat.svg',
  teams: '/apps/frontend-assets/partners-icons/microsoft-office-teams.svg',
};

function getNotifierLabel(
  intl: IntlShape,
  type: EndpointType,
  subType?: string,
): string {
  if (type === 'camel' && subType) {
    const subTypeMessages: Record<string, keyof typeof messages> = {
      slack: 'notifierSlack',
      google_chat: 'notifierGoogleChat',
      teams: 'notifierTeams',
      servicenow: 'notifierServiceNow',
      splunk: 'notifierSplunk',
    };
    const messageKey = subTypeMessages[subType];
    if (messageKey) {
      return intl.formatMessage(messages[messageKey]);
    }
    return subType;
  }

  const typeMessages: Partial<Record<EndpointType, keyof typeof messages>> = {
    email_subscription: 'notifierEmail',
    drawer: 'notifierDrawer',
    webhook: 'notifierWebhook',
    ansible: 'notifierAnsible',
    pagerduty: 'notifierPagerDuty',
    camel: 'notifierIntegration',
  };
  const messageKey = typeMessages[type];
  return messageKey ? intl.formatMessage(messages[messageKey]) : type;
}

function getNotifierIcon(
  label: string,
  type: EndpointType,
  subType?: string,
): React.ReactNode {
  if (type === 'camel' && subType) {
    const src = CAMEL_ICONS[subType];
    if (src) {
      return <img src={src} alt={label} width={14} height={14} />;
    }
  }

  const iconMap: Partial<Record<EndpointType, React.ReactNode>> = {
    email_subscription: <EnvelopeIcon />,
    drawer: <OpenDrawerRightIcon />,
    webhook: <LinkIcon />,
    ansible: <LinkIcon />,
    pagerduty: <LinkIcon />,
    camel: <LinkIcon />,
  };
  return iconMap[type] ?? <LinkIcon />;
}

export type NotifierBadgesStatus = 'pending' | 'error' | 'success';

interface NotifierBadgesProps {
  notifiers: NotifierSummary[];
  status?: NotifierBadgesStatus;
}

const NotifierBadges: React.FC<NotifierBadgesProps> = ({
  notifiers,
  status = 'success',
}) => {
  const intl = useIntl();

  if (status === 'pending') {
    return (
      <Skeleton
        width="80px"
        screenreaderText={intl.formatMessage(messages.loadingEventTypes)}
      />
    );
  }

  if (status === 'error') {
    return (
      <Label color="red" variant="outline">
        {intl.formatMessage(messages.notifiersError)}
      </Label>
    );
  }

  if (notifiers.length === 0) {
    return (
      <Label color="grey" variant="outline">
        {intl.formatMessage(messages.noNotifiers)}
      </Label>
    );
  }

  return (
    <LabelGroup numLabels={notifiers.length}>
      {notifiers.map((notifier) => {
        const key = notifier.subType
          ? `${notifier.type}:${notifier.subType}`
          : notifier.type;
        const label = getNotifierLabel(intl, notifier.type, notifier.subType);
        return (
          <Tooltip key={key} content={label}>
            <Label
              color="grey"
              variant="outline"
              icon={getNotifierIcon(label, notifier.type, notifier.subType)}
            >
              {label}
            </Label>
          </Tooltip>
        );
      })}
    </LabelGroup>
  );
};

export default NotifierBadges;
