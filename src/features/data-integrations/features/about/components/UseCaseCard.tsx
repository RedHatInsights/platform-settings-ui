import React from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core/dist/dynamic/components/Card';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import PlusCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/plus-circle-icon';
import messages from '../messages';
import { PROVIDER_DOCS_URLS } from '../../../constants/docs';
import { getSourceTypeIcon } from '../../../constants/sourceTypeIcons';
import type { SourceTypeName } from '../../../types';

const ICON_SIZE = 32;

export interface UseCaseCardProps {
  /** Provider this card promotes. Doubles as the wizard's source type. */
  sourceType: SourceTypeName;
  /** Card heading, e.g. "Amazon Web Services (AWS)". */
  title: string;
  /**
   * Body sentence, already translated. Passed in rather than derived here
   * because the wording is not uniform across providers -- OpenShift connects
   * an "environment" where the others connect an "account".
   */
  description: string;
  /**
   * Whether the reader may create integrations. RHCLOUD-50927 wires this to
   * the Kessel permission check; until then callers pass `true`.
   */
  canWrite?: boolean;
  /** Opens the creation wizard for this provider. */
  onAddIntegration: (sourceType: SourceTypeName) => void;
}

/**
 * One tile in the About tab's "Use cases" grid: provider logo, an add action,
 * and a sentence that ends in a documentation link.
 */
const UseCaseCard: React.FC<UseCaseCardProps> = ({
  sourceType,
  title,
  description,
  canWrite = true,
  onAddIntegration,
}) => {
  const intl = useIntl();
  const iconSrc = getSourceTypeIcon(sourceType);

  const addButton = (
    <Button
      variant="link"
      icon={<PlusCircleIcon />}
      // isAriaDisabled rather than isDisabled: a truly disabled button drops
      // out of the tab order, which would hide the tooltip explaining why the
      // action is unavailable from keyboard and screen-reader users.
      isAriaDisabled={!canWrite}
      onClick={canWrite ? () => onAddIntegration(sourceType) : undefined}
      aria-label={intl.formatMessage(messages.addIntegrationForProvider, {
        provider: title,
      })}
      ouiaId={`add-integration-${sourceType}`}
    >
      {intl.formatMessage(messages.addIntegration)}
    </Button>
  );

  return (
    // variant="secondary" gives the grey fill the mock uses to separate these
    // tiles from the white "Use cases" card they sit inside. Not a selectable
    // card: these are four independent promos, not options in a choice, so
    // they deliberately skip the cards-as-tiles selectableActions pattern that
    // the wizard's SourceTypeCardSelect does use.
    //
    // Not isCompact: the compact padding leaves the copy sitting too close to the
    // bottom edge next to the roomier hero and documentation cards.
    //
    // isFullHeight keeps the two cards in a row the same height, which is what
    // the mock shows. The trade-off: the descriptions name their provider, so
    // "GCP" wraps to fewer lines than "OpenShift" at some widths, and there the
    // shorter card carries the leftover space under its text. Equal heights and
    // equal text-to-edge gaps cannot both hold while the copy length varies --
    // dropping isFullHeight buys equal gaps at the cost of ragged card heights.
    <Card isFullHeight variant="secondary">
      {/*
        Card anatomy rather than a hand-built Flex column: CardHeader puts the
        logo and the add action on one row, and CardTitle carries PatternFly's
        own title styling. component="h3" nests the provider names under the
        "Use cases" h2, so the grid is navigable by heading.
      */}
      <CardHeader
        actions={{
          actions: canWrite ? (
            addButton
          ) : (
            <Tooltip
              content={intl.formatMessage(
                messages.addIntegrationDisabledTooltip,
              )}
            >
              {addButton}
            </Tooltip>
          ),
        }}
      >
        {iconSrc && (
          <img src={iconSrc} alt="" width={ICON_SIZE} height={ICON_SIZE} />
        )}
      </CardHeader>

      <CardTitle component="h3">{title}</CardTitle>

      <CardBody>
        {description}{' '}
        <Button
          variant="link"
          isInline
          component="a"
          href={PROVIDER_DOCS_URLS[sourceType]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={intl.formatMessage(messages.useCaseLearnMoreLabel, {
            provider: title,
          })}
          ouiaId={`learn-more-${sourceType}`}
        >
          {intl.formatMessage(messages.useCaseLearnMore)}
        </Button>
      </CardBody>
    </Card>
  );
};

export default UseCaseCard;
