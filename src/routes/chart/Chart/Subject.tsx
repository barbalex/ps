import { memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { Area } from 'recharts'

import { useElectric } from '../../../ElectricProvider'
import { Chart_subjects } from '../../../generated/client'

interface Props {
  subject: Chart_subjects
}

export const Chart = memo(({ subject }: Props) => {
  const { subproject_id } = useParams()

  const { db } = useElectric()!
  const tableName = subject?.table_name

  const [data, setData] = useState([])

  useEffect(() => {
    const fetch = async () => {
      switch (tableName) {
        case 'checks': {
          const places = await db.places.findMany({
            where: { subproject_id, deleted: false },
          })
          const placeIds = places.map((place) => place.place_id)
          const checks = await db.checks.findMany({
            where: { place_id: { in: placeIds }, deleted: false },
          })
          // use reduce to count checks per year
          const data = checks.reduce((acc, check) => {
            const year = check.date?.getFullYear?.()
            if (!acc[year]) acc[year] = 0
            acc[year]++

            return acc
          }, {})
          setData(
            Object.entries(data).map(([year, count]) => ({ year, count })),
          )
          break
        }
        default:
          break
      }
    }
    fetch()
  }, [subproject_id, tableName])

  return data.map((val) => (
    <Area
      key={val.year}
      type="linear"
      dataKey="count"
      stackId="1"
      stroke={'red'}
      strokeWidth={2}
      fill={'yellow'}
      isAnimationActive={true}
    />
  ))
})
