import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createProject } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { projectsFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(projectsFilterAtom)
  // const filter = `name ilike '%demo%'`
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const sqlFiltered = `SELECT * FROM projects${
    filter?.length ? ` WHERE ${filter}` : ''
  } order by label asc`
  const resultFiltered = useLiveIncrementalQuery(sqlFiltered, [], 'project_id')
  const projects = resultFiltered?.rows ?? []

  const isFiltered = !!filter

  const add = useCallback(async () => {
    const data = await createProject({ db })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into projects (${columns}) values (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({ pathname: data.project_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Projects"
        nameSingular="project"
        tableName="projects"
        isFiltered={isFiltered}
        countFiltered={projects.length}
        addRow={add}
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
