import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import CheckCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/check-circle-icon';

const OPERATOR_DOCS =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-install_cost_operator';

const copy = defineMessages({
  trackTitle: {
    id: 'dataIntegrations.openshift.trackTitle',
    defaultMessage: 'Track Red Hat committed spend',
  },
  trackDescription: {
    id: 'dataIntegrations.openshift.trackDescription',
    defaultMessage:
      'Track spend through Red Hat OpenShift Container Platform and apply them to your Red Hat committed spend.',
  },
  costTitle: {
    id: 'dataIntegrations.openshift.costTitle',
    defaultMessage: 'Cost Management',
  },
  costDescription: {
    id: 'dataIntegrations.openshift.costDescription',
    defaultMessage:
      'Analyze, forecast, and optimize your Red Hat OpenShift cluster costs in hybrid cloud environments.',
  },
  operator: {
    id: 'dataIntegrations.openshift.operator',
    defaultMessage:
      'For Red Hat OpenShift Container Platform 4.6 and later, install the {operator} from the OpenShift Container Platform web console.',
  },
  learnMore: {
    id: 'dataIntegrations.openshift.learnMore',
    defaultMessage: 'Learn more',
  },
  stop: {
    id: 'dataIntegrations.openshift.operatorStop',
    defaultMessage:
      'If you configured the operator to create an integration (create_source: true), {stop} here and {cancel} out of this flow.',
  },
  clusterId: {
    id: 'dataIntegrations.openshift.operatorClusterId',
    defaultMessage:
      'Otherwise, enter the cluster identifier below. You can find the cluster identifier in the cluster’s Help > About screen.',
  },
});

export const OpenShiftApplicationDescription: React.FC = () => {
  const intl = useIntl();
  const points = [
    [copy.trackTitle, copy.trackDescription],
    [copy.costTitle, copy.costDescription],
  ] as const;

  return (
    <Stack className="pf-v6-u-ml-lg">
      {points.map(([title, description]) => (
        <StackItem key={title.id} className="pf-v6-u-mb-sm">
          <Flex>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <CheckCircleIcon
                color="var(--pf-t--global--icon--color--status--success--default)"
                aria-hidden="true"
              />
            </FlexItem>
            <FlexItem>
              <Content component="p" className="pf-v6-u-mb-xs">
                {intl.formatMessage(title)}
              </Content>
              <Content component="p">{intl.formatMessage(description)}</Content>
            </FlexItem>
          </Flex>
        </StackItem>
      ))}
    </Stack>
  );
};

export const OpenShiftOperatorInstructions: React.FC = () => {
  const intl = useIntl();

  return (
    <Content>
      <p>
        <FormattedMessage
          {...copy.operator}
          values={{
            operator: (chunks) => <strong>{chunks}</strong>,
          }}
        />
      </p>
      <p>
        <a href={OPERATOR_DOCS} target="_blank" rel="noopener noreferrer">
          {intl.formatMessage(copy.learnMore)}
        </a>
      </p>
      <p>
        <FormattedMessage
          {...copy.stop}
          values={{
            stop: (chunks) => <strong>{chunks}</strong>,
            cancel: (chunks) => <strong>{chunks}</strong>,
          }}
        />
      </p>
      <p>{intl.formatMessage(copy.clusterId)}</p>
    </Content>
  );
};
