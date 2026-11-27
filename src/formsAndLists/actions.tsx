import { useParams, useNavigate } from '@tanstack/react-router'

import { createAction } from '../modules/createRows.ts'
import { useRequestRowDelete } from '../modules/deleteRow.ts'
import { useActionsNavData } from '../modules/useActionsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { GeometryListTools } from '../components/shared/GeometryImport.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Actions = ({ from }: { from: string }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useActionsNavData({
    projectId: projectId!,    subprojectId: subprojectId!,    placeId: placeId!,    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const requestDelete = useRequestRowDelete()

  const add = async () => {
    const id = await createAction({
      projectId: projectId!,      placeId: (placeId2 ?? placeId)!,    })
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
            <LayerMenu table="actions" level={placeId2 ? 2 : 1} from={from} />
            <FilterButton isFiltered={isFiltered} />
            <GeometryListTools table="actions" rowIds={navs.map((row) => row.id)} />
          </>
        }
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={id}
              onDelete={() =>
                requestDelete({ table: 'actions', rowIdName: 'action_id', rowId: id })
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
