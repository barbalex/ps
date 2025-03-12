import { useCallback, useEffect } from 'react'
import { useParams } from 'react-router'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { arrayMoveImmutable } from 'array-move'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { exists } from '../../../modules/exists.ts'
import { ErrorBoundary } from '../../../components/shared/ErrorBoundary.tsx'
import { Section } from '../../../components/shared/Section.tsx'
import { Field } from './Field.tsx'
import { Loading } from '../../../components/shared/Loading.tsx'
import { occurrenceFieldsSortedAtom } from '../../../store.ts'

import './raw.css'

const outerContainerStyle = {
  containerType: 'inline-size',
}
const explainerStyle = {
  padding: '5px 2px',
  margin: 0,
  color: 'rgba(0, 0, 0, 0.54)',
  fontStyle: 'italic',
}

export const OccurenceData = () => {
  const [occurrenceFieldsSorted, setOccurrenceFieldsSorted] = useAtom(
    occurrenceFieldsSortedAtom,
  )
  const { occurrence_id } = useParams()

  const sortedBeobFields = occurrenceFieldsSorted.slice()

  const sortFn = useCallback(
    (a, b) => {
      const keyA = a[0]
      const keyB = b[0]
      const indexOfA = sortedBeobFields.indexOf(keyA)
      const indexOfB = sortedBeobFields.indexOf(keyB)
      const sortByA = indexOfA > -1
      const sortByB = indexOfB > -1

      if (sortByA && sortByB) {
        return sortedBeobFields.indexOf(keyA) - sortedBeobFields.indexOf(keyB)
      }
      // if (sortByA || sortByB) {
      //   return 1
      // }
      if (keyA?.toLowerCase?.() > keyB?.toLowerCase?.()) return 1
      if (keyA?.toLowerCase?.() < keyB?.toLowerCase?.()) return -1
      return 0
    },
    [sortedBeobFields],
  )

  const res = useLiveIncrementalQuery(
    `SELECT * FROM occurrences WHERE occurrence_id = $1`,
    [occurrence_id],
    'occurrence_id',
  )
  const occurrence = res?.rows?.[0]

  const rowData = occurrence?.data ?? {}
  const fields = Object.entries(rowData)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([key, value]) => exists(value))
    .sort(sortFn)
  const keys = fields.map((f) => f[0])

  const setSortedBeobFields = useCallback(
    (newArray) => setOccurrenceFieldsSorted(newArray),
    [setOccurrenceFieldsSorted],
  )

  useEffect(() => {
    // add missing keys to sortedBeobFields
    const additionalKeys = []
    for (const key of keys) {
      if (!sortedBeobFields.includes(key)) {
        additionalKeys.push(key)
      }
    }
    if (!additionalKeys.length) return

    setSortedBeobFields([...sortedBeobFields, ...additionalKeys])
  }, [keys, setSortedBeobFields, sortedBeobFields])

  const moveField = useCallback(
    (dragIndex, hoverIndex) => {
      // get item from keys
      const itemBeingDragged = keys[dragIndex]
      const itemBeingHovered = keys[hoverIndex]
      // move from dragIndex to hoverIndex
      // in sortedBeobFields
      const fromIndex = sortedBeobFields.indexOf(itemBeingDragged)
      const toIndex = sortedBeobFields.indexOf(itemBeingHovered)
      // catch some edge cases
      if (fromIndex === toIndex) return
      if (fromIndex === -1) return
      if (toIndex === -1) return

      // move
      const newArray = arrayMoveImmutable(sortedBeobFields, fromIndex, toIndex)
      setSortedBeobFields(newArray)
    },
    [keys, setSortedBeobFields, sortedBeobFields],
  )
  const renderField = useCallback(
    (field, index) => (
      <Field
        key={field[0]}
        label={field[0]}
        value={field[1]}
        index={index}
        moveField={moveField}
      />
    ),
    [moveField],
  )

  if (!occurrence) return <Loading />
  if (!fields || fields.length === 0) return null

  // Issue: only one instance of HTML5Backend can be used at a time
  // https://github.com/react-dnd/react-dnd/issues/3178
  // Solution: use the same instance for all components
  // NEW: alternative solution: https://github.com/react-dnd/react-dnd/issues/3257#issuecomment-1239254032
  return (
    <ErrorBoundary>
      <div>
        <Section title="Raw data" />
        <p style={explainerStyle}>Dragg and drop to sort fields</p>
        <div style={outerContainerStyle}>
          <div className="container">
            <DndProvider
              backend={HTML5Backend}
              context={window}
            >
              {fields.map((field, i) => renderField(field, i))}
            </DndProvider>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
