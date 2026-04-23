import { useIntl } from 'react-intl'

import { TextField } from '../../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { DropdownField } from '../../../components/shared/DropdownField.tsx'
// import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { LayersDropdown } from './LayersDropdown.tsx'
import { CreateWmsService } from './CreateWmsService/index.tsx'

import '../../../form.css'

// this form is rendered from a parent or outlet
export const WmsLayerForm = ({ onChange, validations = {}, row, isFilter }) => {
  // TODO: implement later
  const isOffline = false
  const { formatMessage } = useIntl()

  return (
    <>
      <DropdownField
        label={formatMessage({
          id: 'Ed3FgH',
          defaultMessage: 'Web Map Service (WMS)',
        })}
        name="wms_service_id"
        labelField="url"
        table="wms_services"
        value={row.wms_service_id ?? ''}
        orderBy="url"
        onChange={onChange}
        autoFocus={true}
        validationState={validations?.wms_service_id?.state}
        validationMessage={
          validations.wms_service_id?.message ??
          (row.wms_service_id
            ? ''
            : formatMessage({
                id: 'Lk0MnO',
                defaultMessage:
                  'Aus einem konfigurierten WMS wählen. Oder einen neuen hinzufügen.',
              }))
        }
        noDataMessage={formatMessage({
          id: 'Kj9LmN',
          defaultMessage: 'Kein WMS gefunden. Du kannst einen hinzufügen.',
        })}
        hideWhenNoData={true}
      />
      <CreateWmsService wmsLayer={row} />
      {(row?.wms_service_id || isFilter) && (
        <LayersDropdown
          wmsLayer={row}
          validationMessage={
            row.wms_service_layer_name
              ? ''
              : formatMessage({
                  id: 'SelectALayer',
                  defaultMessage: 'Wähle eine Ebene',
                })
          }
        />
      )}
      {((!!row.wms_service_id && !!row?.wms_service_layer_name) ||
        isFilter) && (
        <>
          <TextField
            label={formatMessage({
              id: 'Fl3jPw',
              defaultMessage: 'Bezeichnung',
            })}
            name="label"
            value={row.label ?? ''}
            onChange={onChange}
            validationMessage={validations?.label?.message}
            validationState={validations?.label?.state}
          />
          {/* {wmsLayer?.wms_service_id && (
              <>
                <DropdownFieldFromWmsServiceLayers
                  label="(Image-)Format"
                  name="wms_format"
                  value={wmsLayer.wms_format ?? ''}
                  wms_layer_id={wms_layer_id}
                  onChange={onChange}
                  validationMessage={
                    wmsLayer.wms_format === 'image/png'
                      ? ''
                      : `Empfehlung: 'image/png'. Ermöglicht transparenten Hintergrund`
                  }
                />
                <TextField
                  label="WMS Version"
                  name="wms_version"
                  value={wmsLayer.wms_version ?? ''}
                  onChange={onChange}
                  validationMessage="Examples: '1.1.1', '1.3.0'. Set automatically but can be changed"
                />
                <DropdownFieldFromWmsServiceLayers
                  label="Info Format"
                  name="wms_info_format"
                  value={wmsLayer.wms_info_format ?? ''}
                  wms_layer_id={wms_layer_id}
                  onChange={onChange}
                  validationMessage="In what format the info is downloaded. Set automatically but can be changed"
                />
              </>
            )} */}
          {isOffline && (
            <>
              <div>TODO: show the following only if loaded for offline</div>
              <TextFieldInactive
                label="Local Data Size"
                name="local_data_size"
                value={row.local_data_size}
              />
              <TextFieldInactive
                label="Local Data Bounds"
                name="local_data_bounds"
                value={row.local_data_bounds}
              />
            </>
          )}
        </>
      )}
    </>
  )
}
