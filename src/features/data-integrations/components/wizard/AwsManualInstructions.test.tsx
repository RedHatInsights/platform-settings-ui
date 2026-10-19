import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useNewHccmStgAccount } from '../../../../capabilities/useNewHccmStgAccount';
import { createCliServices } from '../../../../shared/AppServices.cli';
import { ServiceProvider } from '../../../../shared/ServiceContext';
import AwsManualInstructions from './AwsManualInstructions';

const mockFormValues = {
  application: { extra: { bucket: 'cost-bucket' } },
  aws: { aliases: { enabled: false }, org_units: { enabled: false } },
};

jest.mock('@data-driven-forms/react-form-renderer/use-form-api', () => ({
  __esModule: true,
  default: () => ({
    getState: () => ({ values: mockFormValues }),
  }),
}));
jest.mock('../../../../capabilities/useNewHccmStgAccount', () => ({
  useNewHccmStgAccount: jest.fn(),
}));

const COST_APP = '/insights/platform/cost-management';
const RHEL_APP = '/insights/platform/cloud-meter';
const PROVISIONING_APP = '/insights/platform/provisioning';

function setup(
  appName: string,
  stage: 'details' | 'policy' | 'role',
  environment: 'stage' | 'production' | 'qa' = 'stage',
  mockGet?: (get: jest.SpyInstance) => void,
) {
  const services = createCliServices();
  services.environment = environment;
  const get = jest.spyOn(services.axios, 'get');
  get.mockResolvedValue({ data: { hcsDeal: false } });
  mockGet?.(get);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <IntlProvider locale="en">
      <ServiceProvider value={services}>
        <QueryClientProvider client={client}>
          <AwsManualInstructions
            appName={appName}
            applicationTypeId="3"
            stage={stage}
          />
        </QueryClientProvider>
      </ServiceProvider>
    </IntlProvider>,
  );
  return get;
}

beforeEach(() => {
  jest.mocked(useNewHccmStgAccount).mockReturnValue(false);
  mockFormValues.aws.aliases.enabled = false;
  mockFormValues.aws.org_units.enabled = false;
});

it('shows the Cost Management storage instructions and link', () => {
  setup(COST_APP, 'details');
  expect(
    screen.getByText(
      'To store the data export (previously called a cost and usage report) for cost management, create an Amazon S3 bucket.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
    'href',
    'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int#creating-an-aws-s3-bucket-hcs-n',
  );
});

it('shows a bucket-scoped cost policy', () => {
  setup(COST_APP, 'policy');
  const policy = screen.getByRole('textbox', { name: 'Copyable input' });
  expect(policy).toHaveAttribute(
    'value',
    expect.stringContaining('arn:aws:s3:::cost-bucket'),
  );
  expect(policy).not.toHaveAttribute(
    'value',
    expect.stringContaining('iam:ListAccountAliases'),
  );
});

it('includes account alias permissions when enabled', () => {
  mockFormValues.aws.aliases.enabled = true;
  setup(COST_APP, 'policy');
  const policy = screen.getByRole('textbox', { name: 'Copyable input' });
  expect(policy).toHaveAttribute(
    'value',
    expect.stringContaining('iam:ListAccountAliases'),
  );
  expect(policy).toHaveAttribute(
    'value',
    expect.stringContaining('arn:aws:s3:::cost-bucket'),
  );
});

it('includes organization permissions when enabled', () => {
  mockFormValues.aws.org_units.enabled = true;
  setup(COST_APP, 'policy');
  const policy = screen.getByRole('textbox', { name: 'Copyable input' });
  expect(policy).toHaveAttribute(
    'value',
    expect.stringContaining('organizations:List*'),
  );
  expect(policy).toHaveAttribute(
    'value',
    expect.stringContaining('organizations:Describe*'),
  );
});

it('shows the RHEL policy', () => {
  setup(RHEL_APP, 'policy');
  expect(
    screen.getByRole('textbox', { name: 'Copyable input' }),
  ).toHaveAttribute('value', expect.stringContaining('sts:GetCallerIdentity'));
});

it.each([
  ['stage', true, '148761653619'],
  ['stage', false, '589173575009'],
  ['production', true, '589173575009'],
  ['qa', true, '589173575009'],
] as const)(
  'shows the correct cost trust account in %s with flag %s',
  (environment, flag, account) => {
    jest.mocked(useNewHccmStgAccount).mockReturnValue(flag);
    setup(COST_APP, 'role', environment);
    expect(screen.getByRole('textbox', { name: 'Copyable input' })).toHaveValue(
      account,
    );
  },
);

it('keeps the RHEL trust account independent of the flag', () => {
  jest.mocked(useNewHccmStgAccount).mockReturnValue(true);
  setup(RHEL_APP, 'role');
  expect(screen.getByRole('textbox', { name: 'Copyable input' })).toHaveValue(
    '998366406740',
  );
});

it('shows the CloudFormation link only after the provisioning account loads', async () => {
  let resolve!: (value: { data: { data: Array<{ payload: string }> } }) => void;
  const pending = new Promise<{ data: { data: Array<{ payload: string }> } }>(
    (done) => {
      resolve = done;
    },
  );
  setup(PROVISIONING_APP, 'role', 'stage', (get) =>
    get.mockReturnValue(pending),
  );
  expect(
    screen.queryByRole('link', { name: 'Connect AWS with CloudFormation' }),
  ).not.toBeInTheDocument();
  await act(async () =>
    resolve({ data: { data: [{ payload: '012345678901' }] } }),
  );
  expect(
    await screen.findByRole('link', {
      name: 'Connect AWS with CloudFormation',
    }),
  ).toHaveAttribute(
    'href',
    expect.stringContaining('param_ProvisioningAwsAccount=012345678901'),
  );
});

it('shows a provisioning error when the request fails', async () => {
  setup(PROVISIONING_APP, 'role', 'stage', (get) =>
    get.mockRejectedValue(new Error('network failure')),
  );
  await waitFor(() =>
    expect(
      screen.getByText(/error while loading the commands/i),
    ).toBeInTheDocument(),
  );
  expect(
    screen.queryByRole('link', { name: 'Connect AWS with CloudFormation' }),
  ).not.toBeInTheDocument();
});
