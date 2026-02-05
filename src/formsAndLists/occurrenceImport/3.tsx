import { LabelCreator } from '../../components/shared/LabelCreator/index.tsx'
import { Set } from './3/Set.tsx'

export const Three = ({ occurrenceImport, occurrenceFields, onChange }) => (
  <>
    <LabelCreator
      label={occurrenceImport.label_creation}
      fields={occurrenceFields}
      name="label_creation"
      onChange={onChange}
    />
    <Set occurrenceImport={occurrenceImport} />
  </>
)
