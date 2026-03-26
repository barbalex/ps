import { useRef, useState } from 'react'
import {
  useParams,
  useNavigate,
  useLocation,
  Outlet,
} from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createActionQuantity } from '../../modules/createRows.ts'
import { createActionTaxon } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { ActionForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { ActionTaxonInline } from '../actionTaxon/Inline.tsx'
import { addOperationAtom, designingAtom } from '../../store.ts'
import type Actions from '../../models/public/Actions.ts'

import '../../form.css'

const { Button, Tooltip } = fluentUiReactComponents

export const ActionWithAll = ({ from }) => {
  const { actionId, projectId, placeId, placeId2, subprojectId } = useParams({
    strict: false,
  })
  const addOperation = useSetAtom(addOperationAtom)
  const [isDesigning] = useAtom(designingAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM actions WHERE action_id = $1`, [
    actionId,
  ])
  const row: Actions | undefined = res?.rows?.[0]

  const quantitiesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM action_quantities WHERE action_id = $1`,
    [actionId],
  )
  const quantitiesCount = quantitiesCountRes?.rows?.[0]?.count ?? 0

  const taxaRes = useLiveQuery(
    `SELECT action_taxon_id FROM action_taxa WHERE action_id = $1 ORDER BY action_taxon_id`,
    [actionId],
  )
  const taxa = taxaRes?.rows ?? []

  const placeLevelRes = useLiveQuery(
    `SELECT action_quantities, action_quantities_in_action, action_taxa, action_taxa_in_action FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const quantitiesInAction = placeLevel?.action_quantities_in_action !== false
  const taxaInAction = placeLevel?.action_taxa_in_action !== false
  const showQuantities =
    quantitiesInAction &&
    (isDesigning || placeLevel?.action_quantities !== false)
  const showTaxa =
    taxaInAction && (isDesigning || placeLevel?.action_taxa !== false)

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(`UPDATE actions SET ${name} = $1 WHERE action_id = $2`, [
        value,
        actionId,
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
      table: 'actions',
      rowIdName: 'action_id',
      rowId: actionId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const isQuantitiesOpen =
    location.pathname.endsWith('/quantities') ||
    location.pathname.includes('/quantities/')
  const isQuantitiesList = location.pathname.endsWith('/quantities')

  const actionBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${placeId2 ? `/places/${placeId2}` : ''}/actions/${actionId}`
  const actionUrl = `${actionBaseUrl}/action`
  const quantitiesUrl = `${actionBaseUrl}/quantities`

  const addQuantity = async () => {
    const id = await createActionQuantity({ actionId, projectId })
    if (!id) return
    navigate({ to: `${quantitiesUrl}/${id}` })
  }

  const quantitiesHeaderActions =
    showQuantities && isQuantitiesList ? (
      <Button
        size="medium"
        title={formatMessage({
          id: 'V6iUlF',
          defaultMessage: 'Menge hinzufügen',
        })}
        icon={<FaPlus />}
        onClick={addQuantity}
      />
    ) : undefined

  const addTaxon = async () => {
    await createActionTaxon({ actionId })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        {!res ? (
          <Loading />
        ) : row ? (
          <>
            <Form
              onChange={onChange}
              validations={validations}
              row={row}
              autoFocusRef={autoFocusRef}
              from={from}
            />
            {showQuantities ? (
              <Section
                title={`${formatMessage({ id: 'Xuj/Gy', defaultMessage: 'Mengen' })} (${quantitiesCount})`}
                onNavigate={() => navigate({ to: quantitiesUrl })}
                onHeaderClick={() =>
                  isQuantitiesOpen
                    ? navigate({ to: actionUrl })
                    : navigate({ to: quantitiesUrl })
                }
                isOpen={isQuantitiesOpen}
                titleStyle={{ marginBottom: 0 }}
                childrenStyle={{ marginLeft: -10, marginRight: -10 }}
                headerActions={quantitiesHeaderActions}
              >
                {isQuantitiesOpen && <Outlet />}
              </Section>
            ) : (
              isQuantitiesOpen && <Outlet />
            )}
            {showTaxa && (
              <Section
                title={formatMessage({
                  id: '7sVbg1',
                  defaultMessage: 'Taxa',
                })}
              >
                {taxa.map((t, i) => (
                  <div key={t.action_taxon_id}>
                    {i > 0 && (
                      <div
                        style={{
                          borderTop: '8px solid rgb(225, 247, 224)',
                          marginLeft: -10,
                          marginRight: -10,
                          marginBottom: 8,
                        }}
                      />
                    )}
                    <ActionTaxonInline
                      actionTaxonId={t.action_taxon_id}
                      projectId={projectId}
                    />
                  </div>
                ))}
                {taxa.length > 0 && (
                  <div
                    style={{
                      borderTop: '8px solid rgb(225, 247, 224)',
                      marginLeft: -10,
                      marginRight: -10,
                    }}
                  />
                )}
                <Tooltip
                  content={formatMessage({
                    id: 'jH7LwO',
                    defaultMessage: 'Taxon hinzufügen',
                  })}
                  relationship="label"
                >
                  <Button icon={<FaPlus />} onClick={addTaxon} />
                </Tooltip>
              </Section>
            )}
          </>
        ) : (
          <NotFound
            table={formatMessage({ id: 'upa2nh', defaultMessage: 'Massnahme' })}
            id={actionId}
          />
        )}
      </div>
    </div>
  )
}
