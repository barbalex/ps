import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { MdDone } from 'react-icons/md'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { setLabels } from './setLabels.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
import type { LabelElement } from '../../../components/shared/LabelCreator/index.tsx'
import styles from './Set.module.css'
import type ObservationImports from '../../../models/public/ObservationImports.ts'
import type Observations from '../../../models/public/Observations.ts'

interface Props {
  observationImport: ObservationImports
}

export const Set = ({ observationImport }: Props) => {
  const [settingLabels, setSettingLabels] = useState(false)
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT * FROM observations WHERE observation_import_id = $1`,
    [observationImport?.observation_import_id],
  )
  const observations = (res?.rows ?? []) as unknown as Observations[]

  const observationsWithoutLabel = observations.filter((o) => !o.label)
  const toSetCount = observationsWithoutLabel?.length ?? 0

  const onClick = () => {
    setSettingLabels(true)
    // Don't await - let it run in background
    setLabels({
      labelCreation: observationImport.label_creation as LabelElement[],
      observationImportId: observationImport.observation_import_id,
    }).finally(() => {
      setSettingLabels(false)
    })
  }

  if (!observations.length) return null

  const labelCreation = observationImport?.label_creation
  const hasLabelCreation =
    labelCreation && Array.isArray(labelCreation) && labelCreation.length > 0

  if (!hasLabelCreation) {
    return (
      <div className={styles.missingLabelCreation}>
        {formatMessage({
          id: 'lBlCrt',
          defaultMessage: 'Bitte zuerst eine Beschriftungsstruktur erstellen',
        })}
      </div>
    )
  }

  if (toSetCount === 0) {
    return (
      <div className={styles.allSet}>
        <MdDone className={styles.doneIcon} />
        {formatMessage(
          {
            id: 'lBlAlS',
            defaultMessage: 'Alle {count} Beobachtungen haben Beschriftungen',
          },
          { count: formatNumber(observations.length) as string },
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Button
        onClick={onClick}
        icon={settingLabels ? <Spinner size="tiny" /> : null}
        className={styles.setButton}
      >
        {settingLabels
          ? formatMessage(
              {
                id: 'lBlStg',
                defaultMessage:
                  'Beschriftungen von {count} Beobachtungen werden gesetzt',
              },
              { count: formatNumber(toSetCount) as string },
            )
          : formatMessage(
              {
                id: 'lBlSet',
                defaultMessage: '{count} Beobachtungen beschriften',
              },
              { count: formatNumber(toSetCount) as string },
            )}
      </Button>
    </div>
  )
}
