import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useAzureLighthouse } from '../../../capabilities/useAzureLighthouse';
import AddIntegrationWizard from './AddIntegrationWizard';
import { useApplicationTypes } from '../data/queries/useApplicationTypes';
import { useAwsRegions } from '../data/queries/useAwsRegions';
import { useCreateSource } from '../data/queries/useCreateSource';
import { useHcsEnrollment } from '../data/queries/useHcsEnrollment';
import { useSourceTypes } from '../data/queries/useSourceTypes';
import { useAppServices } from '../../../shared/ServiceContext';

jest.mock('../data/queries/useApplicationTypes', () => ({
  useApplicationTypes: jest.fn(),
}));
jest.mock('../data/queries/useAwsRegions', () => ({
  useAwsRegions: jest.fn(),
}));
jest.mock('../data/queries/useCreateSource', () => ({
  useCreateSource: jest.fn(),
}));
jest.mock('../data/queries/useHcsEnrollment', () => ({
  useHcsEnrollment: jest.fn(),
}));
jest.mock('../data/queries/useSourceTypes', () => ({
  useSourceTypes: jest.fn(),
}));
jest.mock('../../../capabilities/useAzureLighthouse', () => ({
  useAzureLighthouse: jest.fn(),
}));
jest.mock('../../../shared/ServiceContext', () => ({
  useAppServices: jest.fn(),
}));
jest.mock('./wizard/IntegrationsFormRenderer', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { WizardSubmissionContext } = jest.requireActual<{
    WizardSubmissionContext: React.Context<{ onAddAnother: () => void }>;
  }>('./wizard/SubmissionResult');

  return {
    __esModule: true,
    default: ({
      onSubmit,
      onCancel,
    }: {
      onSubmit: (
        values: Record<string, unknown>,
        formApi: { getState: () => { values: Record<string, unknown> } },
      ) => void;
      onCancel: () => void;
    }) => {
      const { onAddAnother } = React.useContext(WizardSubmissionContext);
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'button',
          {
            onClick: () =>
              onSubmit(
                { source: { name: 'test-source' } },
                { getState: () => ({ values: { source_type: 'google' } }) },
              ),
          },
          'Submit form',
        ),
        React.createElement(
          'button',
          { onClick: onAddAnother },
          'Restart form',
        ),
        React.createElement('button', { onClick: onCancel }, 'Cancel form'),
      );
    },
  };
});

const mockCreateSource = {
  mutate: jest.fn(),
  reset: jest.fn(),
  isPending: false,
  isError: false,
  error: null,
  data: undefined,
};

const sourceTypes = [
  { id: '1', name: 'amazon', product_name: 'Amazon Web Services' },
  { id: '2', name: 'google', product_name: 'Google Cloud Platform' },
];

function renderWizard(onClose = jest.fn()) {
  return {
    onClose,
    ...render(
      <IntlProvider locale="en">
        <AddIntegrationWizard isOpen sourceType="google" onClose={onClose} />
      </IntlProvider>,
    ),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAppServices).mockReturnValue({
    axios: {},
  } as ReturnType<typeof useAppServices>);
  jest.mocked(useAzureLighthouse).mockReturnValue(false);
  jest.mocked(useSourceTypes).mockReturnValue({
    data: sourceTypes,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useSourceTypes>);
  jest.mocked(useApplicationTypes).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useApplicationTypes>);
  jest.mocked(useAwsRegions).mockReturnValue({
    data: [],
    isError: false,
  } as unknown as ReturnType<typeof useAwsRegions>);
  jest.mocked(useHcsEnrollment).mockReturnValue({
    data: false,
  } as unknown as ReturnType<typeof useHcsEnrollment>);
  jest
    .mocked(useCreateSource)
    .mockReturnValue(
      mockCreateSource as unknown as ReturnType<typeof useCreateSource>,
    );
});

it('merges a preselected provider into one source submission and enables wizard data queries', () => {
  renderWizard();

  expect(useAwsRegions).toHaveBeenCalledWith(true);
  expect(useHcsEnrollment).toHaveBeenCalledWith(true);
  fireEvent.click(screen.getByRole('button', { name: 'Submit form' }));

  expect(mockCreateSource.mutate).toHaveBeenCalledTimes(1);
  expect(mockCreateSource.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      sourceTypeName: 'google',
      name: 'test-source',
    }),
  );
});

it('resets the mutation when restarting or confirming exit', () => {
  const { onClose } = renderWizard();

  fireEvent.click(screen.getByRole('button', { name: 'Restart form' }));
  expect(mockCreateSource.reset).toHaveBeenCalledTimes(1);
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel form' }));
  fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
  expect(mockCreateSource.reset).toHaveBeenCalledTimes(2);
  expect(onClose).toHaveBeenCalledTimes(1);
});
