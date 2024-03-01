import { memo } from 'react'
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

const formatNumber = (tickItem) => {
  const value =
    tickItem && tickItem?.toLocaleString
      ? tickItem.toLocaleString('de-ch')
      : null
  return value
}

export const SingleChart = memo(({ chart, subjects, data, synchronized }) => {
  const unit = 'TODO: unit'

  if (!chart || !subjects) return null

  return (
    <ResponsiveContainer width="99%" height={synchronized ? 200 : 400}>
      <AreaChart
        width={600}
        height={300}
        data={data.data}
        syncId={synchronized ? chart.chart_id : undefined}
        margin={{ top: 10, right: 10, left: 27 }}
      >
        <defs>
          {subjects.map((subject) =>
            subject.fill_graded ? (
              <linearGradient
                key={`${subject.chart_subject_id}color`}
                id={`${subject.chart_subject_id}color`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={subject.fill} stopOpacity={0.8} />
                <stop offset="95%" stopColor={subject.fill} stopOpacity={0} />
              </linearGradient>
            ) : (
              // this is needed for gradient to work without missing key warning
              <div key={`${subject.chart_subject_id}div`} />
            ),
          )}
        </defs>
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
              id={`${subject.chart_subject_id}color`}
              type={subject.type ?? 'monotone'} // or: linear
              dataKey={subject.name}
              stackId={chart.subjects_stacked ? '1' : undefined}
              stroke={subject.stroke ?? 'red'}
              strokeWidth={2}
              fill={
                subject.fill_graded
                  ? `url(#${subject.chart_subject_id}color)`
                  : subject.fill ?? 'yellow'
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
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <Legend verticalAlign="bottom" height={36} />
      </AreaChart>
    </ResponsiveContainer>
  )
})
