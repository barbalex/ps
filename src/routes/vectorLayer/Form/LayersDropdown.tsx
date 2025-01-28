import { memo, useMemo, useCallback } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { usePGlite } from '@electric-sql/pglite-react'


export const LayersDropdown = memo(({ vectorLayer, validationMessage }) => {
  const db = usePGlite()
  const { results: wfsServiceLayers = [] } = useLiveQuery(
    db.wfs_service_layers.liveMany({
      where: { wfs_service_id: vectorLayer.wfs_service_id },
      orderBy: { label: 'asc' },
    }),
  )

  const options = useMemo(
    () => wfsServiceLayers.map(({ name, label }) => ({ value: name, label })),
    [wfsServiceLayers],
  )
  const selectedOptions = useMemo(
    () =>
      options.filter(
        (option) => option.value === vectorLayer.wfs_service_layer_name,
      ),
    [options, vectorLayer.wfs_service_layer_name],
  )

  const onOptionSelect = useCallback(
    async (e, data) => {
      db.vector_layers.update({
        where: { vector_layer_id: vectorLayer.vector_layer_id },
        data: {
          wfs_service_layer_name: data.optionValue,
          label: data.optionText,
        },
      })
    },
    [db.vector_layers, vectorLayer.vector_layer_id],
  )

  const labelWithCount = options?.length ? `Layer (${options.length})` : 'Layer'

  return (
    <Field
      label={labelWithCount}
      validationMessage={validationMessage}
      validationState="none"
    >
      <Dropdown
        name="wfs_service_layer_name"
        value={selectedOptions?.[0]?.label ?? ''}
        selectedOptions={selectedOptions}
        onOptionSelect={onOptionSelect}
        appearance="underline"
        clearable
      >
        {options.map((option) => {
          return (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          )
        })}
      </Dropdown>
    </Field>
  )
})
