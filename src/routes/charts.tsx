import { useCallback, useMemo, memo } from 'react'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useAtom } from 'jotai'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createChart } from '../modules/createRows.ts'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

import { designingAtom } from '../store.ts'

export const Component = memo(() => {
  const [designing] = useAtom(designingAtom)
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { hKey, hValue } = useMemo(() => {
    if (place_id2) {
      return { hKey: 'place_id2', hValue: place_id2 }
    } else if (place_id) {
      return { hKey: 'place_id', hValue: place_id }
    } else if (subproject_id) {
      return { hKey: 'subproject_id', hValue: subproject_id }
    } else if (project_id) {
      return { hKey: 'project_id', hValue: project_id }
    }
    return where
  }, [place_id, place_id2, project_id, subproject_id])

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM charts WHERE ${hKey} = $1 ORDER BY label ASC`,
    [hValue],
    'chart_id',
  )
  const isLoading = res === undefined
  const charts = res?.rows ?? []

  const add = useCallback(async () => {
    const idToAdd = place_id2
      ? { place_id2 }
      : place_id
      ? { place_id }
      : subproject_id
      ? { subproject_id }
      : { project_id }
    const res = await createChart({ ...idToAdd, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ pathname: data.chart_id, search: searchParams.toString() })
  }, [
    db,
    navigate,
    place_id,
    place_id2,
    project_id,
    searchParams,
    subproject_id,
  ])

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
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {charts.map(({ chart_id, label }) => (
              <Row
                key={chart_id}
                label={label ?? chart_id}
                to={chart_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
