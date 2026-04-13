import { useNavigate, useParams } from '@tanstack/react-router'

import { createAccount } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useAccountsNavData } from '../modules/useAccountsNavData.ts'
import '../form.css'

const from = '/data/users/$userId_/accounts'

export const Accounts = () => {
  const { userId } = useParams({ from })
  const navigate = useNavigate({ from })

  const { loading, navData, isFiltered } = useAccountsNavData({ userId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createAccount({ userId })
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
          navs.map(({ id, label }) => <Row key={id} label={label ?? id} to={id} />)
        )}
      </div>
    </div>
  )
}
