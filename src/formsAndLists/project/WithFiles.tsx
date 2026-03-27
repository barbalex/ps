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
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom, designingAtom, filesFilterAtom } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { UploaderContext } from '../../UploaderContext.ts'
import type Projects from '../../models/public/Projects.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const ProjectWithFiles = ({ from }: { from: string }) => {
  const { projectId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [isDesigning] = useAtom(designingAtom)
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

  const showFiles = isDesigning || row?.files_active_projects !== false

  const isFilesOpen =
    location.pathname.endsWith('/files') || location.pathname.includes('/files/')
  const isFilesList = /\/files\/?$/.test(location.pathname)

  const projectBaseUrl = `/data/projects/${projectId}`
  const projectUrl = `${projectBaseUrl}/project`
  const filesUrl = `${projectBaseUrl}/files`

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
        {showFiles ? (
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
            {isFilesOpen && <Outlet />}
          </Section>
        ) : (
          isFilesOpen && <Outlet />
        )}
      </div>
    </div>
  )
}
