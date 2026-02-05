import { useState } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { setLabels } from './setLabels.ts'
import { formatNumber } from '../../../modules/formatNumber.ts'
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

  const onClick = async () => {
    setSettingLabels(true)
    await setLabels({ occurrenceImport })
    setSettingLabels(false)
  }

  if (!occurrences.length) return null

  // Check if all occurrences have labels that match the current label_creation
  // Since we can't easily check if labels match, we'll just show the button if label_creation exists
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

  return (
    <div style={{ marginTop: '16px' }}>
      <Button
        onClick={onClick}
        icon={settingLabels ? <Spinner size="tiny" /> : null}
      >
        {`${
          settingLabels ? 'Setting' : 'Set'
        } labels of ${formatNumber(occurrences.length)} occurrence${occurrences.length !== 1 ? 's' : ''}`}
      </Button>
    </div>
  )
}
