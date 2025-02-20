import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createSubproject } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { subprojectsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(subprojectsFilterAtom)
  const isFiltered = !!filter

  const { project_id } = useParams()
  const Navigate = useNavigate()
  const db = usePGlite()

  // TODO: ensure passing in filter works as expected (beware of joined table...)
  const result = useLiveQuery(
    `SELECT sp.subproject_id, sp.label, p.subproject_name_plural, p.subproject_name_singular 
      FROM subprojects sp inner join projects p on p.project_id = sp.project_id 
      WHERE sp.project_id = $1${
        isFiltered ? ` AND(${filter})` : ''
      } order by sp.label asc`,
    [project_id],
  )
  const subprojects = result?.rows ?? []
  const namePlural = result?.rows[0]?.subproject_name_plural ?? 'Subprojects'
  const nameSingular = result?.rows[0]?.subproject_name_singular ?? 'Subproject'
  const nameSingularLower = nameSingular.toLowerCase()

  // get projects.subproject_name_plural to name the table
  // const resultProject = useLiveQuery(
  //   `SELECT * FROM projects WHERE project_id = $1`,
  //   [project_id],
  // )
  // const namePlural =
  //   resultProject?.rows[0]?.subproject_name_plural ?? 'Subprojects'
  // const nameSingular =
  //   resultProject?.rows[0]?.subproject_name_singular ?? 'Subproject'
  // const nameSingularLower = nameSingular.toLowerCase()

  const add = useCallback(async () => {
    const res = await createSubproject({ db, project_id })
    const data = res.rows[0]
    Navigate(`/data/projects/${project_id}/subprojects/${data.subproject_id}`)
  }, [Navigate, db, project_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural={namePlural}
        nameSingular={nameSingularLower}
        tableName="subprojects"
        isFiltered={isFiltered}
        countFiltered={subprojects.length}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {subprojects.map(({ subproject_id, label }) => (
          <Row
            key={subproject_id}
            label={label ?? subproject_id}
            to={`/data/projects/${project_id}/subprojects/${subproject_id}`}
          />
        ))}
      </div>
    </div>
  )
})
