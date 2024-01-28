import { memo, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { Layer_options as LayerOption } from '../../generated/client'
import { MultiSelect } from './MultiSelect'

export const MultiSelectFromLayerOptions = memo(
  ({
    name,
    label,
    table,
    id,
    tile_layer_id,
    vector_layer_id,
    field,
    validationMessage,
    validationState = 'none',
    valueArray = [],
  }) => {
    const { db } = useElectric()
    const { results = [] } = useLiveQuery(
      db.layer_options.liveMany({
        where: {
          ...(tile_layer_id ? { tile_layer_id } : {}),
          ...(vector_layer_id ? { vector_layer_id } : {}),
          field,
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
    console.log('hello MultiSelectFromLayerOptions', {
      options,
      tile_layer_id,
      field,
      valueArray,
      name,
      label,
      table,
      id,
    })

    return (
      <MultiSelect
        label={label}
        name={name}
        table={table}
        id={id}
        options={options}
        valueArray={valueArray}
        validationMessage={validationMessage}
        validationState={validationState}
      />
    )
  },
)
