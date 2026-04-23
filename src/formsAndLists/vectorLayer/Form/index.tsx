import { useIntl } from 'react-intl'

import { vectorLayerTypeOptions } from '../../../modules/constants.ts'
import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
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
      {/* Label fields - shared pattern */}
      {row?.type === 'wfs' &&
        row?.wfs_service_id &&
        row.wfs_service_layer_name && (
          <TextField
            label={nameLabel}
            name="label"
            value={row.label ?? ''}
            onChange={onChange}
            validationMessage={validations?.label?.message}
            validationState={validations?.label?.state}
          />
        )}
      {row?.type === 'own' && (
        <TextField
          label={nameLabel}
          name="label"
          value={row.label ?? ''}
          onChange={onChange}
          validationMessage={validations?.label?.message}
          validationState={validations?.label?.state}
        />
      )}
      {!['wfs', 'upload', 'own'].includes(row.type) && (
        <>
          {isFilter ? (
            <TextField
              label={designationLabel}
              name="label"
              value={row.label ?? ''}
              onChange={onChange}
              validationMessage={validations?.label?.message}
              validationState={validations?.label?.state}
            />
          ) : (
            <TextFieldInactive
              label={designationLabel}
              name="label"
              value={row.label}
            />
          )}
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
