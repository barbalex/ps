import { memo } from 'react'

import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions'

export const Two = memo(({ occurrenceImport, occurrenceFields, onChange }) => {
  if (!occurrenceImport) {
    return <div>Loading...</div>
  }

  return (
    <>
      <RadioGroupField
        label="How are the geometries contained in the data?"
        name="geometry_method"
        list={['coordinates', 'geojson']}
        value={occurrenceImport.geometry_method ?? ''}
        onChange={onChange}
        validationMessage="GeoJSON and Coordinate Fields are supported"
      />
      {occurrenceImport.geometry_method === 'geojson' && (
        <DropdownFieldSimpleOptions
          label="GeoJSON Field"
          name="geojson_geometry_field"
          value={occurrenceImport.geojson_geometry_field ?? ''}
          onChange={onChange}
          options={occurrenceFields}
          validationMessage={
            <>
              <div>Which field contains the GeoJSON geometries?</div>
            </>
          }
        />
      )}
    </>
  )
})
