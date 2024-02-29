import { memo } from 'react'
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
    exists(tickItem) && tickItem?.toLocaleString
      ? tickItem.toLocaleString('de-ch')
      : null
  return value
}

export const Chart = memo(() => {
  const { chart_id } = useParams()

  const { db } = useElectric()!
  const { results: chart } = useLiveQuery(
    db.charts.liveUnique({
      where: { chart_id },
      include: { chart_subjects: true },
    }),
  )

  console.log('hello Chart, chart:', chart)
  const unit = 'TODO: unit'
  const data = []

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
          <XAxis dataKey="jahr" />
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
          {data.reverse().map((id) => {
            return (
              <Area
                key={id}
                type="linear"
                dataKey={id}
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
