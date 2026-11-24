import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { MdMenuBook } from 'react-icons/md'

const { Button } = fluentUiReactComponents

import { createUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

export const Header = ({ autoFocusRef }: { autoFocusRef?: React.RefObject<HTMLInputElement | null> }) => {
  const { formatMessage } = useIntl()
  const { userId } = useParams({ strict: false })
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()

  const db = usePGlite()

  // Keep a ref to the current userId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const userIdRef = useRef(userId)
  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  const addRow = async () => {
    const id = await createUser()
    if (!id) return

    navigate({ to: `../${id}` })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'users',
      rowIdName: 'user_id',
      rowId: userId!,
      navigateTo: '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(`SELECT user_id FROM users order by label`)
      const rows = res?.rows as { user_id: string }[]
      const len = rows.length
      const index = rows.findIndex((p) => p.user_id === userIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({ to: `../${next.user_id}` })
    } catch (error) {
      console.error('Error navigating to next user:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(`SELECT user_id FROM users order by label`)
      const rows = res?.rows as { user_id: string }[]
      const len = rows.length
      const index = rows.findIndex((p) => p.user_id === userIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({ to: `../${previous.user_id}` })
    } catch (error) {
      console.error('Error navigating to previous user:', error)
    }
  }

  const openDocs = () =>
    window.open('/docs/user-roles', '_blank', 'noreferrer')

  return (
    <FormHeader
      title={formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="user"
      siblings={
        <Button
          icon={<MdMenuBook />}
          title={formatMessage({
            id: 'user.openDocs',
            defaultMessage: 'Dokumentation öffnen',
          })}
          onClick={openDocs}
        />
      }
    />
  )
}
