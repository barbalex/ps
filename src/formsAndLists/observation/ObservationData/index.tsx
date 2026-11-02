import { useCallback, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { arrayMoveImmutable } from 'array-move'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { exists } from '../../../modules/exists.ts'
import { ErrorBoundary } from '../../../components/shared/ErrorBoundary.tsx'
import { Section } from '../../../components/shared/Section.tsx'
import { Field } from './Field.tsx'
import { Loading } from '../../../components/shared/Loading.tsx'
import { observationFieldsSortedAtom } from '../../../store.ts'
import styles from './index.module.css'
import type Observations from '../../../models/public/Observations.ts'

export const OccurenceData = (_props: { from: string }) => {
  const [observationFieldsSorted, setObservationFieldsSorted] = useAtom(
    observationFieldsSortedAtom,
  )
  const { observationId } = useParams({ strict: false })
  const { formatMessage } = useIntl()

  const sortedBeobFields = observationFieldsSorted.slice()

  const sortFn = (a: [string, unknown], b: [string, unknown]) => {
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
  }

  const res = useLiveQuery(
    `SELECT * FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const observation = res?.rows?.[0] as Observations | undefined

  const rowData = observation?.data ?? {}
  const fields = Object.entries(rowData as Record<string, unknown>)

    .filter(([_key, value]) => exists(value))
    .sort(sortFn)
  const keys = fields.map((f) => f[0])

  const setSortedBeobFields = useCallback(
    (newArray: string[]) => setObservationFieldsSorted(newArray),
    [setObservationFieldsSorted],
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

  const moveField = (
    draggedLabel: string,
    hoveredLabel: string,
    pointerBelowMiddle: boolean,
  ) => {
    const fromIndex = sortedBeobFields.indexOf(draggedLabel)
    const toIndex = sortedBeobFields.indexOf(hoveredLabel)
    // catch some edge cases
    if (fromIndex === toIndex) return
    if (fromIndex === -1) return
    if (toIndex === -1) return
    // only move once the pointer has crossed the middle of the hovered row:
    // downward drags act below the middle, upward drags above it
    if (fromIndex < toIndex && !pointerBelowMiddle) return
    if (fromIndex > toIndex && pointerBelowMiddle) return

    // move
    const newArray = arrayMoveImmutable(sortedBeobFields, fromIndex, toIndex)
    setSortedBeobFields(newArray)
  }

  if (!observation) return <Loading />
  if (!fields || fields.length === 0) return null

  return (
    <ErrorBoundary>
      <div>
        <Section
          title={formatMessage({ id: 'obs0Raw', defaultMessage: 'Rohdaten' })}
        >
          {null}
        </Section>
        <p className={styles.explainer}>
          {formatMessage({
            id: 'obs0Dnd',
            defaultMessage: 'Felder per Drag-and-Drop sortieren',
          })}
        </p>
        <div className={styles.outerContainer}>
          <div className={styles.container}>
            {fields.map((field) => (
              <Field
                key={field[0]}
                label={field[0]}
                value={field[1]}
                moveField={moveField}
              />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
