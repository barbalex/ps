import { useState } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { MdDone } from 'react-icons/md'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { setGeometries } from './setGeometries.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
import styles from './Set.module.css'

export const Set = ({ occurrenceImport }) => {
  const [notification, setNotification] = useState()
  const [settingGeometries, setSettingGeometries] = useState(false)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImport?.occurrence_import_id],
    'occurrence_id',
  )
  const occurrences = res?.rows ?? []

  const occurrencesWithoutGeometry = occurrences.filter((o) => !o.geometry)

  const toSetCount = occurrencesWithoutGeometry?.length ?? 0

  const onClick = () => {
    setSettingGeometries(true)
    setGeometries({ occurrenceImport, db, setNotification })
  }

  if (!occurrences.length) return null

  if (toSetCount === 0) {
    return (
      <div className={styles.allSet}>
        <MdDone className={styles.doneIcon} />
        {`All ${formatNumber(
          occurrences.length,
        )} occurrences's geometries are set`}
      </div>
    )
  }

  return (
    <Button
      onClick={onClick}
      icon={settingGeometries ? <Spinner size="tiny" /> : null}
    >
      <>
        <div>{`${
          settingGeometries ? 'Setting' : 'Set'
        } coordinates of ${toSetCount} occurrences`}</div>
        {notification && (
          <div className={styles.notification}>{notification}</div>
        )}
      </>
    </Button>
  )
}
