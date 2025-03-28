import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPerson } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { usePersonsNavData } from '../modules/usePersonsNavData.ts'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/persons/'

export const Persons = memo(() => {
  const navigate = useNavigate()
  const { projectId } = useParams({ from })
  const db = usePGlite()

  const { loading, navData, isFiltered } = usePersonsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createPerson({ db, projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.person_id,
      params: (prev) => ({ ...prev, personId: data.person_id }),
    })
  }, [db, navigate, projectId])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ person_id, label }) => (
              <Row
                key={person_id}
                to={person_id}
                label={label ?? person_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
