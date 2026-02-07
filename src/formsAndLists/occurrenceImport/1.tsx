import { MdDone } from 'react-icons/md'
import { useState, useCallback } from 'react'
import { Button } from '@fluentui/react-components'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { UploadButton } from '../../components/shared/UploadButton.tsx'
import { processData } from './processData.ts'
import {
  replaceOccurrences,
  updateAndExtendOccurrences,
} from './updateOccurrences.ts'
import { DuplicateWarningDialog } from './DuplicateWarningDialog.tsx'
import { formatNumber } from '../../modules/formatNumber.ts'
import styles from './1.module.css'

export const One = ({
  occurrenceImport,
  occurrences,
  onChange,
  validations,
  autoFocusRef,
  db,
}) => {
  const [duplicateDialogData, setDuplicateDialogData] = useState<{
    duplicateCount: number
    totalCount: number
    continueImport: () => void
    cancelImport: () => void
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleReplace = async () => {
    setIsProcessing(true)
    try {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept =
        '.xlsx,.xls,.csv,.ods,.xml,.html,.txt,.dif,.sylk,.slk,.prn,.dbf,.wk1,.wk2,.wk3,.wk4,.wks,.xlsb,.xlsm,.xlt,.xltx,.xltm,.xlw'
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const result = await replaceOccurrences({
            file,
            occurrenceImport,
            db,
          })
          if (result.success) {
            alert(result.message)
          } else {
            alert(`Error: ${result.message}`)
          }
        }
        setIsProcessing(false)
      }
      fileInput.click()
    } catch (error) {
      console.error('Replace error:', error)
      alert(`Error: ${error.message}`)
      setIsProcessing(false)
    }
  }

  const handleUpdateAndExtend = async () => {
    setIsProcessing(true)
    try {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept =
        '.xlsx,.xls,.csv,.ods,.xml,.html,.txt,.dif,.sylk,.slk,.prn,.dbf,.wk1,.wk2,.wk3,.wk4,.wks,.xlsb,.xlsm,.xlt,.xltx,.xltm,.xlw'
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const result = await updateAndExtendOccurrences({
            file,
            occurrenceImport,
            db,
          })
          if (result.success) {
            alert(result.message)
          } else {
            alert(`Error: ${result.message}`)
          }
        }
        setIsProcessing(false)
      }
      fileInput.click()
    } catch (error) {
      console.error('Update and extend error:', error)
      alert(`Error: ${error.message}`)
      setIsProcessing(false)
    }
  }

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
      {occurrences?.length ?
        occurrenceImport.id_field ?
          <div className={styles.updateSection}>
            <h3>Update existing occurrences</h3>
            <div className={styles.updateButtons}>
              <Button
                appearance="secondary"
                onClick={handleReplace}
                disabled={isProcessing}
              >
                Replace
              </Button>
              <Button
                appearance="primary"
                onClick={handleUpdateAndExtend}
                disabled={isProcessing}
              >
                Update And Extend
              </Button>
            </div>
            <p className={styles.updateDescription}>
              <strong>Replace:</strong> Delete all occurrences and import new
              ones.
              <br />
              <strong>Update And Extend:</strong> Update existing occurrences,
              add new ones, and remove missing ones. Assignments (to places) and
              comments will be preserved.
            </p>
          </div>
        : <div className={styles.occurrencesImported}>
            <MdDone className={styles.doneIcon} />
            {`${formatNumber(occurrences.length)} occurrences imported`}
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
