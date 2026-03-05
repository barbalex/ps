import { DropdownFieldSimpleOptions } from '../../../components/shared/DropdownFieldSimpleOptions.tsx'
import { Crs } from './Crs.tsx'
import { Set } from './Set.tsx'
import { GeometryMethod } from './GeometryMethod.tsx'
import styles from './index.module.css'

export const Two = ({
  observationImport,
  observationFields,
  onChange,
  validations,
  coordinatesAutoDetected,
  observationsWithoutGeometryCount,
}) => (
  <>
    <GeometryMethod
      onChange={onChange}
      validations={validations}
      row={observationImport}
    />
    {observationImport.geometry_method === 'geojson' && (
      <DropdownFieldSimpleOptions
        label="GeoJSON Field"
        name="geojson_geometry_field"
        value={observationImport.geojson_geometry_field ?? ''}
        onChange={onChange}
        options={observationFields}
        validationState={validations?.geojson_geometry_field?.state}
        validationMessage={
          validations?.geojson_geometry_field?.message ??
          'Which field contains the GeoJSON geometries?'
        }
      />
    )}
    {observationImport.geometry_method === 'coordinates' && (
      <>
        {coordinatesAutoDetected && (
          <div className={styles.autoDetectInfo}>
            <strong>✓ Coordinate fields automatically detected</strong>
            <br />
            Please verify the selected fields and check that the coordinate
            values are correct.
            {observationsWithoutGeometryCount > 0 && (
              <>
                <br />
                Then set the coordinates by clicking the button at the bottom of
                the page.
              </>
            )}
          </div>
        )}
        <DropdownFieldSimpleOptions
          label="X-Coordinate Field"
          name="x_coordinate_field"
          value={observationImport.x_coordinate_field ?? ''}
          onChange={onChange}
          options={observationFields}
          validationState={validations?.x_coordinate_field?.state}
          validationMessage={
            validations?.x_coordinate_field?.message ??
            'Which field contains the X-Coordinates? This should be latitude.'
          }
        />
        <DropdownFieldSimpleOptions
          label="Y-Coordinate Field"
          name="y_coordinate_field"
          value={observationImport.y_coordinate_field ?? ''}
          onChange={onChange}
          options={observationFields}
          validationState={validations?.y_coordinate_field?.state}
          validationMessage={
            validations?.y_coordinate_field?.message ??
            'Which field contains the Y-Coordinates? This should be longitude.'
          }
        />

        <p>
          The coordinate reference system used by promote-species.app is
          'EPSG:4326', also known as 'WGS 84'.
          <br />
          It is always used in GeoJSON. Though common, thousands of other
          coordinate reference systems exist.
          <br />
          If the observations coordinates are in 'EPSG:4326', no action is
          needed. If not, they must be converted.
        </p>
        {/* TODO: use a virtualized combobox solution, maybe like in apflora? */}
        <Crs
          observationImport={observationImport}
          onChange={onChange}
          validations={validations}
        />
        {observationImport.crs &&
          observationImport.geometry_method === 'coordinates' &&
          observationImport.y_coordinate_field &&
          observationImport.x_coordinate_field && (
            <Set observationImport={observationImport} />
          )}
      </>
    )}
  </>
)
