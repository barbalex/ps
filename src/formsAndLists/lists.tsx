import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createList } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { listsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/lists/'

export const Lists = memo(() => {
  const [filter] = useAtom(listsFilterAtom)
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      list_id, 
      label 
    FROM lists 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`,
    [projectId],
    'list_id',
  )
  const isLoading = res === undefined
  const lists = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createList({ db, projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.list_id,
      params: (prev) => ({ ...prev, listId: data.list_id }),
    })
  }, [db, navigate, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Lists"
        nameSingular="list"
        tableName="lists"
        isFiltered={isFiltered}
        countFiltered={lists.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {lists.map(({ list_id, label }) => (
              <Row
                key={list_id}
                to={list_id}
                label={label ?? list_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
