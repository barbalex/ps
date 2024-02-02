import { memo, useMemo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { Layer_options as LayerOption } from '../../generated/client'
import { MultiSelect } from './MultiSelect'
import { idFieldFromTable } from '../../modules/idFieldFromTable'

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
  }) => {
    const { db } = useElectric()
    const { results = [] } = useLiveQuery(
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
    const layerOptions: LayerOption[] = results
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
