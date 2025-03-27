import { useCallback, useMemo, memo } from 'react'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createChart } from '../modules/createRows.ts'
import { Loading } from '../components/shared/Loading.tsx'
import { designingAtom } from '../store.ts'

import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/'

export const Charts = memo(() => {
  const [designing] = useAtom(designingAtom)
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const { hKey, hValue } = useMemo(() => {
    if (placeId2) {
      return { hKey: 'place_id2', hValue: placeId2 }
    } else if (placeId) {
      return { hKey: 'place_id', hValue: placeId }
    } else if (subprojectId) {
      return { hKey: 'subproject_id', hValue: subprojectId }
    } else if (projectId) {
      return { hKey: 'project_id', hValue: projectId }
    }
    return where
  }, [placeId, placeId2, projectId, subprojectId])

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM charts WHERE ${hKey} = $1 ORDER BY label`,
    [hValue],
    'chart_id',
  )
  const isLoading = res === undefined
  const charts = res?.rows ?? []

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
  }, [db, navigate, placeId, placeId2, projectId, subprojectId])

  // console.log('charts', charts)

  // TODO: get uploader css locally if it should be possible to upload charts
  // offline to sqlite
  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Charts"
        nameSingular="chart"
        tableName="charts"
        isFiltered={false}
        countFiltered={charts.length}
        isLoading={isLoading}
        addRow={designing ? add : undefined}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {charts.map(({ chart_id, label }) => (
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
