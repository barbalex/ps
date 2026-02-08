import { useState } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { MdDone } from 'react-icons/md'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { setGeometries } from './setGeometries.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
import styles from './Set.module.css'
import type OccurrenceImports from '../../../models/public/OccurrenceImports.ts'
import type Occurrences from '../../../models/public/Occurrences.ts'

interface Props {
  occurrenceImport: OccurrenceImports
}

export const Set = ({ occurrenceImport }: Props) => {
  const [notification, setNotification] = useState()
  const [settingGeometries, setSettingGeometries] = useState(false)

  const res = useLiveQuery(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImport?.occurrence_import_id],
  )
  const occurrences: Occurrences[] = res?.rows ?? []

  const occurrencesWithoutGeometry = occurrences.filter((o) => !o.geometry)

  const toSetCount = occurrencesWithoutGeometry?.length ?? 0

  const onClick = async () => {
    setSettingGeometries(true)
    await setGeometries({ occurrenceImport, setNotification })
    setSettingGeometries(false)
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
        } coordinates of ${formatNumber(toSetCount)} occurrence${toSetCount !== 1 ? 's' : ''}`}</div>
        {notification && (
          <div className={styles.notification}>{notification}</div>
        )}
      </>
    </Button>
  )
}
