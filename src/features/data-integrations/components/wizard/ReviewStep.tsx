import React from 'react';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type { UseFieldApiConfig } from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/dynamic/components/Content';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import {
  List,
  ListItem,
} from '@patternfly/react-core/dist/dynamic/components/List';
import {
  APPLICATIONS_FIELD,
  SOURCE_NAME_FIELD,
  SOURCE_TYPE_FIELD,
} from './integrationWizardSchema';
import type { ApplicationOption } from './ApplicationCheckboxSelect';
import './ReviewStep.scss';

export interface ReviewStepProps {
  /** Translated labels for each field shown in the review. */
  labels: {
    sourceType: string;
    name: string;
    applications: string;
  };
  /** Translated description shown above the summary. */
  description: string;
  /** Source type options to resolve names from the form value. */
  sourceTypeOptions: Array<{ value: string; label: string }>;
  /** Application options to resolve names from selected ids. */
  applicationOptions: ApplicationOption[];
}

/**
 * The `review-step` data-driven-forms component: a read-only summary of the
 * wizard's choices before submission.
 *
 * Every value is read from the live form state via `useFormApi`, so going
 * Back and changing something updates the review automatically when the user
 * returns.
 */
const ReviewStep: React.FC<UseFieldApiConfig> = (props) => {
  const { labels, description, sourceTypeOptions, applicationOptions } =
    useFieldApi(props) as unknown as ReviewStepProps;

  const formApi = useFormApi();
  const { values } = formApi.getState();

  const sourceTypeName = values[SOURCE_TYPE_FIELD] as string | undefined;
  const sourceName = values[SOURCE_NAME_FIELD] as string | undefined;
  const applicationIds = (values[APPLICATIONS_FIELD] ?? []) as string[];

  const sourceTypeLabel =
    sourceTypeOptions.find((opt) => opt.value === sourceTypeName)?.label ??
    sourceTypeName ??
    '';

  const selectedAppLabels = applicationIds
    .map(
      (id) => applicationOptions.find((opt) => opt.value === id)?.label ?? id,
    )
    .filter(Boolean);

  return (
    <div className="data-integrations-review-step">
      <Content component={ContentVariants.p}>{description}</Content>
      <DescriptionList isHorizontal isFluid>
        <DescriptionListGroup>
          <DescriptionListTerm>{labels.name}</DescriptionListTerm>
          <DescriptionListDescription>{sourceName}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{labels.sourceType}</DescriptionListTerm>
          <DescriptionListDescription>
            {sourceTypeLabel}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{labels.applications}</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedAppLabels.length === 1 ? (
              selectedAppLabels[0]
            ) : (
              <List isPlain>
                {selectedAppLabels.map((label) => (
                  <ListItem key={label}>{label}</ListItem>
                ))}
              </List>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </div>
  );
};

export default ReviewStep;
