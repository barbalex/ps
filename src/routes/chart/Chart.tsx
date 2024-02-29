import { memo } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'

export const Chart = memo(() => {
  const { chart_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.charts.liveUnique({
      where: { chart_id },
      include: { chart_subjects: true },
    }),
  )

  console.log('hello Chart', { row, chart_id })

  return <div>Chart</div>
})
