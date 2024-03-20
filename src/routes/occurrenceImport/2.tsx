import { memo, useCallback, useState } from 'react'
import { Button } from '@fluentui/react-components'
import axios from 'redaxios'

import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions'
import { Combobox } from '../../components/shared/Combobox'

export const Two = memo(({ occurrenceImport, occurrenceFields, onChange }) => {
  const [crsOptions, setCrsOptions] = useState(['EPSG:4326'])
  const [loadingCrs, setLoadingCrs] = useState(false)

  const onClickLoadCrs = useCallback(() => {
    // TODO:
    // 1. fetch crs list from https://spatialreference.org/crslist.json
    setLoadingCrs(true)
    axios
      .get('https://spatialreference.org/crslist.json')
      .then((response) => {
        console.log('response', response.data)
        const uniqueCrsOptions = [
          ...new Set(
            response.data
              .filter(
                (d) =>
                  // not sure if all types can be used
                  // ['GEOGRAPHIC_2D_CRS', 'PROJECTED_CRS', 'COMPOUND_CRS'].includes(d.type) &&
                  d.deprecated === false,
              )
              .map((d) => `${d.auth_name}:${d.code}`),
          ),
        ]
        setCrsOptions(uniqueCrsOptions)
      })
      .catch((error) => {
        console.error('error', error)
      })
      .finally(() => {
        setLoadingCrs(false)
      })
  }, [])

  if (!occurrenceImport) {
    return <div>Loading...</div>
  }

  // TODO:
  // - if geojson_geometry_field and crs choosen while geometry fields are empty,
  //   copy that fields values to geometry field in all occurrences while transforming the crs to wgs84 using proj4

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
        </>
      )}
      <p>
        The coordinate reference system used by promoting species is EPSG:4326,
        also known as WGS 84.
        <br />
        EPSG:4326 is always used in GeoJSON.
        <br />
        Though common, thousands of other coordinate reference systems exist.
        <br />
        If the occurrences geometries are in EPSG:4326, no action is needed. If
        not, they must be converted.
      </p>
      <Button onClick={onClickLoadCrs}>
        Click here if the occurrence geometries use a coordinate reference
        system other than EPSG:4326 (WGS 84)
      </Button>
      <DropdownFieldSimpleOptions
        label="Coordinate Reference System Code"
        name="crs"
        value={occurrenceImport.crs ?? ''}
        onChange={onChange}
        options={crsOptions}
        validationMessage={
          <>
            <div>
              See{' '}
              <a href="https://epsg.org/home.html" target="_blank">
                https://epsg.org
              </a>{' '}
              for a list of EPSG codes and their descriptions
            </div>
          </>
        }
      />
      <Combobox
        label="Coordinate Reference System"
        name="crs"
        value={occurrenceImport.crs ?? ''}
        options={crsOptions}
        onChange={onChange}
      />
    </>
  )
})
