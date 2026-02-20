import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

import { createUser } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useUsersNavData } from '../modules/useUsersNavData.ts'
import { userIdAtom } from '../store.ts'

import '../form.css'

const from = 'data/users'

export const Users = () => {
  const setUserId = useSetAtom(userIdAtom)
  const navigate = useNavigate({ from })

  const { loading, navData, isFiltered } = useUsersNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createUser({ setUserId })
    if (!id) return
    navigate({ to: id })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={id} />
          ))
        )}
      </div>
    </div>
  )
}
