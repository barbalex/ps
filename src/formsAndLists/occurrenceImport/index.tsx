import { useRef, useState } from 'react'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { Tab, TabList } from '@fluentui/react-components'
import {
  usePGlite,
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
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

const tabNumberStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: 'grey',
  color: 'white',
  fontSize: '0.65em',
  fontWeight: 'bold',
  verticalAlign: 'middle',
  textAlign: 'center',
  lineHeight: '19px',
}

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/$occurrenceImportId/'

export const OccurrenceImport = () => {
  const { occurrenceImportId } = useParams({ from })
  const navigate = useNavigate()
  const { occurrenceImportTab: tab } = useSearch({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const [showPreview, setShowPreview] = useState(true)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const oIResult = useLiveQuery(
    `SELECT * FROM occurrence_imports WHERE occurrence_import_id = $1`,
    [occurrenceImportId],
  )
  const occurrenceImport = oIResult?.rows?.[0]

  const oResult = useLiveIncrementalQuery(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImportId],
    'occurrence_id',
  )
  const occurrences = oResult?.rows ?? []

  const occurrencesWithoutGeometryCountResult = useLiveQuery(
    `SELECT count(*) FROM occurrences WHERE occurrence_import_id = $1 AND geometry is null`,
    [occurrenceImportId],
  )
  const occurrencesWithoutGeometryCount =
    occurrencesWithoutGeometryCountResult?.rows?.[0]?.count ?? 0

  const occurrenceFields = Object.keys(occurrences?.[0]?.data ?? {})

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (occurrenceImport[name] === value) return

    db.query(
      `UPDATE occurrence_imports SET ${name} = $1 WHERE occurrence_import_id = $2`,
      [value, occurrenceImportId],
    )
    addOperation({
      table: 'occurrence_imports',
      rowIdName: 'occurrence_import_id',
      rowId: occurrenceImportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...occurrenceImport },
    })
  }

  const onTabSelect = (e, data) =>
    navigate({ search: { occurrenceImportTab: data.value } })

  const tab1Style = {
    ...tabNumberStyle,
    backgroundColor:
      occurrenceImport?.name && occurrences.length ?
        'var(--colorCompoundBrandStrokeHover)'
      : tab === 1 ? 'black'
      : 'grey',
  }

  const tab2Style = {
    ...tabNumberStyle,
    backgroundColor:
      // green if all occurrences have geometry
      occurrences.length && !occurrencesWithoutGeometryCount ?
        'var(--colorCompoundBrandStrokeHover)'
        // black if is current
      : tab === 2 ? 'black'
        // grey if no occurrences or not current
      : 'grey',
  }

  const tab3Style = {
    ...tabNumberStyle,
    backgroundColor:
      // green if label_creation exists
      occurrenceImport?.label_creation ? 'var(--colorCompoundBrandStrokeHover)'
        // black if is current
      : tab === 3 ? 'black'
        // grey if no occurrences or not current
      : 'grey',
  }

  const tab4Style = {
    ...tabNumberStyle,
    backgroundColor:
      occurrenceImport?.id_field ? 'var(--colorCompoundBrandStrokeHover)'
      : tab === 4 ? 'black'
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
  // - completed steps: circle is gren
  // - uncompleted steps: circle is grey, title is normal
  // - current step: circle is blue, title is bold
  // - the next stepper can not be accessed before the previous is completed
  // TODO: animate showing/hiding of preview

  if (!oIResult) return <Loading />

  if (!occurrenceImport) {
    return (
      <NotFound
        table="Occurrence Import"
        id={occurrenceImportId}
      />
    )
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
          occurrences={occurrences}
          occurrenceFields={occurrenceFields}
        />
      )}
      <TabList
        selectedValue={tab}
        onTabSelect={onTabSelect}
      >
        <Tab
          id="1"
          value={1}
          icon={<div style={tab1Style}>1</div>}
        >
          Data
        </Tab>
        <Tab
          id="2"
          value={2}
          icon={<div style={tab2Style}>2</div>}
          disabled={!occurrences.length}
        >
          Geometry
        </Tab>
        <Tab
          id="3"
          value={3}
          icon={<div style={tab3Style}>3</div>}
        >
          Label
        </Tab>
        <Tab
          id="4"
          value={4}
          icon={<div style={tab4Style}>4</div>}
        >
          Identification
        </Tab>
      </TabList>
      <div className="form-container">
        {!occurrenceImport ?
          <Loading />
        : <>
            {tab === 1 && (
              <One
                occurrenceImport={occurrenceImport}
                onChange={onChange}
                autoFocusRef={autoFocusRef}
              />
            )}
            {tab === 2 && (
              <Two
                occurrenceImport={occurrenceImport}
                occurrenceFields={occurrenceFields}
                onChange={onChange}
              />
            )}
            {tab === 3 && (
              <Three
                occurrenceImport={occurrenceImport}
                occurrenceFields={occurrenceFields}
                onChange={onChange}
              />
            )}
            {tab === 4 && (
              <Four
                occurrenceImport={occurrenceImport}
                occurrenceFields={occurrenceFields}
                onChange={onChange}
              />
            )}
          </>
        }
      </div>
    </div>
  )
}
