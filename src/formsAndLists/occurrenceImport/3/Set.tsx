import { useState } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { MdDone } from 'react-icons/md'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { setLabels } from './setLabels.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
import styles from './Set.module.css'
import type OccurrenceImports from '../../../models/public/OccurrenceImports.ts'
import type Occurrences from '../../../models/public/Occurrences.ts'

interface Props {
  occurrenceImport: OccurrenceImports
}

export const Set = ({ occurrenceImport }: Props) => {
  const [settingLabels, setSettingLabels] = useState(false)

  const res = useLiveQuery(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImport?.occurrence_import_id],
  )
  const occurrences: Occurrences[] = res?.rows ?? []

  const occurrencesWithoutLabel = occurrences.filter((o) => !o.label)
  const toSetCount = occurrencesWithoutLabel?.length ?? 0

  const onClick = () => {
    setSettingLabels(true)
    // Don't await - let it run in background
    setLabels({ 
      labelCreation: occurrenceImport.label_creation,
      occurrenceImportId: occurrenceImport.occurrence_import_id 
    }).finally(() => {
      setSettingLabels(false)
    })
  }

  if (!occurrences.length) return null

  const labelCreation = occurrenceImport?.label_creation
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
          occurrences.length,
        )} occurrence${occurrences.length !== 1 ? 's' : ''} have labels set`}
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
        } labels of ${formatNumber(toSetCount)} occurrence${toSetCount !== 1 ? 's' : ''}`}
      </Button>
    </div>
  )
}
