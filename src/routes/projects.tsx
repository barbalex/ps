import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { createProject } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import { upsertTableVectorLayersForProject } from '../modules/upsertTableVectorLayersForProject'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: projects = [] } = useLiveQuery(
    db.projects.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  // console.log('hello Projects')

  const add = useCallback(async () => {
    const data = await createProject({ db })
    await db.projects.create({ data })
    // add vector_layers and vector_layer_displays for tables with geometry
    await upsertTableVectorLayersForProject({ db, project_id: data.project_id })
    navigate({ pathname: data.project_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Projects" addRow={add} tableName="project" />
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
