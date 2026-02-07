import { MdDone } from 'react-icons/md'
import { useState, useCallback } from 'react'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { UploadButton } from '../../components/shared/UploadButton.tsx'
import { processData } from './processData.ts'
import { DuplicateWarningDialog } from './DuplicateWarningDialog.tsx'
import { formatNumber } from '../../modules/formatNumber.ts'
import styles from './1.module.css'

export const One = ({
  occurrenceImport,
  onChange,
  validations,
  autoFocusRef,
}) => {
  const [duplicateDialogData, setDuplicateDialogData] = useState<{
    duplicateCount: number
    totalCount: number
    continueImport: () => void
    cancelImport: () => void
  } | null>(null)

  const wrappedProcessData = useCallback(
    async ({ file, additionalData, db }) => {
      return new Promise((resolve, reject) => {
        processData({
          file,
          additionalData,
          db,
          onDuplicatesFound: (
            duplicateCount,
            totalCount,
            continueCallback,
            cancelCallback,
          ) => {
            setDuplicateDialogData({
              duplicateCount,
              totalCount,
              continueImport: () => {
                setDuplicateDialogData(null)
                continueCallback()
              },
              cancelImport: () => {
                setDuplicateDialogData(null)
                cancelCallback()
              },
            })
          },
        })
          .then(resolve)
          .catch(reject)
      })
    },
    [],
  )

  return (
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
      {occurrenceImport?.occurrences?.length ?
        <div className={styles.occurrencesImported}>
          <MdDone className={styles.doneIcon} />
          {`${formatNumber(
            occurrenceImport.occurrences.length,
          )} occurrences imported`}
        </div>
      : <UploadButton
          processData={wrappedProcessData}
          additionalData={{
            occurrence_import_id: occurrenceImport.occurrence_import_id,
            account_id: occurrenceImport.account_id,
          }}
        />
      }

      {duplicateDialogData && (
        <DuplicateWarningDialog
          open={true}
          duplicateCount={duplicateDialogData.duplicateCount}
          totalCount={duplicateDialogData.totalCount}
          onConfirm={duplicateDialogData.continueImport}
          onCancel={duplicateDialogData.cancelImport}
        />
      )}
    </>
  )
}
