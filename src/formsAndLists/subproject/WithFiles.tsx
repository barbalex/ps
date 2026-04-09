import { useRef, useState, useContext } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { Header } from './Header.tsx'
import { SubprojectForm as Form } from './Form.tsx'
import { SubprojectReports } from '../subprojectReports.tsx'
import { SubprojectTaxa } from '../subprojectTaxa.tsx'
import { SubprojectUsers } from '../subprojectUsers.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  createSubprojectTaxon,
  createSubprojectUser,
  createSubprojectReport,
} from '../../modules/createRows.ts'
import {
  addOperationAtom,
  designingAtom,
  filesFilterAtom,
  languageAtom,
  subprojectTaxaFilterAtom,
  subprojectUsersFilterAtom,
} from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { UploaderContext } from '../../UploaderContext.ts'
import type Subprojects from '../../models/public/Subprojects.ts'
import type Projects from '../../models/public/Projects.ts'
import styles from './WithFiles.module.css'

import '../../form.css'

const { Button } = fluentUiReactComponents

type SubprojectWithProjectInfo = Subprojects & {
  subproject_name_singular: Projects['subproject_name_singular']
}

export const SubprojectWithFiles = ({ from }: { from: string }) => {
  const { projectId, subprojectId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [language] = useAtom(languageAtom)
  const [isDesigning] = useAtom(designingAtom)
  const [subprojectTaxaFilter] = useAtom(subprojectTaxaFilterAtom)
  const [subprojectUsersFilter] = useAtom(subprojectUsersFilterAtom)
  const [filesFilter] = useAtom(filesFilterAtom)
  const { formatMessage } = useIntl()
  const newLabel = formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT
      subprojects.*,
      ${subprojectNameSingularExpr(language, 'projects')} AS subproject_name_singular,
      projects.taxa,
      projects.files_active_subprojects,
      projects.subproject_taxa_in_subproject,
      projects.subproject_users_in_subproject,
      projects.subproject_files_in_subproject,
      projects.subproject_reports_in_subproject
    FROM subprojects
    INNER JOIN projects ON projects.project_id = subprojects.project_id
    WHERE subproject_id = $1`,
    [subprojectId],
  )
  const row: SubprojectWithProjectInfo | undefined = res?.rows?.[0]

  const filesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM files WHERE subproject_id = $1`,
    [subprojectId],
  )
  const filesCount = filesCountRes?.rows?.[0]?.count ?? 0

  const subprojectReportsCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM subproject_reports WHERE subproject_id = $1`,
    [subprojectId],
  )
  const subprojectReportsCount =
    subprojectReportsCountRes?.rows?.[0]?.count ?? 0

  const subprojectUsersCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM subproject_users WHERE subproject_id = $1`,
    [subprojectId],
  )
  const subprojectUsersCount = subprojectUsersCountRes?.rows?.[0]?.count ?? 0

  const subprojectTaxaCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM subproject_taxa WHERE subproject_id = $1`,
    [subprojectId],
  )
  const subprojectTaxaCount = subprojectTaxaCountRes?.rows?.[0]?.count ?? 0

  const showTaxa = isDesigning || row?.taxa !== false
  const taxaInSubproject = row?.subproject_taxa_in_subproject !== false
  const usersInSubproject = row?.subproject_users_in_subproject !== false
  const showFiles = isDesigning || row?.files_active_subprojects !== false
  const reportsInSubproject = row?.subproject_reports_in_subproject !== false

  const isReportsOpen =
    location.pathname.endsWith('/reports') ||
    location.pathname.includes('/reports/')
  const isReportsList = /\/reports\/?$/.test(location.pathname)

  const isTaxaOpen =
    location.pathname.endsWith('/taxa') || location.pathname.includes('/taxa/')
  const isTaxaList = /\/taxa\/?$/.test(location.pathname)
  const isUsersOpen =
    location.pathname.endsWith('/users') ||
    location.pathname.includes('/users/')
  const isUsersList = /\/users\/?$/.test(location.pathname)
  const isFilesOpen =
    location.pathname.endsWith('/files') ||
    location.pathname.includes('/files/')
  const isFilesList = /\/files\/?$/.test(location.pathname)

  const subprojectBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}`
  const subprojectUrl = `${subprojectBaseUrl}/subproject`
  const reportsUrl = `${subprojectBaseUrl}/reports`
  const taxaUrl = `${subprojectBaseUrl}/taxa`
  const usersUrl = `${subprojectBaseUrl}/users`
  const filesUrl = `${subprojectBaseUrl}/files`

  const subprojectTaxaIsFiltered =
    !!filterStringFromFilter(subprojectTaxaFilter)
  const subprojectUsersIsFiltered = !!filterStringFromFilter(
    subprojectUsersFilter,
  )
  const filesIsFiltered = !!filterStringFromFilter(filesFilter)
  const uploaderCtx = useContext(UploaderContext)
  const uploaderApi = uploaderCtx?.current?.getAPI?.()
  const onClickAddSubprojectReport = async () => {
    const id = await createSubprojectReport({ projectId, subprojectId })
    if (!id) return
    navigate({ to: `${reportsUrl}/${id}/` })
  }
  const onClickAddSubprojectUser = async () => {
    const id = await createSubprojectUser({ subprojectId })
    if (!id) return
    navigate({ to: `${usersUrl}/${id}/` })
  }
  const onClickAddSubprojectTaxon = async () => {
    const id = await createSubprojectTaxon({ subprojectId })
    if (!id) return
    navigate({ to: `${taxaUrl}/${id}/` })
  }
  const onClickAddFile = () => uploaderApi?.initFlow?.()

  const subprojectReportHeaderActions =
    reportsInSubproject && isReportsList ? (
      <>
        <Button
          size="medium"
          title={newLabel}
          icon={<FaPlus />}
          onClick={onClickAddSubprojectReport}
        />
      </>
    ) : undefined

  const subprojectTaxaHeaderActions =
    showTaxa && taxaInSubproject && isTaxaList ? (
      <>
        <FilterButton isFiltered={subprojectTaxaIsFiltered} />
        <Button
          size="medium"
          title={newLabel}
          icon={<FaPlus />}
          onClick={onClickAddSubprojectTaxon}
        />
      </>
    ) : undefined

  const subprojectUserHeaderActions =
    isDesigning && usersInSubproject && isUsersList ? (
      <>
        <FilterButton isFiltered={subprojectUsersIsFiltered} />
        <Button
          size="medium"
          title={newLabel}
          icon={<FaPlus />}
          onClick={onClickAddSubprojectUser}
        />
      </>
    ) : undefined

  const fileHeaderActions =
    showFiles && isFilesList ? (
      <>
        <FilterButton isFiltered={filesIsFiltered} />
        <Button
          size="medium"
          title={newLabel}
          icon={<FaPlus />}
          onClick={onClickAddFile}
        />
      </>
    ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE subprojects SET ${name} = $1 WHERE subproject_id = $2`,
        [value, subprojectId],
      )
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
      table: 'subprojects',
      rowIdName: 'subproject_id',
      rowId: subprojectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Subproject" id={subprojectId} />
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        nameSingular={row?.subproject_name_singular}
        from={from}
      />
      <div className="form-container" role="tabpanel" aria-labelledby="form">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          from={from}
          validations={validations}
        />
        {reportsInSubproject ? (
          <Section
            title={`${formatMessage({ id: 'CiJ0SG', defaultMessage: 'Berichte' })} (${subprojectReportsCount})`}
            parentUrl={subprojectUrl}
            listUrl={reportsUrl}
            isOpen={isReportsOpen}
            titleClassName={styles.sectionTitle}
            childrenClassName={styles.sectionChildren}
            headerActions={subprojectReportHeaderActions}
          >
            {isReportsOpen &&
              (isReportsList ? <SubprojectReports hideHeader /> : <Outlet />)}
          </Section>
        ) : (
          isReportsOpen && <Outlet />
        )}
        {showTaxa && taxaInSubproject ? (
          <Section
            title={`${formatMessage({ id: '7sVbg1', defaultMessage: 'Taxa' })} (${subprojectTaxaCount})`}
            parentUrl={subprojectUrl}
            listUrl={taxaUrl}
            isOpen={isTaxaOpen}
            titleClassName={styles.sectionTitle}
            childrenClassName={styles.sectionChildren}
            headerActions={subprojectTaxaHeaderActions}
          >
            {isTaxaOpen &&
              (isTaxaList ? (
                <SubprojectTaxa from={from} hideHeader />
              ) : (
                <Outlet />
              ))}
          </Section>
        ) : (
          isTaxaOpen && <Outlet />
        )}
        {isDesigning && usersInSubproject ? (
          <Section
            title={`${formatMessage({ id: 'eZ3yEB', defaultMessage: 'Benutzer' })} (${subprojectUsersCount})`}
            parentUrl={subprojectUrl}
            listUrl={usersUrl}
            isOpen={isUsersOpen}
            titleClassName={styles.sectionTitle}
            childrenClassName={styles.sectionChildren}
            headerActions={subprojectUserHeaderActions}
          >
            {isUsersOpen &&
              (isUsersList ? <SubprojectUsers hideHeader /> : <Outlet />)}
          </Section>
        ) : (
          isUsersOpen && <Outlet />
        )}
        {showFiles ? (
          <Section
            title={`${formatMessage({ id: 'mn58Sh', defaultMessage: 'Dateien' })} (${filesCount})`}
            parentUrl={subprojectUrl}
            listUrl={filesUrl}
            isOpen={isFilesOpen}
            titleClassName={styles.sectionTitle}
            childrenClassName={styles.sectionChildren}
            headerActions={fileHeaderActions}
          >
            {isFilesOpen && <Outlet />}
          </Section>
        ) : (
          isFilesOpen && <Outlet />
        )}
      </div>
    </div>
  )
}
