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
  const { results: occurrences = [] } = useLiveQuery(
    db.occurrences.liveMany({
      where: { occurrence_import_id: occurrenceImport?.occurrence_import_id },
    }),
  )

  const occurrencesWithoutGeometry = occurrences?.filter((o) => !o.geometry)

  const toConvertCount = occurrencesWithoutGeometry?.length ?? 0

  const onClick = useCallback(async () => {
    setGeometries({ occurrenceImport, db, setNotification })
  }, [db, occurrenceImport])

  if (toConvertCount === 0) return null

  return (
    <Button onClick={onClick}>
      <>
        <div>{`Convert coordinates of ${toConvertCount} occurrences to EPSG:4326`}</div>
        {notification && <div style={notificationStyle}>{notification}</div>}
      </>
    </Button>
  )
})
