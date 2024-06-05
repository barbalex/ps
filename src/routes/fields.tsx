import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_fields?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState?.filter_fields],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { project_id: project_id ?? null, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: fieldsUnfiltered = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { project_id: project_id ?? null },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = fields.length !== fieldsUnfiltered.length

  const add = useCallback(async () => {
    const data = createField({ project_id })
    await db.fields.create({ data })
    navigate({ pathname: data.field_id, search: searchParams.toString() })
  }, [db.fields, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Fields (${
          isFiltered
            ? `${fields.length}/${fieldsUnfiltered.length}`
            : fields.length
        })`}
        addRow={add}
        tableName="field"
        menus={<FilterButton table="fields" filterField="filter_fields" />}
      />
      <div className="list-container">
        {fields.map(({ field_id, label }) => (
          <Row key={field_id} label={label ?? field_id} to={field_id} />
        ))}
      </div>
    </div>
  )
})
