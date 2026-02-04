import { useParams, useNavigate } from '@tanstack/react-router'

import { createGoal } from '../modules/createRows.ts'
import { useGoalsNavData } from '../modules/useGoalsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/goals/'

export const Goals = () => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useGoalsNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createGoal({ projectId, subprojectId })
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
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={id}
            />
          ))
        }
      </div>
    </div>
  )
}
