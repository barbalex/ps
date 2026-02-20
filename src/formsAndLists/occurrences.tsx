import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useOccurrencesNavData } from '../modules/useOccurrencesNavData.ts'

import '../form.css'

export const Occurrences = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  isToAssess = false,
  isNotToAssign = false,
}) => {
  const { loading, navData, isFiltered } = useOccurrencesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    isToAssess,
    isNotToAssign,
  })
  const { navs, label, nameSingular } = navData

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        menus={
          isToAssess || isNotToAssign ? (
            <FilterButton isFiltered={isFiltered} />
          ) : undefined
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
