import { MdDone } from 'react-icons/md'
import { useState, useCallback } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { UploadButton } from '../../components/shared/UploadButton.tsx'
import { processData } from './processData.ts'
import {
  replaceObservations,
  updateAndExtendObservations,
} from './updateObservations.ts'
import { DuplicateWarningDialog } from './DuplicateWarningDialog.tsx'
import { ResultDialog } from './ResultDialog.tsx'
import { formatNumber } from '../../modules/formatNumber.ts'
import styles from './1.module.css'

export const One = ({
  observationImport,
  observations,
  onChange,
  validations,
  autoFocusRef,
  db,
}) => {
  const { formatMessage } = useIntl()
  const [duplicateDialogData, setDuplicateDialogData] = useState<{
    duplicateCount: number
    totalCount: number
    continueImport: () => void
    cancelImport: () => void
  } | null>(null)
  const [resultDialogData, setResultDialogData] = useState<{
    title: string
    message: string
    isError: boolean
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
          const result = await replaceObservations({
            file,
            observationImport,
            db,
          })
          if (result.success) {
            setResultDialogData({
              title: formatMessage({
                id: 'rPsUcc',
                defaultMessage: 'Ersetzen erfolgreich',
              }),
              message: result.message,
              isError: false,
            })
          } else {
            setResultDialogData({
              title: formatMessage({
                id: 'rPsFai',
                defaultMessage: 'Ersetzen fehlgeschlagen',
              }),
              message: result.message,
              isError: true,
            })
          }
        }
        setIsProcessing(false)
      }
      fileInput.click()
    } catch (error) {
      console.error('Replace error:', error)
      setResultDialogData({
        title: formatMessage({
          id: 'rPsFai',
          defaultMessage: 'Ersetzen fehlgeschlagen',
        }),
        message:
          error.message ||
          formatMessage({
            id: 'anUnEx',
            defaultMessage: 'Ein Fehler ist aufgetreten',
          }),
        isError: true,
      })
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
          const result = await updateAndExtendObservations({
            file,
            observationImport,
            db,
          })
          if (result.success) {
            setResultDialogData({
              title: formatMessage({
                id: 'uPsUcc',
                defaultMessage: 'Aktualisierung erfolgreich',
              }),
              message: result.message,
              isError: false,
            })
          } else {
            setResultDialogData({
              title: formatMessage({
                id: 'uPsFai',
                defaultMessage: 'Aktualisierung fehlgeschlagen',
              }),
              message: result.message,
              isError: true,
            })
          }
        }
        setIsProcessing(false)
      }
      fileInput.click()
    } catch (error) {
      console.error('Update and extend error:', error)
      setResultDialogData({
        title: formatMessage({
          id: 'uPsFai',
          defaultMessage: 'Aktualisierung fehlgeschlagen',
        }),
        message:
          error.message ||
          formatMessage({
            id: 'anUnEx',
            defaultMessage: 'Ein Fehler ist aufgetreten',
          }),
        isError: true,
      })
      setIsProcessing(false)
    }
  }

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        type="name"
        value={observationImport.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <TextArea
        label={formatMessage({ id: 'aTr0bt', defaultMessage: 'Quellenangabe' })}
        name="attribution"
        value={observationImport.attribution ?? ''}
        onChange={onChange}
        validationState={validations?.attribution?.state}
        validationMessage={
          validations?.attribution?.message ??
          formatMessage({
            id: 'aTr9Vm',
            defaultMessage:
              'Bitte die korrekte Quellenangabe gemäss Anforderungen des Datenanbieters hinzufügen',
          })
        }
      />
      {observations?.length ? (
        observationImport.id_field ? (
          <div className={styles.updateSection}>
            <h3>
              {formatMessage({
                id: 'uPx0bO',
                defaultMessage: 'Bestehende Beobachtungen aktualisieren',
              })}
            </h3>
            <div className={styles.updateButtons}>
              <Button
                appearance="secondary"
                onClick={handleReplace}
                disabled={isProcessing}
              >
                {formatMessage({ id: 'rP0bTn', defaultMessage: 'Ersetzen' })}
              </Button>
              <Button
                appearance="primary"
                onClick={handleUpdateAndExtend}
                disabled={isProcessing}
              >
                {formatMessage({
                  id: 'uPaNeX',
                  defaultMessage: 'Aktualisieren und erweitern',
                })}
              </Button>
            </div>
            <p className={styles.updateDescription}>
              <strong>
                {formatMessage({ id: 'rP0bTn', defaultMessage: 'Ersetzen' })}:
              </strong>{' '}
              {formatMessage({
                id: 'dLa0Ob',
                defaultMessage:
                  'Alle Beobachtungen löschen und neue importieren.',
              })}
              <br />
              <strong>
                {formatMessage({
                  id: 'uPaNeX',
                  defaultMessage: 'Aktualisieren und erweitern',
                })}
                :
              </strong>{' '}
              {formatMessage({
                id: 'uPaNTx',
                defaultMessage:
                  'Bestehende Beobachtungen aktualisieren, neue hinzufügen und fehlende entfernen. Zuweisungen und Kommentare werden beibehalten.',
              })}
            </p>
          </div>
        ) : (
          <div className={styles.observationsImported}>
            <MdDone className={styles.doneIcon} />
            {formatMessage(
              {
                id: 'oImprt',
                defaultMessage: '{count} Beobachtungen importiert',
              },
              { count: formatNumber(observations.length) },
            )}
          </div>
        )
      ) : (
        <UploadButton
          processData={wrappedProcessData}
          additionalData={{
            observation_import_id: observationImport.observation_import_id,
            account_id: observationImport.account_id,
          }}
        />
      )}

      {duplicateDialogData && (
        <DuplicateWarningDialog
          open={true}
          duplicateCount={duplicateDialogData.duplicateCount}
          totalCount={duplicateDialogData.totalCount}
          onConfirm={duplicateDialogData.continueImport}
          onCancel={duplicateDialogData.cancelImport}
        />
      )}

      {resultDialogData && (
        <ResultDialog
          open={true}
          title={resultDialogData.title}
          message={resultDialogData.message}
          isError={resultDialogData.isError}
          onClose={() => setResultDialogData(null)}
        />
      )}
    </>
  )
}
