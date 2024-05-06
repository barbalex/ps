import { memo, useMemo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider.tsx'
import { MultiSelect } from './MultiSelect/index.tsx'
import { idFieldFromTable } from '../../modules/idFieldFromTable.ts'

interface Props {
  name: string
  label: string
  table: string
  tile_layer_id?: string
  vector_layer_id?: string
  validationMessage?: string
  validationState?: 'none' | 'error'
  valueArray?: string[]
  row?: { label: string }
}

export const MultiSelectFromLayerOptions = memo(
  ({
    name,
    label,
    table,
    tile_layer_id,
    vector_layer_id,
    validationMessage,
    validationState = 'none',
    valueArray = [],
    row,
  }: Props) => {
    const { db } = useElectric()!
    const { results: layerOptions = [] } = useLiveQuery(
      db.layer_options.liveMany({
        where: {
          ...(tile_layer_id ? { tile_layer_id } : {}),
          ...(vector_layer_id ? { vector_layer_id } : {}),
          field: name,
        },
        select: { value: true, label: true },
        orderBy: { label: 'asc' },
      }),
    )
    const options = useMemo(
      () => layerOptions.map(({ value, label }) => ({ value, label })),
      [layerOptions],
    )
    const afterChange = useCallback(
      (options) => {
        // set row.label to be the option.label
        // of label is null and options.length === 1
        if (!!row && !row.label && options.length === 1) {
          const idField = idFieldFromTable(table)
          db[table].update({
            where: { [idField]: tile_layer_id || vector_layer_id },
            data: { label: options?.[0]?.label },
          })
        }
      },
      [db, row, table, tile_layer_id, vector_layer_id],
    )

    return (
      <MultiSelect
        label={options?.length ? `${label} (${options.length})` : label}
        name={name}
        table={table}
        id={tile_layer_id || vector_layer_id}
        options={options}
        valueArray={valueArray}
        validationMessage={validationMessage}
        validationState={validationState}
        afterChange={afterChange}
      />
    )
  },
)
