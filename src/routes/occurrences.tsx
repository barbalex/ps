import { memo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'

import '../form.css'

export const Component = memo(() => {
  // get pathname from location
  const { pathname } = useLocation()
  const isAssigned = pathname.includes('occurrences-assigned')
  const isToAssess = pathname.includes('occurrences-to-assess')
  const isNotToAssign = pathname.includes('occurrences-not-to-assign')
  const title = isAssigned
    ? 'Occurrences assigned'
    : isToAssess
    ? 'Occurrences to assess'
    : 'Occurrences not to assign'

  const { subproject_id, place_id, place_id2 } = useParams()

  let filter = `oi.subproject_id = '${subproject_id}'`
  if (isAssigned) {
    filter += ` AND o.place_id = '${place_id2 ?? place_id}'`
  }
  if (isToAssess) {
    filter += ' AND o.not_to_assign is not true AND o.place_id is null'
  }
  if (isNotToAssign) {
    filter += ' AND o.not_to_assign is true AND o.place_id is null'
  }
  const result = useLiveIncrementalQuery(
    `
    SELECT 
      o.occurrence_id, 
      o.label 
    FROM occurrences o 
      inner join occurrence_imports oi on o.occurrence_import_id = oi.occurrence_import_id 
    WHERE ${filter} 
    ORDER BY label ASC`,
    undefined,
    'occurrence_id',
  )
  const occurrences = result?.rows ?? []

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
      />
      <div className="list-container">
        {occurrences.map(({ occurrence_id, label }) => (
          <Row
            key={occurrence_id}
            label={label ?? occurrence_id}
            to={occurrence_id}
          />
        ))}
      </div>
    </div>
  )
})
