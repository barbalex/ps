import { MdDone } from 'react-icons/md'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { UploadButton } from '../../components/shared/UploadButton.tsx'
import { processData } from './processData.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import styles from './1.module.css'

export const One = ({
  occurrenceImport,
  onChange,
  validations,
  autoFocusRef,
}) => (
  <>
    <TextField
      label="Name"
      name="name"
      type="name"
      value={occurrenceImport.name ?? ''}
      onChange={onChange}
      autoFocus
      ref={autoFocusRef}
      validationState={validations?.name?.state}
      validationMessage={validations?.name?.message}
    />
    <TextArea
      label="Attribution"
      name="attribution"
      value={occurrenceImport.attribution ?? ''}
      onChange={onChange}
      validationState={validations?.attribution?.state}
      validationMessage={
        validations?.attribution?.message ??
        'Please add the correct citation as required by the data provider'
      }
    />
    {occurrenceImport?.occurrences?.length ? (
      <div className={styles.occurrencesImported}>
        <MdDone className={styles.doneIcon} />
        {`${formatNumber(
          occurrenceImport.occurrences.length,
        )} occurrences imported`}
      </div>
    ) : (
      <UploadButton
        processData={processData}
        additionalData={{
          occurrence_import_id: occurrenceImport.occurrence_import_id,
          account_id: occurrenceImport.account_id,
        }}
      />
    )}
  </>
)
