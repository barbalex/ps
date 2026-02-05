import { useLiveQuery } from '@electric-sql/pglite-react'

import { LabelCreator } from '../../components/shared/LabelCreator/index.tsx'
import { setLabels } from './3/setLabels.ts'
import { formatNumber } from '../../modules/formatNumber.ts'

export const Three = ({ occurrenceImport, occurrenceFields, onChange }) => {
  const res = useLiveQuery(
    `SELECT COUNT(*) as count FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImport?.occurrence_import_id],
  )
  const occurrenceCount = res?.rows?.[0]?.count ?? 0

  const onApply = async () => {
    await setLabels({ occurrenceImport })
  }

  const buttonLabel = occurrenceCount > 0 
    ? `Set labels of ${formatNumber(occurrenceCount)} occurrence${occurrenceCount !== 1 ? 's' : ''}`
    : 'Apply changes'

  return (
    <LabelCreator
      label={occurrenceImport.label_creation}
      fields={occurrenceFields}
      name="label_creation"
      onChange={onChange}
      buttonLabel={buttonLabel}
      onApply={onApply}
    />
  )
}
