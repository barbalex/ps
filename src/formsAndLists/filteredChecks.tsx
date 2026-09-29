import { useParams, useNavigate } from '@tanstack/react-router'

import { createCheck } from '../modules/createRows.ts'
import { useFilteredChecksNavData } from '../modules/useFilteredChecksNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const FilteredChecks = ({ from }: { from: string }) => {
  const { projectId, subprojectId, placeId, placeId2, filteredViewId } =
    useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useFilteredChecksNavData({
    projectId: projectId!,
    subprojectId: subprojectId!,
    placeId: placeId!,
    placeId2,
    filteredViewId: filteredViewId!,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createCheck({
      projectId: projectId!,
      placeId: (placeId2 ?? placeId)!,
      filteredViewId: filteredViewId!,
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
