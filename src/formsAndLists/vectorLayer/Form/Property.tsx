import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import {
  builtInDisplayByProperties,
  ownTableToFieldsTable,
} from '../../../modules/displayByProperty.ts'
import { upsertVectorLayerDisplaysForVectorLayer } from './upsertVectorLayerDisplaysForVectorLayer.ts'
import { addOperationAtom } from '../../../store.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'
import type { FieldChangeData } from '../../../components/shared/fieldChange.ts'

export const Property = ({
  vectorLayer,
}: {
  vectorLayer: VectorLayers
  from?: string
}) => {
  const { projectId, vectorLayerId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const displayByLabel = formatMessage({
    id: 'Vy5WzB',
    defaultMessage: 'Anzeigen nach',
  })

  // fields are stored per real table, not per own_table view
  // (observation layers style the observations table)
  const { tableName, level } = ownTableToFieldsTable(
    vectorLayer?.own_table,
    vectorLayer?.own_table_level,
  )
  // level null: the fields span all levels (observations_to_assess etc.)
  const hasLevel = level != null

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
      AND project_id = $2
      ${hasLevel ? 'AND level = $3' : ''}
    ORDER BY table_name, name, level`,
    hasLevel ? [tableName, projectId, level] : [tableName, projectId],
  )
  const options = ((res?.rows ?? []) as { label: string; value: string }[]).map(
    ({ label, value }) => ({
      label,
      value,
    }),
  )
  // real table columns that are not fields, e.g. observations.absence
  const builtInOptions = (
    builtInDisplayByProperties[vectorLayer?.own_table ?? ''] ?? []
  ).map((name) => ({
    label:
      name === 'absence' ?
        formatMessage({
          id: 'vldAbsenceCol',
          defaultMessage: 'Absenz (Spalte)',
        })
      : name,
    value: name,
  }))
  const allOptions = [...options, ...builtInOptions]

  // TODO: get fields of wfs
  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    data?: FieldChangeData,
  ) => {
    const { value } = getValueFromChange(e, data)
    // the form also renders outside vector-layer routes (map drawer), where
    // params carry no vectorLayerId — the row prop is the source of truth
    const rowId = vectorLayerId ?? vectorLayer?.vector_layer_id
    const prevRes = await db.query(
      `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
      [rowId],
    )
    const prev = (prevRes?.rows?.[0] ?? vectorLayer) as VectorLayers
    await db.query(
      `UPDATE vector_layers SET display_by_property = $1 WHERE vector_layer_id = $2`,
      [value, rowId],
    )
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: rowId as string,
      operation: 'update',
      draft: {
        display_by_property: value,
      },
      prev: prev as unknown as Record<string, unknown>,
    })
    // set vector_layer_displays
    // pass the updated row: prev still holds the old display_by_property
    upsertVectorLayerDisplaysForVectorLayer({
      vectorLayer: { ...prev, display_by_property: (value as string) ?? null },
    })
  }

  // console.log('VectorLayerForm.PropertyField, fields:', fields)

  if (!allOptions.length) {
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
      options={allOptions}
      validationMessage={formatMessage({
        id: 'Wz6XaC',
        defaultMessage:
          'Für jeden eindeutigen Wert dieses Felds wird eine Kartenanzeige generiert',
      })}
    />
  )
}
