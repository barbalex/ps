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
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  addOperationAtom,
  designingAtom,
  filesFilterAtom,
  languageAtom,
} from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { UploaderContext } from '../../UploaderContext.ts'
import type Subprojects from '../../models/public/Subprojects.ts'
import type Projects from '../../models/public/Projects.ts'

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
  const [filesFilter] = useAtom(filesFilterAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT
      subprojects.*,
      ${subprojectNameSingularExpr(language, 'projects')} AS subproject_name_singular,
      projects.files_active_subprojects,
      projects.subproject_files_in_subproject
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

  const showFiles = isDesigning || row?.files_active_subprojects !== false

  const isFilesOpen =
    location.pathname.endsWith('/files') || location.pathname.includes('/files/')
  const isFilesList = /\/files\/?$/.test(location.pathname)

  const subprojectBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}`
  const subprojectUrl = `${subprojectBaseUrl}/subproject`
  const filesUrl = `${subprojectBaseUrl}/files`

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
      await db.query(`UPDATE subprojects SET ${name} = $1 WHERE subproject_id = $2`, [
        value,
        subprojectId,
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
        {showFiles ? (
          <Section
            title={`${formatMessage({ id: 'mn58Sh', defaultMessage: 'Dateien' })} (${filesCount})`}
            onHeaderClick={() =>
              isFilesList
                ? navigate({ to: subprojectUrl })
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
