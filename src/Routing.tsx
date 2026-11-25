import { PageSection } from '@patternfly/react-core/dist/dynamic/components/Page';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import { Route, Routes } from 'react-router-dom';

const Routing = () => (
  <Routes>
    <Route
      index
      element={
        <PageSection>
          <Title headingLevel="h1">Language</Title>
          <p>Language preferences are not available yet.</p>
        </PageSection>
      }
    />
    <Route
      path="*"
      element={
        <PageSection>
          <Title headingLevel="h1">Language page not found</Title>
        </PageSection>
      }
    />
  </Routes>
);

export default Routing;
