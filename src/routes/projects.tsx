import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createProject } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { projectsFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [projectsFilter] = useAtom(projectsFilterAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const projectsResult = useLiveQuery(
    `SELECT * FROM projects${
      projectsFilter && ` ${projectsFilter}`
    } order by label asc`,
  )
  const projects = projectsResult?.rows ?? []
  const projectsUnfilteredResult = useLiveQuery(
    `SELECT * FROM projects order by label asc`,
  )
  const projectsUnfiltered = projectsUnfilteredResult?.rows ?? []

  const isFiltered = projects.length !== projectsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createProject({ db })
    const columns = Object.keys(data)
    const values = Object.values(data).join("', '")
    const sql = `insert into projects (${columns}) values ('${values}')`
    const res = await db.query(sql)
    console.log('projects.add', { data, res })
    navigate({ pathname: data.project_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  console.log('projects', projects)

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Projects (${
          isFiltered
            ? `${projects.length}/${projectsUnfiltered.length}`
            : projects.length
        })`}
        addRow={add}
        tableName="project"
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {projects.map((project) => (
          <Row
            key={project.project_id}
            label={project.label}
            to={project.project_id}
          />
        ))}
      </div>
    </div>
  )
})
