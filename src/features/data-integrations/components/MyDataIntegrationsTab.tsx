import React from 'react';
import { useIntl } from 'react-intl';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/dynamic/components/Content';
import messages from '../messages';

/**
 * PLACEHOLDER — the sources table lands with RHCLOUD-50925.
 *
 * That story replaces this body with `useTableState` + TableView, backed by
 * the `useSources` hook from the RHCLOUD-49536 data layer.
 */
const MyDataIntegrationsTab: React.FC = () => {
  const intl = useIntl();

  return (
    <Content component={ContentVariants.p}>
      {intl.formatMessage(messages.myDataIntegrationsPlaceholder)}
    </Content>
  );
};

export default MyDataIntegrationsTab;
