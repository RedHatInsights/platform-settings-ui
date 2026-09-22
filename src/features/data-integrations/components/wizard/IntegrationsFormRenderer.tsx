import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import type { FormRendererProps } from '@data-driven-forms/react-form-renderer/form-renderer';
import type { ComponentMapper } from '@data-driven-forms/react-form-renderer/common-types';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import pf4ComponentMapper from '@data-driven-forms/pf4-component-mapper/component-mapper';
import SourceTypeCardSelect from './SourceTypeCardSelect';
import { CARD_SELECT_COMPONENT } from './integrationWizardSchema';

/**
 * Components this island adds on top of the PatternFly mapper.
 *
 * Exported so a story can render a single custom field in isolation without
 * standing up the whole wizard.
 */
export const mapperExtension = {
  [CARD_SELECT_COMPONENT]: SourceTypeCardSelect,
};

/**
 * The PatternFly form template without its Submit/Reset/Cancel row.
 *
 * A wizard renders its own footer, so leaving the template's controls on gives
 * every wizard a second, always-enabled submit button and a second Cancel —
 * which is both wrong and ambiguous to anything querying by accessible name.
 * `sources-ui` disables them the same way.
 */
const WizardFormTemplate: typeof FormTemplate = (props) => (
  <FormTemplate {...props} showFormControls={false} />
);

/**
 * `FormRenderer` pre-wired with the PatternFly mapper and this island's custom
 * components, mirroring `sources-ui`'s `SourcesFormRenderer`.
 *
 * Despite the name, `pf4-component-mapper` v4 peers on `@patternfly/react-core`
 * ^6 and renders PatternFly 6 — it is the current mapper, not a legacy one. It
 * does import the PatternFly root barrel internally, so the wizard pulls in the
 * full bundle; that happens inside `node_modules`, which is why the repo's ban
 * on global PatternFly imports does not fire on it. Our own files still use
 * dynamic sub-paths.
 */
export type IntegrationsFormRendererProps = Omit<
  FormRendererProps,
  'componentMapper' | 'FormTemplate'
> & {
  /** Extra or overriding components, merged last. */
  componentMapper?: ComponentMapper;
};

const IntegrationsFormRenderer: React.FC<IntegrationsFormRendererProps> = ({
  componentMapper,
  ...props
}) => (
  <FormRenderer
    FormTemplate={WizardFormTemplate}
    componentMapper={{
      ...pf4ComponentMapper,
      ...mapperExtension,
      ...componentMapper,
    }}
    {...props}
  />
);

export default IntegrationsFormRenderer;
