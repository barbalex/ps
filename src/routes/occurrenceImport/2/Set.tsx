import { memo, useCallback, useState } from 'react'
import { Button } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { setGeometries } from './setGeometries'

const notificationStyle = {
  color: 'red',
}

export const Set = memo(({ occurrenceImport }) => {
  const [notification, setNotification] = useState()
  const { db } = useElectric()!
  const { results: occurrences } = useLiveQuery(
    db.occurrences.liveMany({
      where: { occurrence_import_id: occurrenceImport?.occurrence_import_id },
    }),
  )

  const occurrencesWithoutGeometry = (occurrences ?? []).filter(
    (o) => !o.geometry,
  )

  const toSetCount = occurrencesWithoutGeometry?.length ?? 0

  const onClick = useCallback(async () => {
    setGeometries({ occurrenceImport, db, setNotification })
  }, [db, occurrenceImport])

  if (!occurrences) return null

  if (toSetCount === 0) return <div>All occurrences's geometries are set</div>

  return (
    <Button onClick={onClick}>
      <>
        <div>{`Set coordinates of ${toSetCount} occurrences`}</div>
        {notification && <div style={notificationStyle}>{notification}</div>}
      </>
    </Button>
  )
})
