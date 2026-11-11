import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { applyAbsenceRule } from './setAbsence.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
import styles from '../2/Set.module.css'
import type ObservationImports from '../../../models/public/ObservationImports.ts'

export const Set = ({ observationImport }: { observationImport: ObservationImports }) => {
  const [notification, setNotification] = useState<string | undefined>()
  const [settingAbsence, setSettingAbsence] = useState(false)
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT COUNT(*) as count FROM observations WHERE observation_import_id = $1`,
    [observationImport?.observation_import_id],
  )
  const observationCount = (res?.rows?.[0]?.count ?? 0) as number

  const onClick = () => {
    setSettingAbsence(true)
    // Don't await - let it run in background
    applyAbsenceRule({ observationImport, setNotification }).finally(() => {
      setSettingAbsence(false)
    })
  }

  const ruleReady =
    (observationImport.absence_method === 'boolean_column' &&
      !!observationImport.absence_field) ||
    (observationImport.absence_method === 'sql_expression' &&
      !!observationImport.absence_expression)

  if (!observationCount || !ruleReady) return null

  return (
    <>
      <Button
        onClick={onClick}
        icon={settingAbsence ? <Spinner size="tiny" /> : null}
        className={styles.setButton}
      >
        {settingAbsence
          ? formatMessage(
              { id: 'absSttg', defaultMessage: 'Absenzen werden gesetzt …' },
            )
          : formatMessage(
              {
                id: 'absSet',
                defaultMessage:
                  'Absenzen von {count} Beobachtungen setzen (erneut setzen leitet alle neu ab)',
              },
              { count: formatNumber(observationCount) as string },
            )}
      </Button>
      {notification && (
        <div className={styles.notification}>{notification}</div>
      )}
    </>
  )
}
