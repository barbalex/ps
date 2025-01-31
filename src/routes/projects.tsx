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
  const [filter] = useAtom(projectsFilterAtom)
  console.log('filter', filter)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const sqlFiltered = `SELECT * FROM projects${
    filter?.length ? ` WHERE ${filter}` : ''
  } order by label asc`
  const resultFiltered = useLiveQuery(sqlFiltered)
  const projects = resultFiltered?.rows ?? []

  const countUnfilteredResult = useLiveQuery(`SELECT count(*) FROM projects`)
  const countUnfiltered = countUnfilteredResult?.rows[0]?.count ?? 0

  const isFiltered = projects.length !== countUnfiltered

  const add = useCallback(async () => {
    const data = await createProject({ db })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into projects (${columns}) values ($1)`
    await db.query(sql, values)
    navigate({ pathname: data.project_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Projects (${
          isFiltered ? `${projects.length}/${countUnfiltered}` : projects.length
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
