import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'
import { FieldsNode } from './Fields.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useAtom } from 'jotai'
import { treeOpenNodesAtom } from '../../store.ts'
import { useLiveQuery } from '@electric-sql/pglite-react'

type Props = {
  nav: { id: string; label: string }
  level?: number
  userId?: string
}

export const AccountNode = ({ nav, level = 2, userId }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = userId
    ? ['data', 'users', userId, 'accounts', nav.id]
    : ['data', 'accounts', nav.id]
  const ownUrl = `/${ownArray.join('/')}`
  const parentUrl = userId ? `/data/users/${userId}/accounts` : '/data/users'

  const res = useLiveQuery(
    `SELECT project_fields_in_account FROM accounts WHERE account_id = $1`,
    [nav.id],
  )
  const showFieldsNav = res?.rows?.[0]?.project_fields_in_account === false

  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray, isRoot: true })
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    addOpenNodes({ nodes: [ownArray] })
  }

  return (
    <>
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={showFieldsNav ? 1 : 0}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && showFieldsNav && <FieldsNode accountId={nav.id} userId={userId} />}
    </>
  )
}
