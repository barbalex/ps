import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { MdDone } from 'react-icons/md'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { setLabels } from './setLabels.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
import styles from './Set.module.css'
import type ObservationImports from '../../../models/public/ObservationImports.ts'
import type Observations from '../../../models/public/Observations.ts'

interface Props {
  observationImport: ObservationImports
}

export const Set = ({ observationImport }: Props) => {
  const [settingLabels, setSettingLabels] = useState(false)

  const res = useLiveQuery(
    `SELECT * FROM observations WHERE observation_import_id = $1`,
    [observationImport?.observation_import_id],
  )
  const observations: Observations[] = res?.rows ?? []

  const observationsWithoutLabel = observations.filter((o) => !o.label)
  const toSetCount = observationsWithoutLabel?.length ?? 0

  const onClick = () => {
    setSettingLabels(true)
    // Don't await - let it run in background
    setLabels({
      labelCreation: observationImport.label_creation,
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
      <div style={{ color: 'rgb(120, 120, 120)', padding: '8px 0' }}>
        Please create a label structure first
      </div>
    )
  }

  if (toSetCount === 0) {
    return (
      <div className={styles.allSet}>
        <MdDone className={styles.doneIcon} />
        {`All ${formatNumber(
          observations.length,
        )} observation${observations.length !== 1 ? 's' : ''} have labels set`}
      </div>
    )
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <Button
        onClick={onClick}
        icon={settingLabels ? <Spinner size="tiny" /> : null}
        className={styles.setButton}
      >
        {`${
          settingLabels ? 'Setting' : 'Set'
        } labels of ${formatNumber(toSetCount)} observation${toSetCount !== 1 ? 's' : ''}`}
      </Button>
    </div>
  )
}
