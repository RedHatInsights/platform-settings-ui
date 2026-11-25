import { useEffect } from 'react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import ErrorBoundary from './Components/ErrorBoundary';
import Routing from './Routing';
import './App.scss';

const App = () => {
  const { updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle('Language | Settings');
  }, [updateDocumentTitle]);

  return (
    <ErrorBoundary>
      <Routing />
    </ErrorBoundary>
  );
};

export default App;
