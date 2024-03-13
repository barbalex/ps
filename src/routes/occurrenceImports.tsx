import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useParams } from 'react-router-dom'

import { createOccurrenceImport } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id, subproject_id } = useParams()

  const { db } = useElectric()!
  const { results: occurrenceImports = [] } = useLiveQuery(
    db.occurrence_imports.liveMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    }),
  )

  const baseUrl = `projects/${project_id}/subprojects/${subproject_id}/occurrence-imports`

  const add = useCallback(async () => {
    const data = createOccurrenceImport({ subproject_id })
    await db.occurrence_imports.create({ data })
    navigate(`${baseUrl}/${data.occurrence_import_id}`)
  }, [baseUrl, db.occurrence_imports, navigate, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Occurrence imports"
        addRow={add}
        tableName="occurrence import"
      />
      <div className="list-container">
        {occurrenceImports.map(({ occurrence_import_id, label }) => (
          <Row
            key={occurrence_import_id}
            label={label}
            to={`${baseUrl}/${occurrence_import_id}`}
          />
        ))}
      </div>
    </div>
  )
}
