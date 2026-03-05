import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { MdDone } from 'react-icons/md'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { setGeometries } from './setGeometries.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
import styles from './Set.module.css'
import type ObservationImports from '../../../models/public/ObservationImports.ts'
import type Observations from '../../../models/public/Observations.ts'

interface Props {
  observationImport: ObservationImports
}

export const Set = ({ observationImport }: Props) => {
  const [notification, setNotification] = useState()
  const [settingGeometries, setSettingGeometries] = useState(false)

  const res = useLiveQuery(
    `SELECT * FROM observations WHERE observation_import_id = $1`,
    [observationImport?.observation_import_id],
  )
  const observations: Observations[] = res?.rows ?? []

  const observationsWithoutGeometry = observations.filter((o) => !o.geometry)

  const toSetCount = observationsWithoutGeometry?.length ?? 0

  const onClick = () => {
    setSettingGeometries(true)
    // Don't await - let it run in background
    setGeometries({ observationImport, setNotification }).finally(() => {
      setSettingGeometries(false)
    })
  }

  if (!observations.length) return null

  if (toSetCount === 0) {
    return (
      <div className={styles.allSet}>
        <MdDone className={styles.doneIcon} />
        {`All ${formatNumber(
          observations.length,
        )} observations's geometries are set`}
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={onClick}
        icon={settingGeometries ? <Spinner size="tiny" /> : null}
        className={styles.setButton}
      >
        {`${
          settingGeometries ? 'Setting' : 'Set'
        } coordinates of ${formatNumber(toSetCount)} observation${toSetCount !== 1 ? 's' : ''}`}
      </Button>
      {notification && (
        <div className={styles.notification}>{notification}</div>
      )}
    </>
  )
}
