import { useNavigate, useParams } from '@tanstack/react-router'

import { createAccount } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useAccountsNavData } from '../modules/useAccountsNavData.ts'
import '../form.css'

export const Accounts = ({ hideHeader = false }: { hideHeader?: boolean } = {}) => {
  const { userId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useAccountsNavData({ userId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createAccount({ userId })
    if (!id) return
    navigate({ to: `/data/users/${userId}/accounts/${id}` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
          menus={<FilterButton isFiltered={isFiltered} />}
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={`/data/users/${userId}/accounts/${id}`}
            />
          ))
        )}
      </div>
    </div>
  )
}
