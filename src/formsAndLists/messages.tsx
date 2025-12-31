import { useNavigate } from '@tanstack/react-router'

import { createMessage } from '../modules/createRows.ts'
import { useMessagesNavData } from '../modules/useMessagesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Messages = () => {
  const navigate = useNavigate()

  const { loading, navData } = useMessagesNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createMessage()
    if (!id) return
    navigate({
      to: `/data/messages/${id}`,
      params: (prev) => ({ ...prev, messageId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map(({ id, date }) => (
              <Row key={id} to={id} label={date?.toISOString?.() ?? id} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
