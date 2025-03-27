import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createProjectUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/users/'

export const ProjectUsers = memo(() => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT project_user_id, label FROM project_users WHERE project_id = $1 ORDER BY label`,
    [projectId],
    'project_user_id',
  )
  const isLoading = res === undefined
  const projectUsers = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createProjectUser({ db, projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.project_user_id,
      params: (prev) => ({ ...prev, projectUserId: data.project_user_id }),
    })
  }, [db, navigate, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Project Users"
        nameSingular="project user"
        tableName="project_users"
        isFiltered={false}
        countFiltered={projectUsers.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {projectUsers.map(({ project_user_id, label }) => (
              <Row
                key={project_user_id}
                to={project_user_id}
                label={label ?? project_user_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
