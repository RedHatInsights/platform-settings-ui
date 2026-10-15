import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import FormSpy from '@data-driven-forms/react-form-renderer/form-spy';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { ClipboardCopy } from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { MenuToggle } from '@patternfly/react-core/dist/dynamic/components/MenuToggle';
import {
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core/dist/dynamic/components/Select';
import { useHcsEnrollment } from '../../data/queries/useHcsEnrollment';
import type { IntegrationWizardValues } from './integrationWizardSchema';

const COST_DOCS =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest';
const STORAGE_DOCS = `${COST_DOCS}/integrate-adding_azure_int#creating-an-azure-storage-account`;
const ROLES_DOCS = `${COST_DOCS}/integrate-adding_azure_int#configuring-azure-roles`;
const EXPORT_DOCS = `${COST_DOCS}/integrate-adding_azure_int#configuring-an-azure-daily-export-schedule`;
const CUSTOM_DOCS = `${COST_DOCS}/integrate-azure_integration`;

const copy = defineMessages({
  learnMore: {
    id: 'dataIntegrations.azureCost.learnMore',
    defaultMessage: 'Learn more',
  },
  scopeIntro: {
    id: 'dataIntegrations.azureCost.scopeIntro',
    defaultMessage:
      'From the Azure portal, select the scope for the new cost export. If there is a need to further customize the data you want to send to Red Hat, select the manually customize option to follow the special instructions on how to.',
  },
  scopeAlert: {
    id: 'dataIntegrations.azureCost.scopeAlert',
    defaultMessage:
      'If your organization is converting systems from CentOS 7 to RHEL and using hourly billing, select Include RHEL usage.',
  },
  scopeLabel: {
    id: 'dataIntegrations.azureCost.scopeLabel',
    defaultMessage: 'Scope',
  },
  scopeCommand: {
    id: 'dataIntegrations.azureCost.scopeCommand',
    defaultMessage:
      'Run the following command in Cloud Shell to obtain the selected cost export scope. Enter its output below:',
  },
  scopeCustomTitle: {
    id: 'dataIntegrations.azureCost.scopeCustomTitle',
    defaultMessage: 'Skip this step and proceed to next step',
  },
  scopeCustom: {
    id: 'dataIntegrations.azureCost.scopeCustom',
    defaultMessage:
      'Since you have chosen to manually customize the data set you want to send to Cost Management, you do not need to specify an export scope at this point and time.',
  },
  storageIntro: {
    id: 'dataIntegrations.azureCost.storageIntro',
    defaultMessage:
      'Red Hat recommends creating a dedicated resource group and storage account in Azure to collect cost data and metrics for cost management.',
  },
  storageAfter: {
    id: 'dataIntegrations.azureCost.storageAfter',
    defaultMessage:
      'After configuring a resource group and storage account in the Azure portal, enter the following:',
  },
  exportIntro: {
    id: 'dataIntegrations.azureCost.exportIntro',
    defaultMessage:
      'Create a recurring task to export cost data to your Azure storage account, where Cost Management will retrieve the data.',
  },
  exportOpen: {
    id: 'dataIntegrations.azureCost.exportOpen',
    defaultMessage: 'From the Azure portal, add a new cost export.',
  },
  exportSettings: {
    id: 'dataIntegrations.azureCost.exportSettings',
    defaultMessage:
      'Provide a container name and directory path, use the settings below, and leave all other options at their defaults.',
  },
  exportType: {
    id: 'dataIntegrations.azureCost.exportType',
    defaultMessage: 'Export type',
  },
  exportTypeValue: {
    id: 'dataIntegrations.azureCost.exportTypeValue',
    defaultMessage: 'Daily export of month-to-date costs',
  },
  storageName: {
    id: 'dataIntegrations.azureCost.storageName',
    defaultMessage: 'Storage account name',
  },
  storageNameValue: {
    id: 'dataIntegrations.azureCost.storageNameValue',
    defaultMessage:
      'Created storage account name or existing storage account name',
  },
  resourceGroup: {
    id: 'dataIntegrations.azureCost.resourceGroup',
    defaultMessage: 'Resource group name',
  },
  resourceGroupValue: {
    id: 'dataIntegrations.azureCost.resourceGroupValue',
    defaultMessage: 'Resource group for the storage account',
  },
  exportAfter: {
    id: 'dataIntegrations.azureCost.exportAfter',
    defaultMessage: 'After configuring the daily export, enter its name below.',
  },
  subscription: {
    id: 'dataIntegrations.azureCost.subscription',
    defaultMessage:
      'Run the following command in Cloud Shell to obtain the Subscription ID where the cost export is stored, then enter it below:',
  },
  rolesIntro: {
    id: 'dataIntegrations.azureCost.rolesIntro',
    defaultMessage:
      'Red Hat recommends dedicated credentials to grant {application} read-only access to Azure cost data.',
  },
  rolesCreate: {
    id: 'dataIntegrations.azureCost.rolesCreate',
    defaultMessage:
      'Run this command in Cloud Shell to create a service principal with the Storage Blob Data Reader role. Enter the tenant, client ID, and secret from its output below:',
  },
  readerRole: {
    id: 'dataIntegrations.azureCost.readerRole',
    defaultMessage:
      'Run this command in Cloud Shell to create a Cost Management Reader role:',
  },
  billingRole: {
    id: 'dataIntegrations.azureCost.billingRole',
    defaultMessage:
      'Launch the Azure Portal and give the service principal created above the {role} role.',
  },
  enrollmentRole: {
    id: 'dataIntegrations.azureCost.enrollmentRole',
    defaultMessage:
      'Launch the Azure Enterprise Portal and give the service principal created above Administrator role on the associated account.',
  },
});

const SCOPE_COMMANDS: Record<string, string> = {
  Subscription: `az account show --query "{ id: id }" | jq '.id' | tr -d '"' | awk '{print "/subscriptions/"$0}'`,
  'Resource Group': `az group show --name {ResourceGroupName} | jq .id | tr -d '"'`,
  'Management Group': `az account management-group show --name "{GroupName}" | jq '.id' | tr -d '"'`,
  'Billing Account': `az billing account show --name "{billingAccountName}" | jq '.id' | tr -d '"'`,
  'Billing Profile': `az billing profile show --account-name "{billingAccountName}" --name "{billingProfileName}" | jq '.id' | tr -d '"'`,
  'Invoice Section': `az billing invoice section show --account-name "{billingAccountName}" --profile-name "{billingProfileName}" --name "{invoiceSectionName}" | jq '.id' | tr -d '"'`,
  'Enrollment Account': `az billing enrollment-account show --name "{enrollmentAccountName}" | jq '.id' | tr -d '"'`,
};

type Stage = 'scope' | 'storage' | 'export' | 'subscription' | 'roles';

const AzureCostContent: React.FC<{
  stage: Stage;
  values: IntegrationWizardValues;
}> = ({ stage, values }) => {
  const intl = useIntl();
  const [scopeType, setScopeType] = useState('Subscription');
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const { data: hcsEnrolled = false } = useHcsEnrollment(true);
  const extra = values.application?.extra;
  const custom = Boolean(extra?.storage_only);
  const link = (url: string) => (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {intl.formatMessage(copy.learnMore)}
    </a>
  );

  if (stage === 'scope') {
    return (
      <Content>
        <p>
          {intl.formatMessage(copy.scopeIntro)} {link(CUSTOM_DOCS)}
        </p>
        <Alert
          isInline
          variant="info"
          title={intl.formatMessage(copy.scopeAlert)}
        />
        {custom ? (
          <>
            <h4>{intl.formatMessage(copy.scopeCustomTitle)}</h4>
            <p>{intl.formatMessage(copy.scopeCustom)}</p>
          </>
        ) : (
          <>
            <label htmlFor="azure-cost-scope-type">
              {intl.formatMessage(copy.scopeLabel)}
            </label>
            <Select
              aria-label={intl.formatMessage(copy.scopeLabel)}
              selected={scopeType}
              isOpen={isScopeOpen}
              onOpenChange={setIsScopeOpen}
              onSelect={(_event, selection) => {
                if (typeof selection === 'string') {
                  setScopeType(selection);
                }
                setIsScopeOpen(false);
              }}
              maxMenuHeight="12rem"
              isScrollable
              popperProps={{
                appendTo: 'inline',
                enableFlip: true,
                preventOverflow: true,
                width: 'trigger',
              }}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  id="azure-cost-scope-type"
                  isExpanded={isScopeOpen}
                  isFullWidth
                  onClick={() => setIsScopeOpen((open) => !open)}
                >
                  {scopeType}
                </MenuToggle>
              )}
            >
              <SelectList>
                {Object.keys(SCOPE_COMMANDS).map((option) => (
                  <SelectOption key={option} value={option}>
                    {option}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
            <p>{intl.formatMessage(copy.scopeCommand)}</p>
            <ClipboardCopy isReadOnly>
              {SCOPE_COMMANDS[scopeType]}
            </ClipboardCopy>
          </>
        )}
      </Content>
    );
  }
  if (stage === 'storage') {
    return (
      <Content>
        <p>
          {intl.formatMessage(copy.storageIntro)}{' '}
          {!hcsEnrolled && link(STORAGE_DOCS)}
        </p>
        <p>{intl.formatMessage(copy.storageAfter)}</p>
      </Content>
    );
  }
  if (stage === 'export') {
    return (
      <Content>
        <p>
          {intl.formatMessage(copy.exportIntro)}{' '}
          {!hcsEnrolled && link(EXPORT_DOCS)}
        </p>
        <ol>
          <li>{intl.formatMessage(copy.exportOpen)}</li>
          <li>{intl.formatMessage(copy.exportSettings)}</li>
        </ol>
        <dl>
          <dt>{intl.formatMessage(copy.exportType)}</dt>
          <dd>{intl.formatMessage(copy.exportTypeValue)}</dd>
          <dt>{intl.formatMessage(copy.storageName)}</dt>
          <dd>{intl.formatMessage(copy.storageNameValue)}</dd>
          <dt>{intl.formatMessage(copy.resourceGroup)}</dt>
          <dd>{intl.formatMessage(copy.resourceGroupValue)}</dd>
        </dl>
        {!custom && <p>{intl.formatMessage(copy.exportAfter)}</p>}
      </Content>
    );
  }
  if (stage === 'subscription') {
    return (
      <Content>
        <p>{intl.formatMessage(copy.subscription)}</p>
        <ClipboardCopy
          isReadOnly
        >{`az account show --query "{ id: id }" | jq '.id' | tr -d '"'`}</ClipboardCopy>
      </Content>
    );
  }

  const subscriptionId = String(extra?.subscription_id ?? '');
  const resourceGroup = String(extra?.resource_group ?? '');
  const scope = String(extra?.scope || `/subscriptions/${subscriptionId}`);
  const billingScope = scope.includes('billingAccounts');
  const billingRole = scope.includes('invoiceSections')
    ? 'Invoice section reader'
    : scope.includes('billingProfiles')
      ? 'Billing profile reader'
      : 'Billing account reader';
  return (
    <Content>
      <p>
        {intl.formatMessage(copy.rolesIntro, {
          application: hcsEnrolled
            ? 'Hybrid Committed Spend'
            : 'Cost Management',
        })}{' '}
        {!hcsEnrolled && link(ROLES_DOCS)}
      </p>
      <p>{intl.formatMessage(copy.rolesCreate)}</p>
      <ClipboardCopy isReadOnly>
        {`az ad sp create-for-rbac -n "CostManagement" --role "Storage Blob Data Reader"  --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroup} --query '{"tenant": tenant, "client_id": appId, "secret": password}'`}
      </ClipboardCopy>
      {billingScope ? (
        <p>
          {intl.formatMessage(
            scope.includes('enrollmentAccounts')
              ? copy.enrollmentRole
              : copy.billingRole,
            { role: billingRole },
          )}{' '}
          {link(ROLES_DOCS)}
        </p>
      ) : !custom ? (
        <>
          <p>{intl.formatMessage(copy.readerRole)}</p>
          <ClipboardCopy isReadOnly>
            {`az role assignment create --assignee "${values.authentication?.username ?? ''}" --role "Cost Management Reader" --scope "${scope}"`}
          </ClipboardCopy>
        </>
      ) : null}
    </Content>
  );
};

const AzureCostInstructions: React.FC<{ stage: Stage }> = ({ stage }) => (
  <FormSpy subscription={{ values: true }}>
    {({ values }) => (
      <AzureCostContent
        stage={stage}
        values={values as IntegrationWizardValues}
      />
    )}
  </FormSpy>
);

export default AzureCostInstructions;
