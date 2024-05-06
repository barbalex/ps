import { memo } from 'react'

import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import { DropdownFieldSimpleOptions } from '../../../components/shared/DropdownFieldSimpleOptions.tsx'
import { Crs } from './Crs'
import { Set } from './Set'
import { Occurrence_imports } from '../../../generated/client/index.ts'

interface Props {
  occurrenceImport: Occurrence_imports
  occurrenceFields: string[]
  onChange: (e: React.ChangeEvent<HTMLInputElement>, data: any) => void
}

export const Two = memo(
  ({ occurrenceImport, occurrenceFields, onChange }: Props) => {
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
            validationMessage="Which field contains the GeoJSON geometries?"
          />
        )}
        {occurrenceImport.geometry_method === 'coordinates' && (
          <>
            <DropdownFieldSimpleOptions
              label="X-Coordinate Field"
              name="x_coordinate_field"
              value={occurrenceImport.x_coordinate_field ?? ''}
              onChange={onChange}
              options={occurrenceFields}
              validationMessage="Which field contains the X-Coordinates?"
            />
            <DropdownFieldSimpleOptions
              label="Y-Coordinate Field"
              name="y_coordinate_field"
              value={occurrenceImport.y_coordinate_field ?? ''}
              onChange={onChange}
              options={occurrenceFields}
              validationMessage="Which field contains the Y-Coordinates?"
            />

            <p>
              The coordinate reference system used by promoting species is
              'EPSG:4326', also known as 'WGS 84'.
              <br />
              It is always used in GeoJSON. Though common, thousands of other
              coordinate reference systems exist.
              <br />
              If the occurrences coordinates are in 'EPSG:4326', no action is
              needed. If not, they must be converted.
            </p>
            {/* TODO: use a virtualized combobox solution, maybe like in apflora? */}
            <Crs occurrenceImport={occurrenceImport} onChange={onChange} />
            {occurrenceImport.crs &&
              occurrenceImport.geometry_method === 'coordinates' &&
              occurrenceImport.y_coordinate_field &&
              occurrenceImport.x_coordinate_field && (
                <Set occurrenceImport={occurrenceImport} />
              )}
          </>
        )}
      </>
    )
  },
)
