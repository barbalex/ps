import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { AccountsNode } from './Accounts.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const UserNode = ({ nav, level = 2 }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = ['data', 'users', nav.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray, isRoot: true })
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: ownUrl })
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
        childrenCount={1}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && <AccountsNode userId={nav.id} level={3} />}
    </>
  )
}
