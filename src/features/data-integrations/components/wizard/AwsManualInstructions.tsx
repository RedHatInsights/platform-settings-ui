import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  ClipboardCopy,
  ClipboardCopyVariant,
} from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { ExpandableSection } from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import InfoCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/info-circle-icon';
import { useMeteredRhel } from '../../../../capabilities/useMeteredRhel';
import { useNewHccmStgAccount } from '../../../../capabilities/useNewHccmStgAccount';
import { useAppServices } from '../../../../shared/ServiceContext';
import { useHcsEnrollment } from '../../data/queries/useHcsEnrollment';
import { useAwsProvisioningAccount } from '../../data/queries/useAwsProvisioningAccount';
import messages from '../../messages';
import type { IntegrationWizardValues } from './integrationWizardSchema';

const COST_APP = '/insights/platform/cost-management';
const RHEL_APP = '/insights/platform/cloud-meter';
const PROVISIONING_APP = '/insights/platform/provisioning';
const COST_GUIDE =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int';
const COST_STORAGE_GUIDE =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int#creating-an-aws-s3-bucket-hcs-n';
const COST_ACCESS_GUIDE =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int#enabling-aws-account-access';
const COST_TAGS_GUIDE =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int#activating-aws-tags';
const PROVISIONING_ROLE_NAME = 'RH-HCC-provisioning-role';

const generateExternalId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
};

const PROVISIONING_PERMISSIONS = [
  'IAM:GetPolicyVersion',
  'IAM:GetPolicy',
  'IAM:ListAttachedRolePolicies',
  'IAM:GetRolePolicy',
  'IAM:ListRolePolicies',
  'EC2:CreateKeyPair',
  'EC2:CreateLaunchTemplate',
  'EC2:CreateLaunchTemplateVersion',
  'EC2:CreateTags',
  'EC2:DeleteKeyPair',
  'EC2:DeleteTags',
  'EC2:DescribeAvailabilityZones',
  'EC2:DescribeImages',
  'EC2:DescribeInstanceTypes',
  'EC2:DescribeInstances',
  'EC2:DescribeKeyPairs',
  'EC2:DescribeLaunchTemplates',
  'EC2:DescribeLaunchTemplateVersions',
  'EC2:DescribeRegions',
  'EC2:DescribeSecurityGroups',
  'EC2:DescribeSnapshotAttribute',
  'EC2:DescribeTags',
  'EC2:ImportKeyPair',
  'EC2:RunInstances',
  'EC2:StartInstances',
];

const AwsManualInstructions: React.FC<{
  appName: string;
  applicationTypeId: string;
  stage: 'details' | 'usage' | 'tags' | 'policy' | 'role' | 'arn';
}> = ({ appName, applicationTypeId, stage }) => {
  const form = useFormApi();
  const intl = useIntl();
  const { environment } = useAppServices();
  const newHccmStgAccount = useNewHccmStgAccount();
  const meteredRhel = useMeteredRhel();
  const { data: showHcs = false } = useHcsEnrollment(appName === COST_APP);
  const application = showHcs
    ? intl.formatMessage(messages.wizardAwsHcsName)
    : intl.formatMessage(messages.wizardAwsCostManagementName);
  const values = form.getState().values as IntegrationWizardValues;
  const [generatedExternalId] = React.useState(() =>
    stage === 'role' ? generateExternalId() : undefined,
  );
  const provisioning = useAwsProvisioningAccount(
    applicationTypeId,
    appName === PROVISIONING_APP && stage === 'role',
  );
  const externalId =
    values.authentication?.extra?.external_id ?? generatedExternalId;

  React.useEffect(() => {
    if (stage === 'role' && !values.authentication?.extra?.external_id) {
      form.change?.('authentication.extra.external_id', generatedExternalId);
    }
  }, [
    form,
    generatedExternalId,
    stage,
    values.authentication?.extra?.external_id,
  ]);

  if (stage === 'details') {
    return (
      <Content>
        {appName === COST_APP ? (
          <>
            <p>
              {intl.formatMessage(messages.wizardAwsCostStorageInstructions)}
              {!showHcs && (
                <>
                  <br />
                  <a
                    href={COST_STORAGE_GUIDE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {intl.formatMessage(messages.learnMore)}
                  </a>
                </>
              )}
            </p>
            <ol>
              <li>
                {intl.formatMessage(
                  messages.wizardAwsCostStorageBucketInstructions,
                )}
              </li>
            </ol>
          </>
        ) : appName === RHEL_APP ? (
          <p>{intl.formatMessage(messages.wizardAwsRhelInstructions)}</p>
        ) : (
          <p>{intl.formatMessage(messages.wizardAwsAccountInstructions)}</p>
        )}
      </Content>
    );
  }

  if (stage === 'usage') {
    if (values.application?.extra?.storage_only) {
      return (
        <EmptyState
          headingLevel="h4"
          titleText={intl.formatMessage(messages.wizardAwsSkipStep)}
          icon={InfoCircleIcon}
          variant={EmptyStateVariant.sm}
        >
          <EmptyStateBody>
            {intl.formatMessage(messages.wizardAwsCustomExportEmptyState)}
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <a href={COST_GUIDE} target="_blank" rel="noopener noreferrer">
                {intl.formatMessage(
                  messages.wizardAwsAdditionalConfigurationSteps,
                )}
              </a>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      );
    }

    const exportValues = [
      messages.wizardAwsCostExportType,
      messages.wizardAwsCostExportName,
      messages.wizardAwsCostExportResourceIds,
      messages.wizardAwsCostExportRefresh,
      messages.wizardAwsCostExportHourly,
      messages.wizardAwsCostExportServices,
      messages.wizardAwsCostExportCompression,
      messages.wizardAwsCostExportPrefix,
    ];

    return (
      <Content>
        <ol>
          <li>
            {intl.formatMessage(messages.wizardAwsCostExportCreate)}
            <ul>
              {exportValues.map((message) => (
                <li key={message.id}>{intl.formatMessage(message)}</li>
              ))}
            </ul>
          </li>
        </ol>
      </Content>
    );
  }

  if (stage === 'tags') {
    return (
      <>
        <Content>
          {!showHcs && (
            <p>
              <a
                href={COST_TAGS_GUIDE}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.formatMessage(messages.learnMore)}
              </a>
            </p>
          )}
          <p>
            {intl.formatMessage(messages.wizardAwsCostTagsInstructions, {
              application,
            })}
          </p>
          <ol>
            <li>{intl.formatMessage(messages.wizardAwsTagsOpenAllocation)}</li>
            <li>
              {intl.formatMessage(messages.wizardAwsTagsActivate, {
                application,
              })}
            </li>
          </ol>
        </Content>
        {meteredRhel && (
          <Alert
            isInline
            variant="info"
            className="pf-v6-u-mt-md pf-v6-u-mb-md"
            title={intl.formatMessage(messages.wizardAwsMeteredAlert)}
          />
        )}
      </>
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
        <p>
          {intl.formatMessage(messages.wizardAwsPolicyInstructions)}{' '}
          {!showHcs && (
            <a
              href={COST_ACCESS_GUIDE}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage(messages.learnMore)}
            </a>
          )}
        </p>
        <ol>
          <li>{intl.formatMessage(messages.wizardAwsIamSignIn)}</li>
          <li>{intl.formatMessage(messages.wizardAwsIamCreatePolicy)}</li>
          <ClipboardCopy
            isCode
            variant={ClipboardCopyVariant.expansion}
            className="pf-v6-u-m-sm-on-sm"
            isReadOnly
          >
            {JSON.stringify(policy, null, 2)}
          </ClipboardCopy>
          <li>{intl.formatMessage(messages.wizardAwsIamCompletePolicy)}</li>
        </ol>
        <p>
          <FormattedMessage
            {...messages.wizardAwsIamKeepBrowserOpen}
            values={{
              doNotClose: (chunks) => <strong>{chunks}</strong>,
            }}
          />
        </p>
      </Content>
    );
  }

  if (stage === 'arn') {
    return (
      <Content>
        <p>{intl.formatMessage(messages.wizardAwsArnInstructions)}</p>
        <ol>
          <li>{intl.formatMessage(messages.wizardAwsRoleSelect)}</li>
          <li>{intl.formatMessage(messages.wizardAwsRoleCopyArn)}</li>
        </ol>
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
      ? `https://console.aws.amazon.com/cloudformation/home#/stacks/quickcreate?templateURL=${encodeURIComponent(template)}&stackName=RH-HCC-provisioning-stack&param_RoleName=${PROVISIONING_ROLE_NAME}&param_ProvisioningAwsAccount=${provisioning.data}&param_PolicyName=RH-HCC-provisioning-policy`
      : undefined;
    if (provisioning.isError) {
      return (
        <Alert
          isInline
          variant="warning"
          title={intl.formatMessage(messages.wizardAwsProvisioningError)}
        />
      );
    }

    if (!provisioning.data) {
      return (
        <Content>
          <p>{intl.formatMessage(messages.wizardAwsProvisioningLoading)}</p>
        </Content>
      );
    }

    return (
      <Content>
        <p>{intl.formatMessage(messages.wizardAwsProvisioningInstructions)}</p>
        <ExpandableSection
          toggleText={intl.formatMessage(messages.wizardAwsRolePermissions)}
          isIndented
        >
          <ul>
            {PROVISIONING_PERMISSIONS.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        </ExpandableSection>
        <p>{intl.formatMessage(messages.wizardAwsProvisioningSteps)}</p>
        <ol>
          <li>{intl.formatMessage(messages.wizardAwsProvisioningStepOne)}</li>
          <li>{intl.formatMessage(messages.wizardAwsProvisioningStepTwo)}</li>
          <li>{intl.formatMessage(messages.wizardAwsProvisioningStepThree)}</li>
        </ol>
        {url && (
          <Button
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            isBlock
          >
            {intl.formatMessage(messages.wizardAwsConnectCloudFormation)}
          </Button>
        )}
      </Content>
    );
  }

  const trustAccountId =
    appName === RHEL_APP
      ? '998366406740'
      : newHccmStgAccount && environment === 'stage'
        ? '148761653619'
        : '589173575009';

  return (
    <Content>
      <p>{intl.formatMessage(messages.wizardAwsCreateRoleInstructions)}</p>
      <ol>
        <li>{intl.formatMessage(messages.wizardAwsCreateNewRole)}</li>
        <li>{intl.formatMessage(messages.wizardAwsTrustAccount)}</li>
        <ClipboardCopy className="pf-v6-u-m-sm-on-sm" isReadOnly>
          {trustAccountId}
        </ClipboardCopy>
        <li>{intl.formatMessage(messages.wizardAwsExternalId)}</li>
        <ClipboardCopy
          className="pf-v6-u-m-sm-on-sm"
          isReadOnly
          textAriaLabel={intl.formatMessage(messages.wizardAwsExternalIdLabel)}
        >
          {externalId ?? ''}
        </ClipboardCopy>
        <li>{intl.formatMessage(messages.wizardAwsAttachPolicy)}</li>
        <li>{intl.formatMessage(messages.wizardAwsFinishRole)}</li>
      </ol>
    </Content>
  );
};

export default AwsManualInstructions;
