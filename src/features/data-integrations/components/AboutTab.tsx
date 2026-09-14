import React from 'react';
import { useIntl } from 'react-intl';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/dynamic/components/Content';
import messages from '../messages';

/**
 * PLACEHOLDER — the onboarding content lands with RHCLOUD-49534.
 *
 * That story replaces this body with the "Get started" hero, the 2x2 use-case
 * card grid (AWS, Azure, GCP, OpenShift) and the recommended-content section.
 */
const AboutTab: React.FC = () => {
  const intl = useIntl();

  return (
    <Content component={ContentVariants.p}>
      {intl.formatMessage(messages.aboutPlaceholder)}
    </Content>
  );
};

export default AboutTab;
