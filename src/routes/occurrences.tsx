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
  const isToAssess = pathname.includes('to-assess')
  const isNotToAssign = pathname.includes('not-to-assign')
  const title = isToAssess
    ? 'Occurrences to assess'
    : 'Occurrences not to assign'

  const { subproject_id } = useParams()

  const { db } = useElectric()!
  // TODO: get occurrence_import by subproject_id
  const { results: occurrence_imports = [] } = useLiveQuery(
    db.occurrence_imports.liveMany({
      where: { subproject_id },
    }),
  )
  const where = {
    occurrence_import_id: {
      in: occurrence_imports.map((o) => o.occurrence_import_id),
    },
    place_id: null,
  }
  if (isToAssess) where.not_to_assign = null
  // these three do not work, see: https://discord.com/channels/933657521581858818/1229057284395503817/1229057284395503817
  // if (isToAssess) where.or = [{ not_to_assign: null }, { not_to_assign: false }]
  // if (isToAssess) where.not_to_assign = { not: true }
  // if (isToAssess) where.not = [{ not_to_assign: true }]
  if (isNotToAssign) where.not_to_assign = true
  const { results: occurrences = [] } = useLiveQuery(
    db.occurrences.liveMany({
      where,
      orderBy: { label: 'asc' },
      include: { occurrence_imports: true },
    }),
  )

  return (
    <div className="list-view">
      <ListViewHeader title={title} tableName="occurrence" />
      <div className="list-container">
        {occurrences.map(({ occurrence_id, label }) => (
          <Row key={occurrence_id} label={label} to={occurrence_id} />
        ))}
      </div>
    </div>
  )
})
