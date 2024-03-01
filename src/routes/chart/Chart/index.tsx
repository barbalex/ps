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
  Legend,
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

const titleRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
  fontWeight: 'bold',
}

export const Chart = memo(() => {
  const { subproject_id, chart_id } = useParams()

  const { db } = useElectric()!
  const { results: chart } = useLiveQuery(
    db.charts.liveUnique({
      where: { chart_id },
      // include: { chart_subjects: true }, // NOT WORKING due to boolean value in subjects...
    }),
  )
  console.log('hello Chart, chart:', chart)
  const { results: subjects } = useLiveQuery(
    db.chart_subjects.liveMany({
      where: { chart_id, deleted: false },
    }),
  )
  console.log('hello Chart, subjects:', subjects)

  const [data, setData] = useState({ data: [], names: [] })

  useEffect(() => {
    if (!subjects) return
    const run = async () => {
      const data = await dataFromChart({ db, subjects, subproject_id })
      setData(data)
    }
    run()
  }, [db, subjects, subproject_id])

  const unit = 'TODO: unit'

  if (!chart || !subjects) return null

  return (
    <>
      <div style={titleRowStyle}>{chart.title}</div>
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
          {subjects.map((subject) => {
            return (
              <Area
                key={subject.chart_subject_id}
                type="linear"
                dataKey={subject.name}
                // stackId="1" set to stack
                stroke={subject.stroke ?? 'red'}
                strokeWidth={2}
                fill={subject.fill ?? 'yellow'}
                isAnimationActive={true} // false for print?
                dot={{ stroke: subject.stroke ?? 'red', strokeWidth: 3 }}
                activeDot={{
                  stroke: subject.stroke ?? 'red',
                  strokeWidth: 2,
                  r: 6,
                }}
                connectNulls={subject.connect_nulls ?? false}
              />
            )
          })}
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <Legend verticalAlign="bottom" height={36} />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
})
