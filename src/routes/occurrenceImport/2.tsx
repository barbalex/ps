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
        validationMessage="Only GeoJSON and Coordinate Fields are supported"
      />
      <DropdownFieldSimpleOptions
        label="ID Field"
        name="id_field"
        value={occurrenceImport.id_field ?? ''}
        onChange={onChange}
        options={occurrenceFields}
        validationMessage={
          <>
            <div>The field that identifies the occurrence</div>
            <div>Needed when same occurrences are imported more than once</div>
            <div>Enables choosing how to deal with a previous import</div>
          </>
        }
      />
    </>
  )
})
