import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import type {
  UseFieldApiConfig,
  UseFieldApiProps,
} from '@data-driven-forms/react-form-renderer/use-field-api';
import { ClipboardCopy } from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import messages from '../../messages';

const AwsExternalId: React.FC<UseFieldApiConfig> = (props) => {
  const intl = useIntl();
  const { input } = useFieldApi(props) as UseFieldApiProps<string | undefined>;
  const form = useFormApi();
  const [id] = useState(
    () =>
      form.getState().values.authentication?.extra?.external_id ||
      crypto.randomUUID(),
  );

  useEffect(() => {
    if (!input.value) input.onChange(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing pattern
  }, [id]);

  return (
    <div>
      <p>{intl.formatMessage(messages.wizardAwsExternalId)}</p>
      <ClipboardCopy
        isReadOnly
        textAriaLabel={intl.formatMessage(messages.wizardAwsExternalIdLabel)}
      >
        {input.value || id}
      </ClipboardCopy>
    </div>
  );
};

export default AwsExternalId;
