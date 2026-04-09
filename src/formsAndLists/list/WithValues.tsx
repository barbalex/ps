import { useRef, useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { FaFileImport } from 'react-icons/fa'

import { Header } from './Header.tsx'
import { ListForm as Form } from './Form.tsx'
import { ListValues } from '../listValues.tsx'
import { ImportDialog } from '../listValues/ImportDialog.tsx'
import { importListValues } from '../listValues/importListValues.ts'
import { createListValue } from '../../modules/createRows.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { Delete } from '../../components/FormMenu/Delete.tsx'
import { addOperationAtom, pgliteDbAtom, store } from '../../store.ts'
import type Lists from '../../models/public/Lists.ts'
import styles from './WithValues.module.css'

import '../../form.css'

const { Button, Tooltip } = fluentUiReactComponents

export const ListWithValues = ({ from }: { from: string }) => {
  const { projectId, listId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM lists WHERE list_id = $1`, [listId])
  const row: Lists | undefined = res?.rows?.[0]

  const projectRes = useLiveQuery(
    `SELECT list_values_in_list FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const listValuesInList = projectRes?.rows?.[0]?.list_values_in_list !== false

  const listValueCountRes = useLiveQuery(
    `SELECT COUNT(*)::int AS count FROM list_values WHERE list_id = $1`,
    [listId],
  )
  const listValueCount = listValueCountRes?.rows?.[0]?.count ?? 0
  const listBaseUrl = `/data/projects/${projectId}/lists/${listId}`
  const valuesUrl = `${listBaseUrl}/values`

  const isListValuesOpen = location.pathname.includes(`/lists/${listId}/values`)
  const isListValuesList = /\/values\/?$/.test(location.pathname)

  const onClickAddListValue = async () => {
    const id = await createListValue({ listId })
    if (!id) return
    navigate({ to: `${valuesUrl}/${id}/` })
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

  const onClickImport = () => setImportDialogOpen(true)

  const onImportFileSelected = (file: File, valueType: string | undefined) => {
    importListValues({ file, listId, valueType })
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

  const valuesHeaderActions =
    listValuesInList && isListValuesList ? (
      <>
        {importButton}
        <Tooltip
          content={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
          relationship="label"
        >
          <Button size="medium" icon={<FaPlus />} onClick={onClickAddListValue} />
        </Tooltip>
        <Delete
          deleteRow={deleteAllValues}
          disabled={listValueCount === 0}
          deleteLabel={formatMessage({
            id: 'lVDeleteAll',
            defaultMessage: 'Alle Werte entfernen',
          })}
          deleteConfirmLabel={formatMessage({
            id: 'lVDeleteAllConfirm',
            defaultMessage: 'Alle Werte entfernen?',
          })}
        />
      </>
    ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE lists SET ${name} = $1 WHERE list_id = $2`, [
        value,
        listId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'lists',
      rowIdName: 'list_id',
      rowId: listId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res || !projectRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' })}
        id={listId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <ImportDialog
        open={importDialogOpen}
        listId={listId}
        onClose={() => setImportDialogOpen(false)}
        onFileSelected={onImportFileSelected}
      />
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          validations={validations}
        />
        {listValuesInList ? (
          <Section
            title={formatMessage({
              id: 'lV6LstVals',
              defaultMessage: 'Werte',
            })}
            parentUrl={listBaseUrl}
            listUrl={valuesUrl}
            isOpen={isListValuesOpen}
            titleClassName={styles.sectionTitle}
            childrenClassName={styles.sectionChildren}
            headerActions={valuesHeaderActions}
          >
            {isListValuesOpen &&
              (isListValuesList ? <ListValues hideHeader /> : <Outlet />)}
          </Section>
        ) : null}
      </div>
    </div>
  )
}
