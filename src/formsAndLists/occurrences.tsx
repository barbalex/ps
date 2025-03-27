import { memo } from 'react'
import { useParams } from '@tanstack/react-router'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Occurrences = memo(
  ({ isToAssess, isAssigned, isNotToAssign, from }) => {
    const title =
      isAssigned ? 'Occurrences assigned'
      : isToAssess ? 'Occurrences to assess'
      : 'Occurrences not to assign'

    const { subprojectId, placeId, placeId2 } = useParams({ from })

    let filter = `oi.subproject_id = '${subprojectId}'`
    if (isAssigned) {
      filter += ` AND o.place_id = '${placeId2 ?? placeId}'`
    }
    if (isToAssess) {
      filter += ' AND o.not_to_assign IS NOT TRUE AND o.place_id IS NULL'
    }
    if (isNotToAssign) {
      filter += ' AND o.not_to_assign IS TRUE AND o.place_id IS NULL'
    }
    const res = useLiveIncrementalQuery(
      `
    SELECT 
      o.occurrence_id, 
      o.label 
    FROM occurrences o 
      INNER JOIN occurrence_imports oi on o.occurrence_import_id = oi.occurrence_import_id 
    WHERE ${filter} 
    ORDER BY label`,
      undefined,
      'occurrence_id',
    )
    const isLoading = res === undefined
    const occurrences = res?.rows ?? []

    // console.log('hello occurrences', {
    //   isAssigned,
    //   isToAssess,
    //   isNotToAssign,
    //   title,
    //   subproject_id,
    //   place_id,
    //   place_id2,
    //   occurrence_imports,
    //   occurrences,
    //   filter,
    // })

    return (
      <div className="list-view">
        <ListViewHeader
          namePlural={title}
          nameSingular="occurrence"
          isFiltered={false}
          countFiltered={occurrences.length}
          isLoading={isLoading}
        />
        <div className="list-container">
          {isLoading ?
            <Loading />
          : <>
              {occurrences.map(({ occurrence_id, label }) => (
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
