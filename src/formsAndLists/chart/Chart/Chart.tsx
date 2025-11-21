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
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { formatNumber } from '../../../modules/formatNumber.ts'

const toPercent = (decimal) => `${(decimal * 100).toFixed(0)}%`

// const getPercent = (value, total) => {
//   const ratio = total > 0 ? value / total : 0

//   return toPercent(ratio, 2)
// }

export const SingleChart = ({ chart, subjects, data, synchronized }) => {
  const res = useLiveIncrementalQuery(
    `SELECT * FROM units WHERE unit_id = $1`,
    [subjects?.[0]?.value_unit ?? '99999999-9999-9999-9999-999999999999'],
    'unit_id',
  )
  const firstSubjectsUnit = res?.rows?.[0]
  if (!chart || !subjects) return null

  const unit = firstSubjectsUnit ?? 'Count'

  return (
    <ResponsiveContainer
      width="99%"
      height={synchronized ? 200 : 400}
    >
      <AreaChart
        width={600}
        height={300}
        data={data.data}
        syncId={synchronized ? chart.chart_id : undefined}
        stackOffset={chart.percent ? 'expand' : undefined}
        margin={{ top: 10, right: 10, left: 20 }}
      >
        <defs>
          {subjects.map((subject) =>
            subject.fill_graded ?
              <linearGradient
                key={`${subject.chart_subject_id}color`}
                id={`${subject.chart_subject_id}color`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={subject.fill}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={subject.fill}
                  stopOpacity={0}
                />
              </linearGradient>
              // this is needed for gradient to work without missing key warning
            : <div key={`${subject.chart_subject_id}div`} />,
          )}
        </defs>
        <XAxis dataKey="year" />
        <YAxis
          interval={0}
          width={40}
          label={{
            value: unit,
            angle: -90,
            position: 'insideLeft',
            offset: print ? 0 : -15,
          }}
          tickFormatter={chart.percent ? toPercent : formatNumber}
        />
        {subjects.map((subject) => {
          return (
            <Area
              key={subject.chart_subject_id}
              id={`${subject.chart_subject_id}color`}
              type={subject.type ?? 'monotone'} // or: linear
              dataKey={subject.name}
              stackId={
                chart.subjects_stacked || chart.percent ? '1' : undefined
              }
              stroke={subject.stroke ?? 'red'}
              strokeWidth={2}
              fill={
                subject.fill_graded ?
                  `url(#${subject.chart_subject_id}color)`
                : (subject.fill ?? 'yellow')
              }
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
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
