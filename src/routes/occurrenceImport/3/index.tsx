import { memo } from 'react'
import { LabelCreator } from './LabelCreator'

export const Three = memo(
  ({ occurrenceImport, occurrenceFields, onChange }) => {
    return <LabelCreator label={[]} fields={occurrenceFields} name="label" onChange={onChange} />
  },
)
