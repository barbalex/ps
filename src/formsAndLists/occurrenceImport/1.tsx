import { MdDone } from 'react-icons/md'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { UploadButton } from '../../components/shared/UploadButton.tsx'
import { processData } from './processData.ts'
import { formatNumber } from '../../modules/formatNumber.ts'

const occurrencesImportedStyle = {
  color: 'rgba(38, 82, 37, 0.9)',
  fontWeight: 'bold',
}
const doneIconStyle = {
  paddingRight: 8,
  fontSize: '1.4em',
  fontWeight: 'bold',
  verticalAlign: 'text-bottom',
}

export const One = ({ occurrenceImport, onChange, autoFocusRef }) => (
  <>
    <TextField
      label="Name"
      name="name"
      type="name"
      value={occurrenceImport.name ?? ''}
      onChange={onChange}
      autoFocus
      ref={autoFocusRef}
    />
    <TextArea
      label="Attribution"
      name="attribution"
      value={occurrenceImport.attribution ?? ''}
      onChange={onChange}
      validationMessage="Please add the correct citation as required by the data provider"
    />
    {occurrenceImport?.occurrences?.length ?
      <div style={occurrencesImportedStyle}>
        <MdDone style={doneIconStyle} />
        {`${formatNumber(
          occurrenceImport.occurrences.length,
        )} occurrences imported`}
      </div>
    : <UploadButton
        processData={processData}
        additionalData={{
          occurrence_import_id: occurrenceImport.occurrence_import_id,
        }}
      />
    }
  </>
)
