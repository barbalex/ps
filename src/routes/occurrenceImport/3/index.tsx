import { memo } from 'react'

import { LabelCreator } from '../../../components/shared/LabelCreator'

export const Three = memo(
  ({ occurrenceImport, occurrenceFields, onChange }) => (
    <LabelCreator
      label={occurrenceImport.label_creation}
      fields={occurrenceFields}
      name="label_creation"
      onChange={onChange}
    />
  ),
)
