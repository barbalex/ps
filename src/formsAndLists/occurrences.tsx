import { memo } from 'react'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useOccurrencesNavData } from '../modules/useOccurrencesNavData.ts'

import '../form.css'

export const Occurrences = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    isToAssess = false,
    isAssigned = false,
    isNotToAssign = false,
  }) => {
    const { loading, navData } = useOccurrencesNavData({
      projectId,
      subprojectId,
      placeId,
      placeId2,
      isToAssess,
      isAssigned,
      isNotToAssign,
    })
    const { navs, label, nameSingular } = navData

    return (
      <div className="list-view">
        <ListHeader
          label={label}
          nameSingular={nameSingular}
        />
        <div className="list-container">
          {loading ?
            <Loading />
          : <>
              {navs.map(({ occurrence_id, label }) => (
                <Row
                  key={occurrence_id}
                  label={label ?? occurrence_id}
                  to={occurrence_id}
                />
              ))}
            </>
          }
        </div>
      </div>
    )
  },
)
