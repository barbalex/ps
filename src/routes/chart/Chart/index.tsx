import { memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { dataFromChart } from './dataFromChart'
import { SingleChart } from './Chart'

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
  // console.log('hello Chart, chart:', chart)
  const { results: subjects } = useLiveQuery(
    db.chart_subjects.liveMany({
      where: { chart_id, deleted: false },
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
    }),
  )
  // console.log('hello Chart, subjects:', subjects)

  const [data, setData] = useState({ data: [], names: [] })

  useEffect(() => {
    if (!subjects) return
    const run = async () => {
      const data = await dataFromChart({ db, subjects, subproject_id })
      setData(data)
    }
    run()
  }, [db, subjects, subproject_id])

  if (!chart || !subjects) return null

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
