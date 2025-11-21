import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'

export const GeometryMethod = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT geometry_method FROM occurrence_imports_geometry_methods order by sort, geometry_method`,
  )
  const isLoading = isFirstRender && res === undefined
  const geometryMethods = res?.rows.map((row) => row.geometry_method) ?? []

  return (
    <RadioGroupField
      label="How are the geometries contained in the data"
      name="geometry_method"
      list={geometryMethods}
      isLoading={isLoading}
      value={row.geometry_method ?? ''}
      onChange={onChange}
      validationMessage="GeoJSON and Coordinate Fields are supported"
    />
  )
}
