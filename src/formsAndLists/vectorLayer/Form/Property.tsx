import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { upsertVectorLayerDisplaysForVectorLayer } from './upsertVectorLayerDisplaysForVectorLayer.ts'
import { addOperationAtom } from '../../../store.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'

type InputOnChangeData = Parameters<
  NonNullable<
    React.ComponentProps<typeof fluentUiReactComponents.Input>['onChange']
  >
>[1]

export const Property = ({ vectorLayer }: { vectorLayer: VectorLayers; from?: string }) => {
  const { projectId, vectorLayerId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const displayByLabel = formatMessage({
    id: 'Vy5WzB',
    defaultMessage: 'Anzeigen nach',
  })

  const table = vectorLayer?.own_table
  const level = vectorLayer?.own_table_level

  const db = usePGlite()
  // get fields of table
  const res = useLiveQuery(
    `
    SELECT 
      field_id, 
      field_label AS label, 
      name AS value
    FROM fields 
    WHERE 
      table_name = $1 
      AND level = $2 
      AND project_id = $3 
    ORDER BY table_name, name, level`,
    [table, level, projectId],
  )
  const options = ((res?.rows ?? []) as { label: string; value: string }[]).map(
    ({ label, value }) => ({
      label,
      value,
    }),
  )

  // TODO: get fields of wfs
  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    const { value } = getValueFromChange(e, data)
    const prevRes = await db.query(
      `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
      [vectorLayerId],
    )
    const prev = (prevRes?.rows?.[0] ?? {}) as VectorLayers
    await db.query(
      `UPDATE vector_layers SET display_by_property = $1 WHERE vector_layer_id = $2`,
      [value, vectorLayerId],
    )
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayerId,
      operation: 'update',
      draft: {
        display_by_property: value,
      },
      prev: prev as unknown as Record<string, unknown>,
    })
    // set vector_layer_displays
    upsertVectorLayerDisplaysForVectorLayer({
      vectorLayer: prev,
    })
  }

  // console.log('VectorLayerForm.PropertyField, fields:', fields)

  if (!options.length) {
    return (
      <TextField
        label={displayByLabel}
        placeholder={formatMessage({
          id: 'Xa7YbD',
          defaultMessage: 'keine Felder gefunden',
        })}
        hint={formatMessage({
          id: 'Wz6XaC',
          defaultMessage:
            'Für jeden eindeutigen Wert dieses Felds wird eine Kartenanzeige generiert',
        })}
        disabled
      />
    )
  }

  return (
    <DropdownFieldOptions
      label={displayByLabel}
      name="display_by_property"
      value={vectorLayer.display_by_property}
      onChange={onChange}
      options={options}
      validationMessage={formatMessage({
        id: 'Wz6XaC',
        defaultMessage:
          'Für jeden eindeutigen Wert dieses Felds wird eine Kartenanzeige generiert',
      })}
    />
  )
}
