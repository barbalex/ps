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
import { ProjectForm as Form } from './Form.tsx'
import { ProjectUsers } from '../projectUsers.tsx'
import { Units } from '../units.tsx'
import { Files } from '../files.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createProjectUser, createUnit } from '../../modules/createRows.ts'
import {
  addOperationAtom,
  designingAtom,
  filesFilterAtom,
  projectUsersFilterAtom,
  unitsFilterAtom,
} from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { UploaderContext } from '../../UploaderContext.ts'
import type Projects from '../../models/public/Projects.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const ProjectWithFiles = ({ from }: { from: string }) => {
  const { projectId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [isDesigning] = useAtom(designingAtom)
  const [projectUsersFilter] = useAtom(projectUsersFilterAtom)
  const [unitsFilter] = useAtom(unitsFilterAtom)
  const [filesFilter] = useAtom(filesFilterAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row: Projects | undefined = res?.rows?.[0]

  const filesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM files WHERE project_id = $1`,
    [projectId],
  )
  const filesCount = filesCountRes?.rows?.[0]?.count ?? 0

  const projectUsersCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM project_users WHERE project_id = $1`,
    [projectId],
  )
  const projectUsersCount = projectUsersCountRes?.rows?.[0]?.count ?? 0

  const unitsCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM units WHERE project_id = $1`,
    [projectId],
  )
  const unitsCount = unitsCountRes?.rows?.[0]?.count ?? 0

  const usersInProject = row?.project_users_in_project !== false
  const unitsInProject = row?.units_in_project !== false
  const filesInProject = row?.project_files_in_project === true
  const showFiles = isDesigning || row?.files_active_projects !== false

  const isUsersOpen =
    location.pathname.endsWith('/users') ||
    location.pathname.includes('/users/')
  const isUsersList = /\/users\/?$/.test(location.pathname)
  const isUnitsOpen =
    location.pathname.endsWith('/units') ||
    location.pathname.includes('/units/')
  const isUnitsList = /\/units\/?$/.test(location.pathname)
  const isFilesOpen =
    location.pathname.endsWith('/files') ||
    location.pathname.includes('/files/')
  const isFilesList = /\/files\/?$/.test(location.pathname)

  const projectBaseUrl = `/data/projects/${projectId}`
  const projectUrl = `${projectBaseUrl}/project`
  const usersUrl = `${projectBaseUrl}/users`
  const unitsUrl = `${projectBaseUrl}/units`
  const filesUrl = `${projectBaseUrl}/files`

  const projectUsersIsFiltered = !!filterStringFromFilter(projectUsersFilter)
  const unitsIsFiltered = !!filterStringFromFilter(unitsFilter)
  const filesIsFiltered = !!filterStringFromFilter(filesFilter)
  const uploaderCtx = useContext(UploaderContext)
  const uploaderApi = uploaderCtx?.current?.getAPI?.()
  const onClickAddProjectUser = async () => {
    const id = await createProjectUser({ projectId })
    if (!id) return
    navigate({ to: `${usersUrl}/${id}/` })
  }
  const onClickAddUnit = async () => {
    const id = await createUnit({ projectId })
    if (!id) return
    navigate({ to: `${unitsUrl}/${id}/` })
  }
  const onClickAddFile = () => uploaderApi?.initFlow?.()

  const projectUserHeaderActions =
    isDesigning && usersInProject && isUsersList ? (
      <>
        <FilterButton isFiltered={projectUsersIsFiltered} />
        <Button
          size="medium"
          title={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
          icon={<FaPlus />}
          onClick={onClickAddProjectUser}
        />
      </>
    ) : undefined

  const fileHeaderActions =
    showFiles && filesInProject && isFilesList ? (
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

  const unitsHeaderActions =
    isDesigning && unitsInProject && isUnitsList ? (
      <>
        <FilterButton isFiltered={unitsIsFiltered} />
        <Button
          size="medium"
          title={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
          icon={<FaPlus />}
          onClick={onClickAddUnit}
        />
      </>
    ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

    try {
      await db.query(`UPDATE projects SET ${name} = $1 WHERE project_id = $2`, [
        value,
        projectId,
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
      table: 'projects',
      rowIdName: 'project_id',
      rowId: projectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Project" id={projectId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container" role="tabpanel" aria-labelledby="form">
        <Form
          onChange={onChange}
          validations={validations}
          row={row}
          from={from}
          autoFocusRef={autoFocusRef}
        />
        {showFiles && filesInProject ? (
          <Section
            title={`${formatMessage({ id: 'mn58Sh', defaultMessage: 'Dateien' })} (${filesCount})`}
            onHeaderClick={() =>
              isFilesList
                ? navigate({ to: projectUrl })
                : navigate({ to: filesUrl })
            }
            isOpen={isFilesOpen}
            titleStyle={{ marginBottom: 0 }}
            childrenStyle={{ marginLeft: -10, marginRight: -10 }}
            headerActions={fileHeaderActions}
          >
            {isFilesOpen &&
              (isFilesList ? (
                <Files projectId={projectId} hideTitle />
              ) : (
                <Outlet />
              ))}
          </Section>
        ) : (
          isFilesOpen && <Outlet />
        )}
        {isDesigning && usersInProject ? (
          <Section
            title={`${formatMessage({ id: 'eZ3yEB', defaultMessage: 'Benutzer' })} (${projectUsersCount})`}
            onHeaderClick={() =>
              isUsersList
                ? navigate({ to: projectUrl })
                : navigate({ to: usersUrl })
            }
            isOpen={isUsersOpen}
            titleStyle={{ marginBottom: 0 }}
            childrenStyle={{ marginLeft: -10, marginRight: -10 }}
            headerActions={projectUserHeaderActions}
          >
            {isUsersOpen &&
              (isUsersList ? <ProjectUsers hideHeader /> : <Outlet />)}
          </Section>
        ) : (
          isUsersOpen && <Outlet />
        )}
        {isDesigning && unitsInProject ? (
          <Section
            title={`${formatMessage({ id: 'nVkh0Z', defaultMessage: 'Einheiten' })} (${unitsCount})`}
            onHeaderClick={() =>
              isUnitsList
                ? navigate({ to: projectUrl })
                : navigate({ to: unitsUrl })
            }
            isOpen={isUnitsOpen}
            titleStyle={{ marginBottom: 0 }}
            childrenStyle={{ marginLeft: -10, marginRight: -10 }}
            headerActions={unitsHeaderActions}
          >
            {isUnitsOpen &&
              (isUnitsList ? (
                <Units projectId={projectId} hideHeader />
              ) : (
                <Outlet />
              ))}
          </Section>
        ) : (
          isUnitsOpen && <Outlet />
        )}
      </div>
    </div>
  )
}
