import { memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider.tsx'
import { buildData } from './buildData'
import { SingleChart } from './Chart'

const titleRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
  fontWeight: 'bold',
}

export const Chart = memo(() => {
  const { project_id, subproject_id, chart_id } = useParams()

  const { db } = useElectric()!
  const { results: chart } = useLiveQuery(
    db.charts.liveUnique({
      where: { chart_id },
      // include: { chart_subjects: true }, // NOT WORKING due to boolean value in subjects...
    }),
  )
  const { results: subjects } = useLiveQuery(
    db.chart_subjects.liveMany({
      where: { chart_id },
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
    }),
  )

  const [data, setData] = useState({ data: [], names: [] })

  useEffect(() => {
    if (!subjects) return
    const run = async () => {
      const data = await buildData({
        chart_id,
        db,
        chart,
        subjects,
        subproject_id,
        project_id,
      })
      setData(data)
    }
    run()
  }, [chart_id, chart, db, project_id, subjects, subproject_id])

  if (!chart || !subjects) return null

  // const typeOfChart =
  //   subjects.length === 1 && data.years.length === 1 ? 'Pie' : 'Area'

  return (
    <>
      <div style={titleRowStyle}>{chart.title}</div>
      {chart.subjects_single === true ? (
        subjects.map((subject) => (
          <SingleChart
            chart={chart}
            subjects={[subject]}
            data={data}
            synchronized={true}
          />
        ))
      ) : (
        <SingleChart chart={chart} subjects={subjects} data={data} />
      )}
    </>
  )
})
