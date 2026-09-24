import { useId } from 'react'
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
import { useLiveQuery } from '@electric-sql/pglite-react'

import { formatNumber } from '../../../modules/formatNumber.ts'
import type Units from '../../../models/public/Units.ts'
import type Charts from '../../../models/public/Charts.ts'
import type { ChartData, ChartSeries } from './buildData/index.ts'

const toPercent = (decimal: number) => `${(decimal * 100).toFixed(0)}%`

// fallback colors for series (and series groups) without own colors,
// large enough that repeats are rare
const palette = [
  '#1976d2',
  '#ef6c00',
  '#388e3c',
  '#d32f2f',
  '#7b1fa2',
  '#00796b',
  '#fbc02d',
  '#5d4037',
  '#c2185b',
  '#303f9f',
  '#7cb342',
  '#8d6e63',
  '#0288d1',
  '#e64a19',
  '#689f38',
  '#ad1457',
]

interface Props {
  chart: Charts
  series: ChartSeries[]
  data: ChartData['data']
  synchronized?: boolean
}

export const SingleChart = ({ chart, series, data, synchronized }: Props) => {
  const gradientPrefix = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const res = useLiveQuery(`SELECT * FROM units WHERE unit_id = $1`, [
    series?.[0]?.subject.value_unit ?? '99999999-9999-9999-9999-999999999999',
  ])
  const firstSubjectsUnit = res?.rows?.[0] as Units | undefined
  if (!chart || !series) return null

  const unit = firstSubjectsUnit ?? 'Count'

  return (
    <ResponsiveContainer
      width="99%"
      height={synchronized ? 200 : 400}
    >
      <AreaChart
        width={600}
        height={300}
        data={data}
        syncId={synchronized ? chart.chart_id : undefined}
        stackOffset={chart.percent ? 'expand' : undefined}
        margin={{ top: 10, right: 10, left: 20 }}
      >
        <defs>
          {series.map((singleSeries, index) => {
            if (!singleSeries.subject.fill_graded) return null
            const color =
              singleSeries.subject.stroke ?? palette[index % palette.length]
            return (
              <linearGradient
                key={`${gradientPrefix}-${index}`}
                id={`${gradientPrefix}-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={color}
                  stopOpacity={0}
                />
              </linearGradient>
            )
          })}
        </defs>
        <XAxis dataKey="year" />
        <YAxis
          interval={0}
          width={40}
          label={{
            value: unit as unknown as string,
            angle: -90,
            position: 'insideLeft',
            // print is the window.print function and thus always truthy;
            // kept as a condition to preserve the original behaviour
            offset: typeof print === 'function' ? 0 : -15,
          }}
          tickFormatter={
            chart.percent
              ? toPercent
              : (formatNumber as (value: unknown, index: number) => string)
          }
        />
        {series.map((singleSeries, index) => {
          const color =
            singleSeries.color ??
            singleSeries.subject.stroke ??
            palette[index % palette.length]
          return (
            <Area
              key={singleSeries.key}
              type={singleSeries.subject.type ?? 'monotone'} // or: linear
              dataKey={singleSeries.key}
              name={singleSeries.label}
              stackId={
                chart.subjects_stacked || chart.percent ? '1' : undefined
              }
              stroke={color}
              strokeWidth={2}
              fill={
                singleSeries.subject.fill_graded ?
                  `url(#${gradientPrefix}-${index})`
                : (singleSeries.color ?? singleSeries.subject.fill ?? color)
              }
              isAnimationActive={true} // false for print?
              dot={{ stroke: color, strokeWidth: 3 }}
              activeDot={{
                stroke: color,
                strokeWidth: 2,
                r: 6,
              }}
              connectNulls={singleSeries.subject.connect_nulls ?? false}
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
