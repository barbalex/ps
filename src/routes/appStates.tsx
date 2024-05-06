import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  return (
    <div className="list-view">
      <ListViewHeader title="Options" tableName="option" />
      <div className="list-container">
        <Row label={appState?.label} to={`/app-state/${authUser?.email}`} />
      </div>
    </div>
  )
}
