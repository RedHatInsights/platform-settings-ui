import React from 'react';
import { useIntl } from 'react-intl';
import { Flex } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import type {
  ApplicationType,
  SourceApplication,
} from '../../../data/types/sources.types';
import messages from '../messages';

interface ConnectedApplicationsCellProps {
  applications?: SourceApplication[];
  applicationTypes?: ApplicationType[];
}

/**
 * Displays connected applications as badge labels with status icons. Shows
 * "None" when no applications are attached to the source.
 */
const ConnectedApplicationsCell: React.FC<ConnectedApplicationsCellProps> = ({
  applications,
  applicationTypes,
}) => {
  const intl = useIntl();

  if (!applications || applications.length === 0) {
    return <span>{intl.formatMessage(messages.noApplications)}</span>;
  }

  const getLabelStatus = (
    application: SourceApplication,
  ): 'success' | 'warning' | 'danger' | 'info' | 'custom' | undefined => {
    // Paused takes precedence over availability status
    if (application.paused_at) {
      return 'info';
    }

    switch (application.availability_status) {
      case 'available':
        return 'success';
      case 'in_progress':
        return 'custom';
      case 'partially_available':
        return 'warning';
      case 'unavailable':
        return 'danger';
      default:
        return undefined;
    }
  };

  const getApplicationName = (applicationTypeId: string): string => {
    const applicationType = applicationTypes?.find(
      (type) => type.id === applicationTypeId,
    );
    return applicationType?.display_name ?? applicationTypeId;
  };

  return (
    <Flex gap={{ default: 'gapSm' }}>
      {applications.map((application) => {
        const labelStatus = getLabelStatus(application);
        return (
          <Label key={application.id} variant="outline" status={labelStatus}>
            {getApplicationName(application.application_type_id)}
          </Label>
        );
      })}
    </Flex>
  );
};

export default ConnectedApplicationsCell;
