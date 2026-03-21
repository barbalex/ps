import { useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { FaFileImport } from 'react-icons/fa'
import { useIntl } from 'react-intl'

import { ImportDialog } from './listValues/ImportDialog.tsx'
import { importListValues } from './listValues/importListValues.ts'

import { createListValue } from '../modules/createRows.ts'
import { addOperationAtom, store, pgliteDbAtom } from '../store.ts'
import { useListValuesNavData } from '../modules/useListValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/lists/$listId_/values/'

export const ListValues = () => {
  const { projectId, listId } = useParams({ from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const { loading, navData } = useListValuesNavData({ projectId, listId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createListValue({ listId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, listValueId: id }),
    })
  }

  const onClickImport = () => setImportDialogOpen(true)

  const onImportFileSelected = (file: File, valueType: string | undefined) => {
    importListValues({ file, listId, valueType })
  }

  const deleteAllValues = async () => {
    const db = store.get(pgliteDbAtom)
    await db.query(`DELETE FROM list_values WHERE list_id = $1`, [listId])
    store.set(addOperationAtom, {
      table: 'list_values',
      operation: 'delete',
      filter: { function: 'eq', column: 'list_id', value: listId },
    })
  }

  const importButton = (
    <Tooltip
      content={formatMessage({
        id: 'lVImport',
        defaultMessage: 'Werte aus Datei importieren',
      })}
      relationship="label"
    >
      <Button size="medium" icon={<FaFileImport />} onClick={onClickImport} />
    </Tooltip>
  )

  return (
    <div className="list-view">
      <ImportDialog
        open={importDialogOpen}
        listId={listId}
        onClose={() => setImportDialogOpen(false)}
        onFileSelected={onImportFileSelected}
      />
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        deleteRow={deleteAllValues}
        deleteRowDisabled={!loading && navs.length === 0}
        deleteLabel={formatMessage({
          id: 'lVDeleteAll',
          defaultMessage: 'Alle Werte entfernen',
        })}
        deleteConfirmLabel={formatMessage({
          id: 'lVDeleteAllConfirm',
          defaultMessage: 'Alle Werte entfernen?',
        })}
        menus={[importButton]}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} to={id} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  )
}
