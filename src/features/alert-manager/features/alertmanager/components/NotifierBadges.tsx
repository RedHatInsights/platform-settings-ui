import React from 'react';
import { useIntl } from 'react-intl';
import {
  Label,
  LabelGroup,
} from '@patternfly/react-core/dist/dynamic/components/Label';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import EnvelopeIcon from '@patternfly/react-icons/dist/js/icons/envelope-icon';
import LinkIcon from '@patternfly/react-icons/dist/js/icons/link-icon';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/js/icons/open-drawer-right-icon';
import type { EndpointType, NotifierSummary } from '../types';
import messages from '../messages';

function getNotifierIcon(
  type: EndpointType,
  subType?: string,
): React.ReactNode {
  if (type === 'camel' && subType) {
    const iconMap: Record<string, string> = {
      slack: '/apps/frontend-assets/partners-icons/slack.svg',
      google_chat: '/apps/frontend-assets/partners-icons/google-chat.svg',
      teams: '/apps/frontend-assets/partners-icons/microsoft-office-teams.svg',
    };
    const src = iconMap[subType];
    if (src) {
      return <img src={src} alt="" width={14} height={14} />;
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

interface NotifierBadgesProps {
  notifiers: NotifierSummary[];
}

const NotifierBadges: React.FC<NotifierBadgesProps> = ({ notifiers }) => {
  const intl = useIntl();

  if (notifiers.length === 0) {
    return (
      <Label color="grey" variant="outline">
        {intl.formatMessage(messages.noNotifiers)}
      </Label>
    );
  }

  return (
    <LabelGroup>
      {notifiers.map((notifier) => {
        const key = notifier.subType
          ? `${notifier.type}:${notifier.subType}`
          : notifier.type;
        return (
          <Tooltip key={key} content={notifier.label}>
            <Label
              color="grey"
              variant="outline"
              icon={getNotifierIcon(notifier.type, notifier.subType)}
            >
              {notifier.label}
            </Label>
          </Tooltip>
        );
      })}
    </LabelGroup>
  );
};

export default NotifierBadges;
