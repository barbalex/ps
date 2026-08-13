import { useIntl } from 'react-intl'

import { vectorLayerTypeOptions } from '../../../modules/constants.ts'
import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { Section } from '../../../components/shared/Section.tsx'
import { SectionDescription } from '../../../components/shared/SectionDescription.tsx'
import { useVectorLayerLabel } from '../../../modules/vectorLayerLabel.ts'
import { LayersDropdown } from './LayersDropdown.tsx'
import { DropdownField } from '../../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import { Property } from './Property.tsx'
import { CreateWfsService } from './CreateWfsService.tsx'

import '../../../form.css'

const vectorLayerTypes = vectorLayerTypeOptions
  .filter((o) => ['wfs', 'upload', 'own'].includes(o.value))
  .map((o) => o.value)

// this is just for presentation of data or filter values

export const VectorLayerForm = ({
  onChange,
  validations = {},
  row,
  isFilter,
  from,
}) => {
  const { formatMessage } = useIntl()
  const nameLabel = formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })
  const designationLabel = formatMessage({
    id: 'Fl3jPw',
    defaultMessage: 'Bezeichnung',
  })
  const vectorLayerTypeLabelMap = Object.fromEntries(
    vectorLayerTypeOptions
      .filter((o) => ['wfs', 'upload', 'own'].includes(o.value))
      .map((o) => [
        o.value,
        formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
      ]),
  )
  // Own layers derive their display label from place_levels (no stored label)
  const computedLabel = useVectorLayerLabel(row, row?.project_id)

  return (
    <>
      <RadioGroupField
        label={formatMessage({ id: 'xTeBn/', defaultMessage: 'Typ' })}
        name="type"
        list={vectorLayerTypes}
        labelMap={vectorLayerTypeLabelMap}
        value={row.type ?? ''}
        onChange={onChange}
      />
      {row?.type === 'wfs' && (
        <>
          <DropdownField
            label={formatMessage({
              id: 'Lo5MpR',
              defaultMessage: 'Web Feature Service (WFS)',
            })}
            name="wfs_service_id"
            labelField="url"
            table="wfs_services"
            value={row.wfs_service_id ?? ''}
            orderBy="url"
            onChange={onChange}
            autoFocus={true}
            validationMessage={
              row.wfs_service_id
                ? ''
                : formatMessage({
                    id: 'Mp6NqS',
                    defaultMessage:
                      'Aus einem konfigurierten WFS wählen. Oder einen neuen hinzufügen.',
                  })
            }
            noDataMessage={formatMessage({
              id: 'Nq7OrT',
              defaultMessage: 'Kein WFS gefunden. Du kannst einen hinzufügen.',
            })}
            hideWhenNoData={true}
          />
          {!row.wfs_service_id && <CreateWfsService vectorLayer={row} />}
          {!!row?.wfs_service_id && (
            <LayersDropdown
              vectorLayer={row}
              validationMessage={
                row.wfs_service_layer_name
                  ? ''
                  : formatMessage({
                      id: 'Or8PsU',
                      defaultMessage: 'Eine Ebene auswählen',
                    })
              }
            />
          )}
        </>
      )}
      {row?.type === 'upload' && <div>TODO: Upload</div>}
      {/* Name + localized labels.
          - own layers: label is derived from place_levels (read-only), name is system-set
          - wfs/upload: editable name + per-language label_de/en/fr/it (de fallback) */}
      {row?.type === 'own' ? (
        <TextFieldInactive
          label={designationLabel}
          name="label"
          value={computedLabel}
        />
      ) : isFilter ? (
        <TextField
          label={nameLabel}
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          validationMessage={validations?.name?.message}
          validationState={validations?.name?.state}
        />
      ) : (
        <>
          <TextField
            label={nameLabel}
            name="name"
            value={row.name ?? ''}
            onChange={onChange}
            validationMessage={validations?.name?.message}
            validationState={validations?.name?.state}
          />
          <Section title={designationLabel}>
            <SectionDescription>
              {formatMessage({
                id: 'vectorLayer.section.label.description',
                defaultMessage:
                  'Die Bezeichnung der Ebene in allen Sprachen. Fehlt eine Sprache, wird Deutsch verwendet.',
              })}
            </SectionDescription>
            <TextField
              label={formatMessage({
                id: 'vectorLayer.labelDe',
                defaultMessage: 'Deutsch',
              })}
              name="label_de"
              value={row.label_de ?? ''}
              onChange={onChange}
            />
            <TextField
              label={formatMessage({
                id: 'vectorLayer.labelEn',
                defaultMessage: 'Englisch',
              })}
              name="label_en"
              value={row.label_en ?? ''}
              onChange={onChange}
            />
            <TextField
              label={formatMessage({
                id: 'vectorLayer.labelFr',
                defaultMessage: 'Französisch',
              })}
              name="label_fr"
              value={row.label_fr ?? ''}
              onChange={onChange}
            />
            <TextField
              label={formatMessage({
                id: 'vectorLayer.labelIt',
                defaultMessage: 'Italienisch',
              })}
              name="label_it"
              value={row.label_it ?? ''}
              onChange={onChange}
            />
          </Section>
        </>
      )}
      <Property vectorLayer={row} from={from} />
      <TextField
        label={formatMessage({
          id: 'Ps9QtV',
          defaultMessage: 'Max. Anzahl Objekte',
        })}
        name="max_features"
        value={row.max_features ?? ''}
        onChange={onChange}
        type="number"
        validationMessage={formatMessage({
          id: 'Qt0RuW',
          defaultMessage: 'Zu viele Objekte können die App zum Absturz bringen',
        })}
      />
      {row?.type === 'upload' && (
        <>
          <TextFieldInactive
            label={formatMessage({
              id: 'Ru1SvX',
              defaultMessage: 'Anzahl Objekte',
            })}
            name="feature_count"
            value={row.feature_count}
          />
          <TextFieldInactive
            label={formatMessage({
              id: 'Sv2TwY',
              defaultMessage: 'Anzahl Punkte',
            })}
            name="point_count"
            value={row.point_count}
          />
          <TextFieldInactive
            label={formatMessage({
              id: 'Tw3UxZ',
              defaultMessage: 'Anzahl Linien',
            })}
            name="line_count"
            value={row.line_count}
          />
          <TextFieldInactive
            label={formatMessage({
              id: 'Ux4VyA',
              defaultMessage: 'Anzahl Polygone',
            })}
            name="polygon_count"
            value={row.polygon_count}
          />
        </>
      )}
    </>
  )
}
