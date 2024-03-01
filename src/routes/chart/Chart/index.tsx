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

import { useElectric } from '../../../ElectricProvider'
import { dataFromChart } from './dataFromChart'

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

  const [data, setData] = useState({ data: [], names: [] })

  useEffect(() => {
    if (!chart) return
    const run = async () => {
      const data = await dataFromChart({ db, chart, subproject_id })
      setData(data)
    }
    run()
  }, [chart, db, subproject_id])

  console.log('hello Chart', { chart, data })

  const unit = 'TODO: unit'

  return (
    <>
      <div>Chart</div>
      <ResponsiveContainer width="99%" height={400}>
        <AreaChart
          width={600}
          height={300}
          data={data.data}
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
          {data.names.map((name) => {
            return (
              <Area
                key={name}
                type="linear"
                dataKey={name}
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
