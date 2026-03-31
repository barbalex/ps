import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { ListValuesNode } from './ListValues.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ListNode = ({ projectId, nav, level = 4 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const projectRes = useLiveQuery(
    `SELECT list_values_in_list FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const listValuesInList = projectRes?.rows?.[0]?.list_values_in_list !== false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = ['data', 'projects', projectId, 'lists']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }

  if (listValuesInList) {
    const listFormArray = [...ownArray, 'list']
    const listFormUrl = `${ownUrl}/list`
    return (
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isInActiveNodeArray={listFormArray.every((part, i) => urlPath[i] === part)}
        isActive={isEqual(urlPath, listFormArray)}
        childrenCount={0}
        to={listFormUrl}
      />
    )
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
        childrenCount={2}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <Node
            label={formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' })}
            level={level + 1}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'list'
            }
            isActive={isEqual(urlPath, [...ownArray, 'list'])}
            to={`${ownUrl}/list`}
          />
          <ListValuesNode projectId={projectId} listId={nav.id} />
        </>
      )}
    </>
  )
}
