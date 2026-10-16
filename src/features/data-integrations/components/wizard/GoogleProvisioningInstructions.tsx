import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { ClipboardCopy } from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { ExpandableSection } from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';
import { useGoogleProvisioningAccount } from '../../data/queries/useGoogleProvisioningAccount';
import type { IntegrationWizardValues } from './integrationWizardSchema';

const ROLE_NAME = 'RH_HCC_provisioning_role';
const PERMISSIONS = [
  'compute.disks.create',
  'compute.images.useReadOnly',
  'compute.instanceTemplates.create',
  'compute.instanceTemplates.list',
  'compute.instanceTemplates.useReadOnly',
  'compute.instances.create',
  'compute.instances.get',
  'compute.instances.list',
  'compute.instances.setLabels',
  'compute.instances.setMetadata',
  'compute.instances.setServiceAccount',
  'compute.networks.useExternalIp',
  'compute.subnetworks.use',
  'compute.subnetworks.useExternalIp',
  'iam.roles.get',
  'iam.serviceAccounts.actAs',
  'iam.serviceAccounts.getIamPolicy',
  'resourcemanager.projects.getIamPolicy',
  'serviceusage.services.use',
  'compute.instances.setTags',
  'compute.regions.list',
];

const copy = defineMessages({
  project: {
    id: 'dataIntegrations.googleProvisioning.project',
    defaultMessage: 'Log in to Google Cloud Platform and copy your project ID.',
  },
  intro: {
    id: 'dataIntegrations.googleProvisioning.intro',
    defaultMessage:
      'To delegate account access, create a custom role and grant it to the Red Hat service account.',
  },
  permissions: {
    id: 'dataIntegrations.googleProvisioning.permissions',
    defaultMessage: 'See role permissions',
  },
  steps: {
    id: 'dataIntegrations.googleProvisioning.steps',
    defaultMessage: 'Follow these steps to create the role:',
  },
  open: {
    id: 'dataIntegrations.googleProvisioning.open',
    defaultMessage:
      'Click Connect Google Cloud to open Cloud Shell in a new tab.',
  },
  paste: {
    id: 'dataIntegrations.googleProvisioning.paste',
    defaultMessage:
      'Paste this script in Cloud Shell and wait for the role creation and binding to finish.',
  },
  return: {
    id: 'dataIntegrations.googleProvisioning.return',
    defaultMessage: 'Return to this window and click Next.',
  },
  connect: {
    id: 'dataIntegrations.googleProvisioning.connect',
    defaultMessage: 'Connect Google Cloud',
  },
  loading: {
    id: 'dataIntegrations.googleProvisioning.loading',
    defaultMessage: 'Loading configuration...',
  },
  error: {
    id: 'dataIntegrations.googleProvisioning.error',
    defaultMessage:
      'There was an error while loading the commands. Please go back and return to this step to try again.',
  },
});

const GoogleProvisioningInstructions: React.FC<{
  stage: 'project' | 'role';
  applicationTypeId?: string;
}> = ({ stage, applicationTypeId }) => {
  const intl = useIntl();
  const { getState } = useFormApi();
  const account = useGoogleProvisioningAccount(
    stage === 'role' ? applicationTypeId : undefined,
  );
  const values = getState().values as IntegrationWizardValues;
  const projectId = values.authentication?.username ?? '';

  if (stage === 'project') {
    return (
      <Content>
        <p>{intl.formatMessage(copy.project)}</p>
      </Content>
    );
  }
  if (account.isError || !applicationTypeId) {
    return (
      <Alert
        isInline
        variant="warning"
        title={intl.formatMessage(copy.error)}
      />
    );
  }
  if (!account.data) {
    return (
      <Content>
        <p>{intl.formatMessage(copy.loading)}</p>
      </Content>
    );
  }

  const script = `ROLE_NAME=${ROLE_NAME} &&
PROJECT_ID=${projectId} &&
gcloud iam roles create "$ROLE_NAME" --project="$PROJECT_ID" --title="$ROLE_NAME" --permissions=${PERMISSIONS.join(',')} && \
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:${account.data}" --role="projects/$PROJECT_ID/roles/$ROLE_NAME"`;
  const cloudShellUrl = `https://console.cloud.google.com/cloudshell/editor?project=${encodeURIComponent(projectId)}&cloudshell=true&shellonly=true`;

  return (
    <Content>
      <p>{intl.formatMessage(copy.intro)}</p>
      <ExpandableSection
        toggleText={intl.formatMessage(copy.permissions)}
        isIndented
      >
        <ul>
          {PERMISSIONS.map((permission) => (
            <li key={permission}>{permission}</li>
          ))}
        </ul>
      </ExpandableSection>
      <p>{intl.formatMessage(copy.steps)}</p>
      <ol>
        <li>{intl.formatMessage(copy.open)}</li>
        <li>
          {intl.formatMessage(copy.paste)}
          <ClipboardCopy isReadOnly>{script}</ClipboardCopy>
        </li>
        <li>{intl.formatMessage(copy.return)}</li>
      </ol>
      <Button
        component="a"
        href={cloudShellUrl}
        target="_blank"
        rel="noopener noreferrer"
        isBlock
      >
        {intl.formatMessage(copy.connect)}
      </Button>
    </Content>
  );
};

export default GoogleProvisioningInstructions;
