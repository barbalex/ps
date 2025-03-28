import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createMessage } from '../modules/createRows.ts'
import { useMessagesNavData } from '../modules/useMessagesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Messages = memo(() => {
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useMessagesNavData()
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createMessage({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: `/data/messages/${data.message_id}`,
      params: (prev) => ({ ...prev, messageId: data.message_id }),
    })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ message_id, date }) => (
              <Row
                key={message_id}
                to={message_id}
                label={date ?? message_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
