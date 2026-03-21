import { useParams, useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { FaFileImport } from 'react-icons/fa'
import { useIntl } from 'react-intl'

import { createListValue } from '../modules/createRows.ts'
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
  const importInputRef = useRef<HTMLInputElement>(null)

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

  const onClickImport = () => {
    importInputRef.current.click()
    importInputRef.current.value = null
  }

  const onImportFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // TODO: process file in step 2
    console.log('Import file selected:', file.name)
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
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.ods,.tsv"
        ref={importInputRef}
        style={{ display: 'none' }}
        onChange={onImportFileSelected}
      />
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
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
