import React, { useState } from 'react';
import { ExpandableSection } from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';
import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Checkbox } from '@patternfly/react-core/dist/dynamic/components/Checkbox';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import { useIntl } from 'react-intl';
import messages from '../messages';
import type {
  ApplicationType,
  Source,
  SourceApplication,
} from '../../../data/types/sources.types';

interface ConnectedApplicationsSectionProps {
  source: Source;
  applicationTypes?: ApplicationType[];
}

interface ApplicationItemProps {
  application: SourceApplication;
  applicationName: string;
  isChecked: boolean;
  onToggleCheck: (id: string, checked: boolean) => void;
}

/**
 * Individual application item with checkbox and name.
 *
 * In Phase 1, no application-specific fields are shown (expandable sections
 * removed). Future stories will add fields fetched from the authentications
 * endpoint.
 */
const ApplicationItem: React.FC<ApplicationItemProps> = ({
  application,
  applicationName,
  isChecked,
  onToggleCheck,
}) => {
  return (
    <StackItem>
      <Checkbox
        id={`app-${application.id}`}
        label={applicationName}
        isChecked={isChecked}
        onChange={(_event, checked) => onToggleCheck(application.id, checked)}
      />
    </StackItem>
  );
};

/**
 * Displays connected applications as an expandable section with checkboxes.
 *
 * Applications can be checked/unchecked (controlled, interactive) to demonstrate
 * the UI, but changes are not saved in Phase 1 — the Save button shows a toast
 * "coming soon".
 *
 * Application-specific fields (authentications) will be added in a future story
 * when we fetch from `/sources/:id/applications/:app_id/authentications`.
 *
 * Default state: Expanded for Active sources, collapsed otherwise.
 */
export const ConnectedApplicationsSection: React.FC<
  ConnectedApplicationsSectionProps
> = ({ source, applicationTypes = [] }) => {
  const intl = useIntl();

  const applications = source.applications ?? [];

  // Track which applications are checked (initialized from source.applications)
  const [checkedApps, setCheckedApps] = useState<Set<string>>(
    new Set(applications.map((app) => app.id)),
  );

  // Default expanded for Active sources
  const [isSectionExpanded, setIsSectionExpanded] = useState(
    source.availability_status === 'available',
  );

  const handleToggleCheck = (id: string, checked: boolean) => {
    setCheckedApps((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const getApplicationName = (app: SourceApplication): string => {
    const appType = applicationTypes.find(
      (t) => t.id === app.application_type_id,
    );
    return appType?.display_name ?? `Application ${app.application_type_id}`;
  };

  return (
    <ExpandableSection
      toggleText={intl.formatMessage(messages.connectedApplicationsTitle)}
      isExpanded={isSectionExpanded}
      onToggle={() => setIsSectionExpanded(!isSectionExpanded)}
    >
      {applications.length === 0 ? (
        <p>{intl.formatMessage(messages.noApplicationsConnected)}</p>
      ) : (
        <Form>
          <Stack hasGutter>
            {applications.map((app) => (
              <ApplicationItem
                key={app.id}
                application={app}
                applicationName={getApplicationName(app)}
                isChecked={checkedApps.has(app.id)}
                onToggleCheck={handleToggleCheck}
              />
            ))}
          </Stack>
        </Form>
      )}
    </ExpandableSection>
  );
};
