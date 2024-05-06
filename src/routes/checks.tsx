import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createCheck } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu'

import '../form.css'

export const Component = () => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: checks = [] } = useLiveQuery(
    db.checks.liveMany({
      where: { place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate({ pathname: data.check_id, search: searchParams.toString() })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Checks"
        addRow={add}
        tableName="check"
        menus={<LayerMenu table="checks" level={place_id2 ? 2 : 1} />}
      />
      <div className="list-container">
        {checks.map(({ check_id, label }) => (
          <Row key={check_id} label={label ?? check_id} to={check_id} />
        ))}
      </div>
    </div>
  )
}
