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
import { createCheckQuantity } from '../../modules/createRows.ts'
import { createCheckTaxon } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { CheckForm as Form } from './Form.tsx'
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
import type Checks from '../../models/public/Checks.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const CheckWithAll = ({
  from,
  allInline,
}: {
  from: string
  allInline?: boolean
}) => {
  const { checkId, projectId, placeId, placeId2, subprojectId } = useParams({
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

  const res = useLiveQuery(`SELECT * FROM checks WHERE check_id = $1`, [
    checkId,
  ])
  const row: Checks | undefined = res?.rows?.[0]

  const quantitiesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM check_quantities WHERE check_id = $1`,
    [checkId],
  )
  const quantitiesCount = quantitiesCountRes?.rows?.[0]?.count ?? 0

  const placeLevelRes = useLiveQuery(
    `SELECT check_quantities, check_quantities_in_check, check_taxa, check_taxa_in_check, check_files, files_in_check FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const quantitiesInCheck = placeLevel?.check_quantities_in_check !== false
  const taxaInCheck = placeLevel?.check_taxa_in_check !== false
  const filesInCheck =
    (isDesigning || placeLevel?.check_files !== false) &&
    placeLevel?.files_in_check !== false
  const showQuantities =
    quantitiesInCheck && (isDesigning || placeLevel?.check_quantities !== false)
  const showTaxa =
    taxaInCheck && (isDesigning || placeLevel?.check_taxa !== false)
  const showFiles = filesInCheck
  const allInlineComputed = quantitiesInCheck && taxaInCheck && filesInCheck
  // allInline prop from parent (CheckIndex) takes precedence when provided
  const isAllInline = allInline ?? allInlineComputed

  const filesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM files WHERE check_id = $1`,
    [checkId],
  )
  const filesCount = filesCountRes?.rows?.[0]?.count ?? 0

  const taxaCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM check_taxa WHERE check_id = $1`,
    [checkId],
  )
  const taxaCount = taxaCountRes?.rows?.[0]?.count ?? 0

  const [filesFilter] = useAtom(filesFilterAtom)
  const filesIsFiltered = !!filterStringFromFilter(filesFilter)
  const uploaderCtx = useContext(UploaderContext)
  const uploaderApi = uploaderCtx?.current?.getAPI?.()
  const onClickAddFile = () => uploaderApi?.initFlow?.()

  const isQuantitiesOpen =
    location.pathname.endsWith('/quantities') ||
    location.pathname.includes('/quantities/')
  const isQuantitiesList = location.pathname.endsWith('/quantities')

  const isFilesOpen =
    location.pathname.endsWith('/files') ||
    location.pathname.includes('/files/')
  const isFilesList = location.pathname.endsWith('/files')

  const isTaxaOpen =
    location.pathname.endsWith('/taxa') || location.pathname.includes('/taxa/')
  const isTaxaList = location.pathname.endsWith('/taxa')

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
  const checkBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${placeId2 ? `/places/${placeId2}` : ''}/checks/${checkId}`
  const quantitiesUrl = `${checkBaseUrl}/quantities`
  const filesUrl = `${checkBaseUrl}/files`
  const taxaUrl = `${checkBaseUrl}/taxa`
  const checkUrl = isAllInline ? checkBaseUrl : `${checkBaseUrl}/check`

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(`UPDATE checks SET ${name} = $1 WHERE check_id = $2`, [
        value,
        checkId,
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
      table: 'checks',
      rowIdName: 'check_id',
      rowId: checkId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const addQuantity = async () => {
    const id = await createCheckQuantity({ checkId })
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
    const id = await createCheckTaxon({ checkId })
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
                onNavigate={() => navigate({ to: quantitiesUrl })}
                onHeaderClick={() =>
                  isQuantitiesOpen
                    ? navigate({ to: checkUrl })
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
                onNavigate={() => navigate({ to: taxaUrl })}
                onHeaderClick={() =>
                  isTaxaOpen
                    ? navigate({ to: checkUrl })
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
            {showFiles ? (
              <Section
                title={`${formatMessage({ id: 'mn58Sh', defaultMessage: 'Dateien' })} (${filesCount})`}
                onNavigate={() => navigate({ to: filesUrl })}
                onHeaderClick={() =>
                  isFilesOpen
                    ? navigate({ to: checkUrl })
                    : navigate({ to: filesUrl })
                }
                isOpen={isFilesOpen}
                titleStyle={{ marginBottom: 0 }}
                childrenStyle={{ marginLeft: -10, marginRight: -10 }}
                headerActions={fileHeaderActions}
              >
                {isFilesOpen && <Outlet />}
              </Section>
            ) : (
              isFilesOpen && <Outlet />
            )}
          </>
        ) : (
          <NotFound table="Check" id={checkId} />
        )}
      </div>
    </div>
  )
}
