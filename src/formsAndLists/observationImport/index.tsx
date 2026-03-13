import { useRef, useState, useEffect } from 'react'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Tab, TabList } = fluentUiReactComponents
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { detectCoordinateFields } from './detectCoordinateFields.ts'
import { Header } from './Header.tsx'
import { One } from './1.tsx'
import { Two } from './2/index.tsx'
import { Three } from './3.tsx'
import { Four } from './4/index.tsx'
import { Preview } from './Preview.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import '../../form.css'
import styles from './index.module.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId/'

export const ObservationImport = () => {
  const { observationImportId } = useParams({ from })
  const navigate = useNavigate()
  const { observationImportTab: tab } = useSearch({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [showPreview, setShowPreview] = useState(true)
  const [validations, setValidations] = useState({})
  const [coordinatesAutoDetected, setCoordinatesAutoDetected] = useState(false)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const oIResult = useLiveQuery(
    `SELECT * FROM observation_imports WHERE observation_import_id = $1`,
    [observationImportId],
  )
  const observationImport = oIResult?.rows?.[0]

  const oResult = useLiveQuery(
    `SELECT * FROM observations WHERE observation_import_id = $1`,
    [observationImportId],
  )
  const observations = oResult?.rows ?? []

  const observationsWithoutGeometryCountResult = useLiveQuery(
    `SELECT count(*) FROM observations WHERE observation_import_id = $1 AND geometry is null`,
    [observationImportId],
  )
  const observationsWithoutGeometryCount =
    observationsWithoutGeometryCountResult?.rows?.[0]?.count ?? 0

  const observationFields = Object.keys(observations?.[0]?.data ?? {})

  // Auto-detect coordinate fields when observations are first loaded
  useEffect(() => {
    if (
      !observationImport ||
      !observationFields.length ||
      observationImport.x_coordinate_field ||
      observationImport.y_coordinate_field
    ) {
      return
    }

    const detected = detectCoordinateFields(observationFields, observations)

    if (detected.x_coordinate_field || detected.y_coordinate_field) {
      const updates = []
      const draft = {}

      if (detected.x_coordinate_field) {
        updates.push(`x_coordinate_field = '${detected.x_coordinate_field}'`)
        draft.x_coordinate_field = detected.x_coordinate_field
      }
      if (detected.y_coordinate_field) {
        updates.push(`y_coordinate_field = '${detected.y_coordinate_field}'`)
        draft.y_coordinate_field = detected.y_coordinate_field
      }

      if (updates.length) {
        db.query(
          `UPDATE observation_imports SET ${updates.join(', ')} WHERE observation_import_id = $1`,
          [observationImportId],
        )
        addOperation({
          table: 'observation_imports',
          rowIdName: 'observation_import_id',
          rowId: observationImportId,
          operation: 'update',
          draft,
          prev: { ...observationImport },
        })
        setCoordinatesAutoDetected(true)
      }
    }
  }, [observationFields.length, observationImport?.observation_import_id])

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (observationImport[name] === value) return

    try {
      await db.query(
        `UPDATE observation_imports SET ${name} = $1 WHERE observation_import_id = $2`,
        [value, observationImportId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }

    // If geometry-related fields changed, clear geometries so they can be recalculated
    const geometryFields = [
      'x_coordinate_field',
      'y_coordinate_field',
      'geojson_geometry_field',
      'geometry_method',
      'crs',
    ]
    if (geometryFields.includes(name)) {
      await db.query(
        `UPDATE observations SET geometry = NULL WHERE observation_import_id = $1 AND geometry IS NOT NULL`,
        [observationImportId],
      )
    }

    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'observation_imports',
      rowIdName: 'observation_import_id',
      rowId: observationImportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...observationImport },
    })
  }

  const onTabSelect = (e, data) =>
    navigate({ search: { observationImportTab: data.value } })

  const tab1Style = {
    backgroundColor:
      observationImport?.name && observations.length
        ? 'var(--colorCompoundBrandStrokeHover)'
        : tab === 1
          ? 'black'
          : 'grey',
  }

  const tab2Style = {
    backgroundColor:
      // green if all observations have geometry
      observations.length && !observationsWithoutGeometryCount
        ? 'var(--colorCompoundBrandStrokeHover)'
        : // black if is current
          tab === 2
          ? 'black'
          : // grey if no observations or not current
            'grey',
  }

  const tab3Style = {
    backgroundColor:
      // green if label_creation exists
      observationImport?.label_creation
        ? 'var(--colorCompoundBrandStrokeHover)'
        : // black if is current
          tab === 3
          ? 'black'
          : // grey if no observations or not current
            'grey',
  }

  const tab4Style = {
    backgroundColor: observationImport?.id_field
      ? 'var(--colorCompoundBrandStrokeHover)'
      : tab === 4
        ? 'black'
        : 'grey',
  }

  // TODO:
  // show stepper-like tabs on new import:
  // 1. data: name, attribution, file
  // 2. geometry: mode (coordinates or geometry), field(s) and projection
  // 3. date: choose how to extract date from fields. NOT YET IMPLEMENTED AS NO DIRECT USE CASE
  // 4. label: choose how to create label from fields
  // 5. identification: choose id field, previous import and how to extend it
  // - stepper titles begin with a number in a circle
  // - completed steps: circle is green
  // - uncompleted steps: circle is grey, title is normal
  // - current step: circle is blue, title is bold
  // - the next stepper can not be accessed before the previous is completed
  // TODO: animate showing/hiding of preview

  if (!oIResult) return <Loading />

  if (!observationImport) {
    return <NotFound table="Observation Import" id={observationImportId} />
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
      />
      {showPreview && (
        <Preview
          observations={observations}
          observationFields={observationFields}
        />
      )}
      <TabList selectedValue={tab} onTabSelect={onTabSelect}>
        <Tab
          id="1"
          value={1}
          icon={
            <div className={styles.tabNumber} style={tab1Style}>
              1
            </div>
          }
        >
          {formatMessage({ id: 'bDbEhF', defaultMessage: 'Daten' })}
        </Tab>
        <Tab
          id="2"
          value={2}
          icon={
            <div className={styles.tabNumber} style={tab2Style}>
              2
            </div>
          }
          disabled={!observations.length}
        >
          {formatMessage({ id: 'gEo0mY', defaultMessage: 'Geometrie' })}
        </Tab>
        <Tab
          id="3"
          value={3}
          icon={
            <div className={styles.tabNumber} style={tab3Style}>
              3
            </div>
          }
        >
          {formatMessage({ id: 'Fl3jPw', defaultMessage: 'Bezeichnung' })}
        </Tab>
        <Tab
          id="4"
          value={4}
          icon={
            <div className={styles.tabNumber} style={tab4Style}>
              4
            </div>
          }
        >
          {formatMessage({ id: 'iDnt0f', defaultMessage: 'Identifikation' })}
        </Tab>
      </TabList>
      <div className="form-container">
        {!observationImport ? (
          <Loading />
        ) : (
          <>
            {tab === 1 && (
              <One
                observationImport={observationImport}
                observations={observations}
                onChange={onChange}
                validations={validations}
                autoFocusRef={autoFocusRef}
                db={db}
              />
            )}
            {tab === 2 && (
              <Two
                observationImport={observationImport}
                observationFields={observationFields}
                onChange={onChange}
                validations={validations}
                coordinatesAutoDetected={coordinatesAutoDetected}
                observationsWithoutGeometryCount={
                  observationsWithoutGeometryCount
                }
              />
            )}
            {tab === 3 && (
              <Three
                observationImport={observationImport}
                observationFields={observationFields}
                onChange={onChange}
                validations={validations}
              />
            )}
            {tab === 4 && (
              <Four
                observationImport={observationImport}
                observationFields={observationFields}
                onChange={onChange}
                validations={validations}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
