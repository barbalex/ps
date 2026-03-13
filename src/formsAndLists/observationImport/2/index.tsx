import { useIntl } from 'react-intl'
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
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <GeometryMethod
        onChange={onChange}
        validations={validations}
        row={observationImport}
      />
      {observationImport.geometry_method === 'geojson' && (
        <DropdownFieldSimpleOptions
          label={formatMessage({
            id: 'gJsFld',
            defaultMessage: 'GeoJSON-Feld',
          })}
          name="geojson_geometry_field"
          value={observationImport.geojson_geometry_field ?? ''}
          onChange={onChange}
          options={observationFields}
          validationState={validations?.geojson_geometry_field?.state}
          validationMessage={
            validations?.geojson_geometry_field?.message ??
            formatMessage({
              id: 'gJsVld',
              defaultMessage: 'Welches Feld enthält die GeoJSON-Geometrien?',
            })
          }
        />
      )}
      {observationImport.geometry_method === 'coordinates' && (
        <>
          {coordinatesAutoDetected && (
            <div className={styles.autoDetectInfo}>
              <strong>
                {formatMessage({
                  id: 'aCdDet',
                  defaultMessage: '✓ Koordinatenfelder automatisch erkannt',
                })}
              </strong>
              <br />
              {formatMessage({
                id: 'aCdVfy',
                defaultMessage:
                  'Bitte die ausgewählten Felder überprüfen und sicherstellen, dass die Koordinatenwerte korrekt sind.',
              })}
              {observationsWithoutGeometryCount > 0 && (
                <>
                  <br />
                  {formatMessage({
                    id: 'aCdBtn',
                    defaultMessage:
                      'Dann die Koordinaten per Klick auf den Button am Ende der Seite setzen.',
                  })}
                </>
              )}
            </div>
          )}
          <DropdownFieldSimpleOptions
            label={formatMessage({
              id: 'xCdFld',
              defaultMessage: 'X-Koordinaten-Feld',
            })}
            name="x_coordinate_field"
            value={observationImport.x_coordinate_field ?? ''}
            onChange={onChange}
            options={observationFields}
            validationState={validations?.x_coordinate_field?.state}
            validationMessage={
              validations?.x_coordinate_field?.message ??
              formatMessage({
                id: 'xCdVld',
                defaultMessage:
                  'Welches Feld enthält die X-Koordinaten? Dies sollte der Breitengrad sein.',
              })
            }
          />
          <DropdownFieldSimpleOptions
            label={formatMessage({
              id: 'yCdFld',
              defaultMessage: 'Y-Koordinaten-Feld',
            })}
            name="y_coordinate_field"
            value={observationImport.y_coordinate_field ?? ''}
            onChange={onChange}
            options={observationFields}
            validationState={validations?.y_coordinate_field?.state}
            validationMessage={
              validations?.y_coordinate_field?.message ??
              formatMessage({
                id: 'yCdVld',
                defaultMessage:
                  'Welches Feld enthält die Y-Koordinaten? Dies sollte der Längengrad sein.',
              })
            }
          />

          <p>
            {formatMessage({
              id: 'cRsEp1',
              defaultMessage:
                "Das von promote-species.app verwendete Koordinaten-Bezugs-System ist 'EPSG:4326', auch bekannt als 'WGS 84'.",
            })}
            <br />
            {formatMessage({
              id: 'cRsEp2',
              defaultMessage:
                'Es wird immer in GeoJSON verwendet. Obwohl es weit verbreitet ist, existieren tausende weitere Koordinaten-Bezugs-Systeme.',
            })}
            <br />
            {formatMessage({
              id: 'cRsEp3',
              defaultMessage:
                "Wenn die Beobachtungskoordinaten in 'EPSG:4326' vorliegen, ist keine Aktion erforderlich. Andernfalls müssen sie konvertiert werden.",
            })}
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
}
