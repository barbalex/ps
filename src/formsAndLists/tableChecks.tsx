import { useParams, useNavigate } from '@tanstack/react-router'

import { createCheck } from '../modules/createRows.ts'
import { useTableChecksNavData } from '../modules/useTableChecksNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const TableChecks = ({ from }: { from: string }) => {
  const { projectId, subprojectId, placeId, placeId2, tableViewId } =
    useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useTableChecksNavData({
    projectId: projectId!,
    subprojectId: subprojectId!,
    placeId: placeId!,
    placeId2,
    tableViewId: tableViewId!,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createCheck({
      projectId: projectId!,
      placeId: (placeId2 ?? placeId)!,
      tableViewId: tableViewId!,
    })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, checkId: id }),
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
              table="checks"
              level={placeId2 ? 2 : 1}
              from={from}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={id} />
          ))
        )}
      </div>
    </div>
  )
}
