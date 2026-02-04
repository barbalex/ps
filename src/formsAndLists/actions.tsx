import { useParams, useNavigate } from '@tanstack/react-router'

import { createAction } from '../modules/createRows.ts'
import { useActionsNavData } from '../modules/useActionsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Actions = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useActionsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createAction({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, actionId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="actions"
              level={placeId2 ? 2 : 1}
              //TODO: from={from}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
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
