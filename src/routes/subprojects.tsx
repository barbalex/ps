import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate } from 'react-router-dom'

import { createSubproject } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const Navigate = useNavigate()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_subprojects?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_subprojects],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: subprojects = [] } = useLiveQuery(
    db.subprojects.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: subprojectsUnfiltered = [] } = useLiveQuery(
    db.subprojects.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = subprojects.length !== subprojectsUnfiltered.length

  // get projects.subproject_name_plural to name the table
  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const namePlural = project?.subproject_name_plural ?? 'Subprojects'
  const nameSingular = project?.subproject_name_singular ?? 'Subproject'
  const nameSingularLower = nameSingular.toLowerCase()

  const add = useCallback(async () => {
    const data = await createSubproject({ db, project_id })
    await db.subprojects.create({ data })
    Navigate(`/data/projects/${project_id}/subprojects/${data.subproject_id}`)
  }, [Navigate, db, project_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`${namePlural} (${
          isFiltered
            ? `${subprojects.length}/${subprojectsUnfiltered.length}`
            : subprojects.length
        })`}
        addRow={add}
        tableName={nameSingularLower}
        menus={[
          <FilterButton
            key="filter_subprojects"
            table="subprojects"
            filterField="filter_subprojects"
          />,
        ]}
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
}
