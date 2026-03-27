import { useRef, useState, useContext } from 'react'
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
import {
  createActionQuantity,
  createActionTaxon,
} from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { ActionForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import {
  addOperationAtom,
  designingAtom,
  filesFilterAtom,
} from '../../store.ts'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { UploaderContext } from '../../UploaderContext.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import type Actions from '../../models/public/Actions.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const ActionWithAll = ({
  from,
  allInline,
}: {
  from: string
  allInline?: boolean
}) => {
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

  const taxaCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM action_taxa WHERE action_id = $1`,
    [actionId],
  )
  const taxaCount = taxaCountRes?.rows?.[0]?.count ?? 0

  const placeLevelRes = useLiveQuery(
    `SELECT action_quantities, action_quantities_in_action, action_taxa, action_taxa_in_action, action_files, action_files_in_action FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const quantitiesInAction = placeLevel?.action_quantities_in_action !== false
  const taxaInAction = placeLevel?.action_taxa_in_action !== false
  const filesInAction =
    (isDesigning || placeLevel?.action_files !== false) &&
    placeLevel?.action_files_in_action !== false
  const showQuantities =
    quantitiesInAction &&
    (isDesigning || placeLevel?.action_quantities !== false)
  const showTaxa =
    taxaInAction && (isDesigning || placeLevel?.action_taxa !== false)
  const showFiles = filesInAction

  const allInlineComputed = quantitiesInAction && taxaInAction && filesInAction
  const isAllInline = allInline ?? allInlineComputed

  const filesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM files WHERE action_id = $1`,
    [actionId],
  )
  const filesCount = filesCountRes?.rows?.[0]?.count ?? 0

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
  const isQuantitiesList = /\/quantities\/?$/.test(location.pathname)

  const actionBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${placeId2 ? `/places/${placeId2}` : ''}/actions/${actionId}`
  const actionUrl = isAllInline ? actionBaseUrl : `${actionBaseUrl}/action`
  const quantitiesUrl = `${actionBaseUrl}/quantities`
  const taxaUrl = `${actionBaseUrl}/taxa`
  const filesUrl = `${actionBaseUrl}/files`

  const isFilesOpen =
    location.pathname.endsWith('/files') ||
    location.pathname.includes('/files/')
  const isFilesList = /\/files\/?$/.test(location.pathname)

  const [filesFilter] = useAtom(filesFilterAtom)
  const filesIsFiltered = !!filterStringFromFilter(filesFilter)
  const uploaderCtx = useContext(UploaderContext)
  const uploaderApi = uploaderCtx?.current?.getAPI?.()
  const onClickAddFile = () => uploaderApi?.initFlow?.()

  const fileHeaderActions =
    showFiles && isFilesList ? (
      <>
        <FilterButton isFiltered={filesIsFiltered} />
        <Button
          size="medium"
          title={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
          icon={<FaPlus />}
          onClick={onClickAddFile}
        />
      </>
    ) : undefined

  const isTaxaOpen =
    location.pathname.endsWith('/taxa') || location.pathname.includes('/taxa/')
  const isTaxaList = /\/taxa\/?$/.test(location.pathname)

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
    const id = await createActionTaxon({ actionId })
    if (!id) return
    navigate({ to: `${taxaUrl}/${id}` })
  }

  const taxaHeaderActions =
    showTaxa && isTaxaList ? (
      <Button
        size="medium"
        title={formatMessage({
          id: 'jH7LwO',
          defaultMessage: 'Taxon hinzufügen',
        })}
        icon={<FaPlus />}
        onClick={addTaxon}
      />
    ) : undefined

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} allInline={isAllInline} />
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
                onHeaderClick={() =>
                  isQuantitiesList
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
            {showTaxa ? (
              <Section
                title={`${formatMessage({ id: '7sVbg1', defaultMessage: 'Taxa' })} (${taxaCount})`}
                onHeaderClick={() =>
                  isTaxaList
                    ? navigate({ to: actionUrl })
                    : navigate({ to: taxaUrl })
                }
                isOpen={isTaxaOpen}
                titleStyle={{ marginBottom: 0 }}
                childrenStyle={{ marginLeft: -10, marginRight: -10 }}
                headerActions={taxaHeaderActions}
              >
                {isTaxaOpen && <Outlet />}
              </Section>
            ) : (
              isTaxaOpen && <Outlet />
            )}
            {showFiles && (
              <Section
                title={`${formatMessage({ id: 'mn58Sh', defaultMessage: 'Dateien' })} (${filesCount})`}
                onHeaderClick={() =>
                  isFilesList
                    ? navigate({ to: actionUrl })
                    : navigate({ to: filesUrl })
                }
                isOpen={isFilesOpen}
                titleStyle={{ marginBottom: 0 }}
                childrenStyle={{ marginLeft: -10, marginRight: -10 }}
                headerActions={fileHeaderActions}
              >
                {isFilesOpen && <Outlet />}
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
