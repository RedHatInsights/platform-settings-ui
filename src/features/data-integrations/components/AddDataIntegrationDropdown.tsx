import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core/dist/dynamic/components/Dropdown';
import { MenuToggle } from '@patternfly/react-core/dist/dynamic/components/MenuToggle';
import AddIntegrationWizard from './AddIntegrationWizard';
import messages from '../messages';
import type { SourceTypeName } from '../types';

export interface AddDataIntegrationDropdownProps {
  /**
   * Disables the toggle. RHCLOUD-50927 wires this to the Kessel permission
   * check; until then the button is always enabled.
   */
  isDisabled?: boolean;
}

const AddDataIntegrationDropdown: React.FC<AddDataIntegrationDropdownProps> = ({
  isDisabled = false,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SourceTypeName | null>(null);

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    setIsOpen(false);
    setSelected(value as SourceTypeName);
  };

  const cloudProviders: { value: SourceTypeName; label: string }[] = [
    { value: 'amazon', label: intl.formatMessage(messages.amazonLabel) },
    { value: 'google', label: intl.formatMessage(messages.googleLabel) },
    { value: 'azure', label: intl.formatMessage(messages.azureLabel) },
  ];

  return (
    <>
      {selected && (
        <AddIntegrationWizard
          isOpen
          sourceType={selected}
          onClose={() => setSelected(null)}
        />
      )}
      <Dropdown
        isOpen={isOpen}
        onSelect={handleSelect}
        onOpenChange={setIsOpen}
        popperProps={{ appendTo: () => document.body, position: 'right' }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            isDisabled={isDisabled}
            variant="secondary"
          >
            {intl.formatMessage(messages.addDataIntegration)}
          </MenuToggle>
        )}
      >
        <DropdownGroup
          label={intl.formatMessage(messages.redHatIntegrationsGroup)}
        >
          <DropdownList>
            <DropdownItem value="openshift" key="openshift">
              {intl.formatMessage(messages.openshiftLabel)}
            </DropdownItem>
          </DropdownList>
        </DropdownGroup>
        <DropdownGroup
          label={intl.formatMessage(messages.otherCloudProvidersGroup)}
        >
          <DropdownList>
            {cloudProviders.map(({ value, label }) => (
              <DropdownItem value={value} key={value}>
                {label}
              </DropdownItem>
            ))}
          </DropdownList>
        </DropdownGroup>
      </Dropdown>
    </>
  );
};

export default AddDataIntegrationDropdown;
