import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createChart } from '../modules/createRows.ts'
import { useChartsNavData } from '../modules/useChartsNavData.ts'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/'

export const Charts = memo(() => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useChartsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const idToAdd =
      placeId2 ? { placeId: placeId2 }
      : placeId ? { placeId }
      : subprojectId ? { subprojectId }
      : { projectId }
    const res = await createChart({ ...idToAdd, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.chart_id,
      params: (prev) => ({ ...prev, chartId: data.chart_id }),
    })
  }, [navigate, placeId, placeId2, projectId, subprojectId])

  // TODO: get uploader css locally if it should be possible to upload charts
  // offline to sqlite
  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ chart_id, label }) => (
              <Row
                key={chart_id}
                label={label ?? chart_id}
                to={chart_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
