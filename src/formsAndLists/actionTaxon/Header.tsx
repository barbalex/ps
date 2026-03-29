import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createActionTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from = undefined }) => {
  const { projectId, subprojectId, placeId, placeId2, actionId, actionTaxonId } =
    useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/actions/${actionId}/taxa/${actionTaxonId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/actions/${actionId}/taxa/${actionTaxonId}`

  const db = usePGlite()

  // Keep a ref to the current actionTaxonId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const actionTaxonIdRef = useRef(actionTaxonId)
  useEffect(() => {
    actionTaxonIdRef.current = actionTaxonId
  }, [actionTaxonId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM action_taxa WHERE action_id = '${actionId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createActionTaxon({ actionId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, actionTaxonId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM action_taxa WHERE action_taxon_id = $1',
        [actionTaxonId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query('DELETE FROM action_taxa WHERE action_taxon_id = $1', [
        actionTaxonId,
      ])
      addOperation({
        table: 'action_taxa',
        rowIdName: 'action_taxon_id',
        rowId: actionTaxonId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting action taxon:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT action_taxon_id FROM action_taxa WHERE action_id = $1 ORDER BY label',
        [actionId],
      )
      const actionTaxa = res?.rows
      const len = actionTaxa.length
      const index = actionTaxa.findIndex(
        (p) => p.action_taxon_id === actionTaxonIdRef.current,
      )
      const next = actionTaxa[(index + 1) % len]
      navigate({
        to: `../${next.action_taxon_id}`,
        params: (prev) => ({ ...prev, actionTaxonId: next.action_taxon_id }),
      })
    } catch (error) {
      console.error('Error navigating to next action taxon:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT action_taxon_id FROM action_taxa WHERE action_id = $1 ORDER BY label',
        [actionId],
      )
      const actionTaxa = res?.rows
      const len = actionTaxa.length
      const index = actionTaxa.findIndex(
        (p) => p.action_taxon_id === actionTaxonIdRef.current,
      )
      const previous = actionTaxa[(index + len - 1) % len]
      navigate({
        to: `../${previous.action_taxon_id}`,
        params: (prev) => ({
          ...prev,
          actionTaxonId: previous.action_taxon_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous action taxon:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'mN1OpQ',
        defaultMessage: 'Massnahmen-Taxon',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName={formatMessage({
        id: 'mN1OpQ',
        defaultMessage: 'Massnahmen-Taxon',
      })}
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="action_taxa_history"
          rowIdField="action_taxon_id"
          rowId={actionTaxonId}
        />
      }
    />
  )
}
