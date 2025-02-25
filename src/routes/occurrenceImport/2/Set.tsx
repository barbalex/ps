import { memo, useCallback, useState } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { MdDone } from 'react-icons/md'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { setGeometries } from './setGeometries.ts'

const spinnerStyle = {
  paddingRight: 8,
}
const notificationStyle = {
  color: 'red',
}
const allSetStyle = {
  color: 'rgba(38, 82, 37, 0.9)',
  fontWeight: 'bold',
}
const doneIconStyle = {
  paddingRight: 8,
  fontSize: '1.4em',
  fontWeight: 'bold',
  verticalAlign: 'text-bottom',
}

export const Set = memo(({ occurrenceImport }) => {
  const [notification, setNotification] = useState()
  const [settingGeometries, setSettingGeometries] = useState(false)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImport?.occurrence_import_id],
  )
  const occurrences = res?.rows ?? []

  const occurrencesWithoutGeometry = occurrences.filter((o) => !o.geometry)

  const toSetCount = occurrencesWithoutGeometry?.length ?? 0

  const onClick = useCallback(async () => {
    setSettingGeometries(true)
    setGeometries({ occurrenceImport, db, setNotification })
  }, [db, occurrenceImport])

  if (!occurrences.length) return null

  if (toSetCount === 0) {
    return (
      <div style={allSetStyle}>
        <MdDone style={doneIconStyle} />
        {`All ${new Intl.NumberFormat().format(
          occurrences.length,
        )} occurrences's geometries are set`}
      </div>
    )
  }

  return (
    <Button
      onClick={onClick}
      icon={
        settingGeometries ? (
          <Spinner
            size="tiny"
            style={spinnerStyle}
          />
        ) : null
      }
    >
      <>
        <div>{`${
          settingGeometries ? 'Setting' : 'Set'
        } coordinates of ${toSetCount} occurrences`}</div>
        {notification && <div style={notificationStyle}>{notification}</div>}
      </>
    </Button>
  )
})
