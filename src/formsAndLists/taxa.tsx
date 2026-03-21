import { useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { FaFileImport } from 'react-icons/fa'
import { useIntl } from 'react-intl'

import { createTaxon } from '../modules/createRows.ts'
import { addOperationAtom, store, pgliteDbAtom } from '../store.ts'
import { useTaxaNavData } from '../modules/useTaxaNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { ImportDialog } from './taxa/ImportDialog.tsx'
import { importTaxa } from './taxa/importTaxa.ts'
import '../form.css'

const from = '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/'

export const Taxa = () => {
  const { projectId, taxonomyId } = useParams({ from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const { loading, navData } = useTaxaNavData({
    projectId,
    taxonomyId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createTaxon({ taxonomyId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, taxonId: id }),
    })
  }

  const deleteAllTaxa = async () => {
    const db = store.get(pgliteDbAtom)
    await db.query(`DELETE FROM taxa WHERE taxonomy_id = $1`, [taxonomyId])
    store.set(addOperationAtom, {
      table: 'taxa',
      operation: 'delete',
      filter: { function: 'eq', column: 'taxonomy_id', value: taxonomyId },
    })
  }

  const onFileSelected = (file: File) => {
    importTaxa({ file, taxonomyId })
  }

  const importButton = (
    <Tooltip
      content={formatMessage({
        id: 'tImport',
        defaultMessage: 'Taxa aus Datei importieren',
      })}
      relationship="label"
    >
      <Button
        size="medium"
        icon={<FaFileImport />}
        onClick={() => setImportDialogOpen(true)}
      />
    </Tooltip>
  )

  return (
    <div className="list-view">
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onFileSelected={onFileSelected}
      />
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        deleteRow={deleteAllTaxa}
        deleteRowDisabled={!loading && navs.length === 0}
        deleteLabel={formatMessage({
          id: 'tDeleteAll',
          defaultMessage: 'Alle Taxa entfernen',
        })}
        deleteConfirmLabel={formatMessage({
          id: 'tDeleteAllConfirm',
          defaultMessage: 'Alle Taxa entfernen?',
        })}
        menus={[importButton]}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={id} />
          ))
        )}
      </div>
    </div>
  )
}
