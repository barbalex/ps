import { useCallback, memo, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createProject } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_projects?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState?.filter_projects],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: projects = [] } = useLiveQuery(
    db.projects.liveMany({
      where,
      orderBy: { label: 'asc' },
    }),
  )
  const { results: projectsUnfiltered = [] } = useLiveQuery(
    db.projects.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = projects.length !== projectsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createProject({ db })
    await db.projects.create({ data })
    navigate({ pathname: data.project_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

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
        menus={
          <FilterButton tableName="project" filterField="filter_projects" />
        }
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
