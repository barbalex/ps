import { memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts'

import { useElectric } from '../../ElectricProvider'

const formatNumber = (tickItem) => {
  const value =
    tickItem && tickItem?.toLocaleString
      ? tickItem.toLocaleString('de-ch')
      : null
  return value
}

export const Chart = memo(() => {
  const { subproject_id, chart_id } = useParams()

  const { db } = useElectric()!
  const { results: chart } = useLiveQuery(
    db.charts.liveUnique({
      where: { chart_id },
      include: { chart_subjects: true },
    }),
  )
  const subject = chart?.chart_subjects[0]
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

  console.log('hello Chart', { chart, data, tableName })

  const unit = 'TODO: unit'

  return (
    <>
      <div>Chart</div>
      <ResponsiveContainer width="99%" height={400}>
        <AreaChart
          width={600}
          height={300}
          data={data}
          margin={{ top: 10, right: 10, left: 27 }}
        >
          <XAxis dataKey="year" />
          <YAxis
            interval={0}
            label={{
              value: unit,
              angle: -90,
              position: 'insideLeft',
              offset: print ? 0 : -15,
            }}
            tickFormatter={formatNumber}
          />
          {data.map((val) => {
            return (
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
            )
          })}
          <Tooltip content={<div>TODO:</div>} />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
})
