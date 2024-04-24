import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

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

  const { db } = useElectric()!
  // get occurrence_imports by subproject_id
  const { results: occurrence_imports = [] } = useLiveQuery(
    db.occurrence_imports.liveMany({
      where: { subproject_id },
    }),
  )
  const where = {
    occurrence_import_id: {
      in: occurrence_imports.map((o) => o.occurrence_import_id),
    },
  }
  if (isAssigned) {
    where.place_id = place_id2 ?? place_id
  }
  if (isToAssess) {
  // two of these three do not work, see: https://discord.com/channels/933657521581858818/1229057284395503817/1229057284395503817
    where.OR = [{ not_to_assign: null }, { not_to_assign: false }]
    // where.NOT = [{ not_to_assign: true }] // this does not work
    // where.not_to_assign = { NOT: true } // this does not work
    where.place_id = null
  }
  if (isNotToAssign) {
    where.not_to_assign = true
    where.place_id = null
  }
  const { results: occurrences = [] } = useLiveQuery(
    db.occurrences.liveMany({
      where,
      orderBy: { label: 'asc' },
      include: { occurrence_imports: true },
    }),
  )

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
  //   where,
  // })

  return (
    <div className="list-view">
      <ListViewHeader title={title} tableName="occurrence" />
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
