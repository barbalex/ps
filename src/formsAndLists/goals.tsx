import { useParams, useNavigate } from '@tanstack/react-router'

import { createGoal } from '../modules/createRows.ts'
import { useRequestRowDelete } from '../modules/deleteRow.ts'
import { useGoalsNavData } from '../modules/useGoalsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'


export const Goals = () => {
  const { projectId, subprojectId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useGoalsNavData({
    projectId: projectId!,    subprojectId: subprojectId!,  })
  const { navs, label, nameSingular } = navData

  const requestDelete = useRequestRowDelete()

  const add = async () => {
    const id = await createGoal({
      projectId: projectId!,
      subprojectId: subprojectId!,
    })
   if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, goalId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : (navs as { id: string; label: string | null }[]).map(
            ({ id, label }) => (
              <Row
                key={id}
                label={label ?? id}
                to={id}
                onDelete={() =>
                  requestDelete({ table: 'goals', rowIdName: 'goal_id', rowId: id })
                }
              />
            ),
          )
        }
      </div>
    </div>
  )
}
