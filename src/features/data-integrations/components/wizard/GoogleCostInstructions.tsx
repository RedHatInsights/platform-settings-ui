import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { ClipboardCopy } from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { useHcsEnrollment } from '../../data/queries/useHcsEnrollment';
import { useGoogleBillingAccount } from '../../data/queries/useGoogleBillingAccount';
import type { IntegrationWizardValues } from './integrationWizardSchema';

const COST_DOCS =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-integrate_google_cloud_data_with_cost_management';
const CUSTOM_DOCS =
  'https://access.redhat.com/documentation/en-us/hybrid_committed_spend/1-latest/html/integrating_google_cloud_data_into_cost_management/assembly-adding-filtered-gcp-int#configuring-function-post-reports-gcp-hcs_adding-filtered-gcp-int';

const copy = defineMessages({
  learnMore: {
    id: 'dataIntegrations.googleCost.learnMore',
    defaultMessage: 'Learn more',
  },
  project: {
    id: 'dataIntegrations.googleCost.project',
    defaultMessage:
      'Google Cloud Platform (GCP) recommends that you create a cloud project to contain all your billing administration needs. We’ll use this project to set up your BigQuery billing export.',
  },
  projectId: {
    id: 'dataIntegrations.googleCost.projectId',
    defaultMessage:
      'Enter the ID of a project within your GCP billing account.',
  },
  customize: {
    id: 'dataIntegrations.googleCost.customize',
    defaultMessage:
      'If you need to further customize the data sent to Cost Management, select the manually customize option for the additional setup instructions.',
  },
  bucket: {
    id: 'dataIntegrations.googleCost.bucket',
    defaultMessage:
      'You will need to create a cloud storage bucket that will contain the customized billing reports.',
  },
  bucketName: {
    id: 'dataIntegrations.googleCost.bucketName',
    defaultMessage:
      'After creating the cloud storage bucket, enter its name in the following:',
  },
  iamIntro: {
    id: 'dataIntegrations.googleCost.iamIntro',
    defaultMessage:
      'To specify GCP access permissions for Red Hat, create an Identity and Access Management (IAM) role.',
  },
  iamOpen: {
    id: 'dataIntegrations.googleCost.iamOpen',
    defaultMessage:
      'From the GCP console, navigate to <b>IAM & Admin > Roles.</b>',
  },
  iamCreate: {
    id: 'dataIntegrations.googleCost.iamCreate',
    defaultMessage: 'Create a new role.',
  },
  iamPermissions: {
    id: 'dataIntegrations.googleCost.iamPermissions',
    defaultMessage: 'Add the following permissions to your custom role:',
  },
  iamFinish: {
    id: 'dataIntegrations.googleCost.iamFinish',
    defaultMessage: 'Click <b>Create role.</b>',
  },
  accessIntro: {
    id: 'dataIntegrations.googleCost.accessIntro',
    defaultMessage:
      'To delegate account access, add a new member to your project.',
  },
  accessOpen: {
    id: 'dataIntegrations.googleCost.accessOpen',
    defaultMessage:
      'In your IAM & Admin console, navigate to <b>IAM</b> and click <b>Add</b> to add a new member.',
  },
  accessPaste: {
    id: 'dataIntegrations.googleCost.accessPaste',
    defaultMessage:
      'Paste the following value into the <b>New members</b> field:',
  },
  accessRole: {
    id: 'dataIntegrations.googleCost.accessRole',
    defaultMessage: 'Select the role you just created.',
  },
  accessSave: {
    id: 'dataIntegrations.googleCost.accessSave',
    defaultMessage: 'Click Save.',
  },
  accountLoading: {
    id: 'dataIntegrations.googleCost.accountLoading',
    defaultMessage: 'Loading account address...',
  },
  accountError: {
    id: 'dataIntegrations.googleCost.accountError',
    defaultMessage:
      'There is an error loading the account address. Please go back and return to this step.',
  },
  datasetIntro: {
    id: 'dataIntegrations.googleCost.datasetIntro',
    defaultMessage:
      'To collect and store the information needed for {application}, create a BigQuery dataset.',
  },
  datasetProject: {
    id: 'dataIntegrations.googleCost.datasetProject',
    defaultMessage:
      'In the BigQuery console, select your project (<b>{projectId}</b>) from the navigation menu.',
  },
  datasetCreate: {
    id: 'dataIntegrations.googleCost.datasetCreate',
    defaultMessage: 'Click <b>Create dataset.</b>',
  },
  datasetName: {
    id: 'dataIntegrations.googleCost.datasetName',
    defaultMessage:
      'In the <b>Dataset ID</b> field, enter a name for your dataset.',
  },
  billingIntro: {
    id: 'dataIntegrations.googleCost.billingIntro',
    defaultMessage:
      'To enable detailed billing data exports to BigQuery, set up daily cost export.',
  },
  billingOpen: {
    id: 'dataIntegrations.googleCost.billingOpen',
    defaultMessage: 'In the Billing console, click <b>Billing export.</b>',
  },
  billingTab: {
    id: 'dataIntegrations.googleCost.billingTab',
    defaultMessage: 'Click the <b>BigQuery export</b> tab.',
  },
  billingEdit: {
    id: 'dataIntegrations.googleCost.billingEdit',
    defaultMessage:
      'In the <b>Detailed usage cost</b> section, click <b>Edit settings.</b>',
  },
  billingSelect: {
    id: 'dataIntegrations.googleCost.billingSelect',
    defaultMessage:
      'Select the correct project and dataset from the dropdown menus.',
  },
  billingSave: {
    id: 'dataIntegrations.googleCost.billingSave',
    defaultMessage: 'Click <b>Save.</b>',
  },
});

type Stage = 'project' | 'bucket' | 'iam' | 'access' | 'dataset' | 'billing';

const GoogleAccessInstructions: React.FC = () => {
  const intl = useIntl();
  const account = useGoogleBillingAccount();
  const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

  return (
    <Content>
      <p>{intl.formatMessage(copy.accessIntro)}</p>
      <ol>
        <li>
          <FormattedMessage {...copy.accessOpen} values={{ b: bold }} />
        </li>
        <li>
          <FormattedMessage {...copy.accessPaste} values={{ b: bold }} />
        </li>
      </ol>
      {account.isError ? (
        <p role="alert">{intl.formatMessage(copy.accountError)}</p>
      ) : (
        <ClipboardCopy isReadOnly>
          {account.data ?? intl.formatMessage(copy.accountLoading)}
        </ClipboardCopy>
      )}
      <ol start={3}>
        <li>{intl.formatMessage(copy.accessRole)}</li>
        <li>
          <FormattedMessage {...copy.accessSave} values={{ b: bold }} />
        </li>
      </ol>
    </Content>
  );
};

const GoogleCostInstructions: React.FC<{ stage: Stage }> = ({ stage }) => {
  const intl = useIntl();
  const { getState } = useFormApi();
  const values = getState().values as IntegrationWizardValues;
  const { data: hcsEnrolled = false } = useHcsEnrollment(true);
  const custom = Boolean(values.application?.extra?.storage_only);
  const projectDocs = (
    <a href={COST_DOCS} target="_blank" rel="noopener noreferrer">
      {intl.formatMessage(copy.learnMore)}
    </a>
  );
  const bucketDocs = (
    <a href={CUSTOM_DOCS} target="_blank" rel="noopener noreferrer">
      {intl.formatMessage(copy.learnMore)}
    </a>
  );

  if (stage === 'access') return <GoogleAccessInstructions />;

  if (stage === 'project') {
    return (
      <Content>
        <p className="pf-v6-u-mb-lg">
          {intl.formatMessage(copy.project)} {!hcsEnrolled && projectDocs}
        </p>
        <p>{intl.formatMessage(copy.projectId)}</p>
        <p>{intl.formatMessage(copy.customize)}</p>
      </Content>
    );
  }
  if (stage === 'bucket') {
    return (
      <Content>
        <p>
          {intl.formatMessage(copy.bucket)} {bucketDocs}
        </p>
        <p>{intl.formatMessage(copy.bucketName)}</p>
      </Content>
    );
  }
  if (stage === 'iam') {
    const permissions = custom
      ? ['storage.buckets.get', 'storage.objects.get', 'storage.objects.list']
      : [
          'bigquery.jobs.create',
          'bigquery.tables.getData',
          'bigquery.tables.get',
          'bigquery.tables.list',
        ];
    const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
    return (
      <Content>
        <p>{intl.formatMessage(copy.iamIntro)}</p>
        <ol>
          <li>
            <FormattedMessage {...copy.iamOpen} values={{ b: bold }} />
          </li>
          <li>{intl.formatMessage(copy.iamCreate)}</li>
          <li>
            {intl.formatMessage(copy.iamPermissions)}
            <ul>
              {permissions.map((permission) => (
                <li key={permission}>
                  <strong>{permission}</strong>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <FormattedMessage {...copy.iamFinish} values={{ b: bold }} />
          </li>
        </ol>
      </Content>
    );
  }
  if (stage === 'dataset') {
    const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
    return (
      <Content>
        <p>
          {intl.formatMessage(copy.datasetIntro, {
            application: hcsEnrolled
              ? 'Hybrid Committed Spend'
              : 'Cost Management',
          })}
        </p>
        <ol>
          <li>
            <FormattedMessage
              {...copy.datasetProject}
              values={{
                b: bold,
                projectId: values.authentication?.username ?? '',
              }}
            />
          </li>
          <li>
            <FormattedMessage {...copy.datasetCreate} values={{ b: bold }} />
          </li>
          <li>
            <FormattedMessage {...copy.datasetName} values={{ b: bold }} />
          </li>
          <li>
            <FormattedMessage {...copy.datasetCreate} values={{ b: bold }} />
          </li>
        </ol>
      </Content>
    );
  }
  const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  return (
    <Content>
      <p>{intl.formatMessage(copy.billingIntro)}</p>
      <ol>
        <li>
          <FormattedMessage {...copy.billingOpen} values={{ b: bold }} />
        </li>
        <li>
          <FormattedMessage {...copy.billingTab} values={{ b: bold }} />
        </li>
        <li>
          <FormattedMessage {...copy.billingEdit} values={{ b: bold }} />
        </li>
        <li>{intl.formatMessage(copy.billingSelect)}</li>
        <li>
          <FormattedMessage {...copy.billingSave} values={{ b: bold }} />
        </li>
      </ol>
    </Content>
  );
};

export default GoogleCostInstructions;
