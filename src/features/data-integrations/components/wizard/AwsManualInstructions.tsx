import React from 'react';
import { useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCopy } from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { useNewHccmStgAccount } from '../../../../capabilities/useNewHccmStgAccount';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../../data/api/sources';
import { useHcsEnrollment } from '../../data/queries/useHcsEnrollment';
import messages from '../../messages';
import type { IntegrationWizardValues } from './integrationWizardSchema';

const COST_APP = '/insights/platform/cost-management';
const RHEL_APP = '/insights/platform/cloud-meter';
const PROVISIONING_APP = '/insights/platform/provisioning';
const COST_GUIDE =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int';

const AwsManualInstructions: React.FC<{
  appName: string;
  applicationTypeId: string;
  stage:
    | 'details'
    | 'usage'
    | 'export-default'
    | 'export-custom'
    | 'tags'
    | 'policy'
    | 'role'
    | 'arn';
}> = ({ appName, applicationTypeId, stage }) => {
  const form = useFormApi();
  const intl = useIntl();
  const { axios } = useAppServices();
  const newHccmStgAccount = useNewHccmStgAccount();
  const { data: showHcs = false } = useHcsEnrollment(appName === COST_APP);
  const application = showHcs
    ? intl.formatMessage(messages.wizardAwsHcsName)
    : 'Cost Management';
  const values = form.getState().values as IntegrationWizardValues;
  const provisioning = useQuery({
    queryKey: ['aws-provisioning-account', applicationTypeId],
    queryFn: () =>
      createSourcesApi(axios).getAwsProvisioningAccount(applicationTypeId),
    enabled: appName === PROVISIONING_APP && stage === 'role',
    staleTime: 60 * 60 * 1000,
  });

  if (stage === 'details') {
    return (
      <Content>
        {appName === COST_APP ? (
          <p>
            {intl.formatMessage(messages.wizardAwsCostInstructions, {
              application,
            })}{' '}
            {!showHcs && (
              <a href={COST_GUIDE} target="_blank" rel="noopener noreferrer">
                {intl.formatMessage(messages.wizardAwsSetupInstructions)}
              </a>
            )}
          </p>
        ) : appName === RHEL_APP ? (
          <p>{intl.formatMessage(messages.wizardAwsRhelInstructions)}</p>
        ) : (
          <p>{intl.formatMessage(messages.wizardAwsAccountInstructions)}</p>
        )}
      </Content>
    );
  }

  if (
    stage === 'usage' ||
    stage === 'export-default' ||
    stage === 'export-custom' ||
    stage === 'tags'
  ) {
    const message = {
      usage: messages.wizardAwsCostUsageInstructions,
      'export-default': messages.wizardAwsCostExportDefault,
      'export-custom': messages.wizardAwsCostExportCustom,
      tags: messages.wizardAwsCostTagsInstructions,
    }[stage];
    return (
      <Content>
        <p>{intl.formatMessage(message, { application })}</p>
        {!showHcs && (
          <a href={COST_GUIDE} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages.wizardAwsSetupInstructions)}
          </a>
        )}
      </Content>
    );
  }

  if (stage === 'policy') {
    const bucket = String(values.application?.extra?.bucket ?? '');
    const policy =
      appName === COST_APP
        ? {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'VisualEditor0',
                Effect: 'Allow',
                Action: ['s3:Get*', 's3:List*'],
                Resource: [
                  `arn:aws:s3:::${bucket}`,
                  `arn:aws:s3:::${bucket}/*`,
                ],
              },
              {
                Sid: 'VisualEditor1',
                Effect: 'Allow',
                Action: [
                  's3:ListBucket',
                  'cur:DescribeReportDefinitions',
                  ...(values.aws?.aliases?.enabled
                    ? ['iam:ListAccountAliases']
                    : []),
                  ...(values.aws?.org_units?.enabled
                    ? ['organizations:List*', 'organizations:Describe*']
                    : []),
                ],
                Resource: '*',
              },
            ],
          }
        : {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'CloudigradePolicy',
                Effect: 'Allow',
                Action: ['sts:GetCallerIdentity'],
                Resource: '*',
              },
            ],
          };
    return (
      <Content>
        <p>{intl.formatMessage(messages.wizardAwsPolicyInstructions)}</p>
        <ClipboardCopy isCode isReadOnly>
          {JSON.stringify(policy, null, 2)}
        </ClipboardCopy>
      </Content>
    );
  }

  if (stage === 'arn') {
    return (
      <Content>
        <p>{intl.formatMessage(messages.wizardAwsArnInstructions)}</p>
        {appName === PROVISIONING_APP && values.meta?.account && (
          <ClipboardCopy
            isReadOnly
          >{`arn:aws:iam::${values.meta.account}:role/RH-HCC-provisioning-role`}</ClipboardCopy>
        )}
      </Content>
    );
  }

  if (appName === PROVISIONING_APP) {
    const template =
      'https://provisioning-public-assets.s3.amazonaws.com/AWSStack/provisioning.yml';
    const url = provisioning.data
      ? `https://console.aws.amazon.com/cloudformation/home#/stacks/quickcreate?templateURL=${encodeURIComponent(template)}&stackName=RH-HCC-provisioning-stack&param_RoleName=RH-HCC-provisioning-role&param_ProvisioningAwsAccount=${provisioning.data}&param_PolicyName=RH-HCC-provisioning-policy`
      : undefined;
    return (
      <Content>
        <p>{intl.formatMessage(messages.wizardAwsProvisioningInstructions)}</p>
        {provisioning.isError && (
          <p>{intl.formatMessage(messages.wizardAwsProvisioningError)}</p>
        )}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages.wizardAwsConnectCloudFormation)}
          </a>
        )}
      </Content>
    );
  }

  const trustAccountId =
    appName === RHEL_APP
      ? '998366406740'
      : newHccmStgAccount
        ? '148761653619'
        : '589173575009';

  return (
    <Content>
      <p>{intl.formatMessage(messages.wizardAwsCreateRoleInstructions)}</p>
      <p>{intl.formatMessage(messages.wizardAwsTrustAccount)}</p>
      <ClipboardCopy isReadOnly>{trustAccountId}</ClipboardCopy>
      <p>{intl.formatMessage(messages.wizardAwsFinishRole)}</p>
    </Content>
  );
};

export default AwsManualInstructions;
