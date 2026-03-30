import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createCheckTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
    checkTaxonId,
  } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/checks/${checkId}/taxa/${checkTaxonId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/checks/${checkId}/taxa/${checkTaxonId}`

  const db = usePGlite()

  // Keep a ref to the current checkTaxonId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const checkTaxonIdRef = useRef(checkTaxonId)
  useEffect(() => {
    checkTaxonIdRef.current = checkTaxonId
  }, [checkTaxonId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM check_taxa WHERE check_id = '${checkId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createCheckTaxon({ checkId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, checkTaxonId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM check_taxa WHERE check_taxon_id = $1',
        [checkTaxonId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query('DELETE FROM check_taxa WHERE check_taxon_id = $1', [
        checkTaxonId,
      ])
      addOperation({
        table: 'check_taxa',
        rowIdName: 'check_taxon_id',
        rowId: checkTaxonId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting check taxon:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT check_taxon_id FROM check_taxa WHERE check_id = $1 ORDER BY label',
        [checkId],
      )
      const checkTaxa = res?.rows
      const len = checkTaxa.length
      const index = checkTaxa.findIndex(
        (p) => p.check_taxon_id === checkTaxonIdRef.current,
      )
      const next = checkTaxa[(index + 1) % len]
      navigate({
        to: `../${next.check_taxon_id}`,
        params: (prev) => ({ ...prev, checkTaxonId: next.check_taxon_id }),
      })
    } catch (error) {
      console.error('Error navigating to next check taxon:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT check_taxon_id FROM check_taxa WHERE check_id = $1 ORDER BY label',
        [checkId],
      )
      const checkTaxa = res?.rows
      const len = checkTaxa.length
      const index = checkTaxa.findIndex(
        (p) => p.check_taxon_id === checkTaxonIdRef.current,
      )
      const previous = checkTaxa[(index + len - 1) % len]
      navigate({
        to: `../${previous.check_taxon_id}`,
        params: (prev) => ({ ...prev, checkTaxonId: previous.check_taxon_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous check taxon:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: '1kFtKf', defaultMessage: 'Kontroll-Taxon' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName={formatMessage({ id: '1kFtKf', defaultMessage: 'Kontroll-Taxon' })}
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="check_taxa_history"
          rowIdField="check_taxon_id"
          rowId={checkTaxonId}
        />
      }
    />
  )
}
