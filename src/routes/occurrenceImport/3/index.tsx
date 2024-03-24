import { memo } from 'react'
import { LabelCreator } from './LabelCreator'

export const Three = memo(
  ({ occurrenceImport, occurrenceFields, onChange }) => {
    return (
      <LabelCreator
        label={occurrenceImport?.label_creation ?? []}
        fields={occurrenceFields}
        name="label"
        onChange={onChange}
      />
    )
  },
)
