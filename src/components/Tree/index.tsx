import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'
import { ProjectsNode } from './Projects.tsx'
import { UsersNode } from './Users.tsx'
import { AccountsNode } from './Accounts.tsx'
import { FieldTypesNode } from './FieldTypes.tsx'
import { WidgetTypesNode } from './WidgetTypes.tsx'
import { WidgetsForFieldsNode } from './WidgetsForFields.tsx'
import { FieldsNode } from './Fields.tsx'
import { MessagesNode } from './Messages.tsx'

const containerStyle = {
  height: '100%',
  width: '100%',
  overflow: 'auto',
  scrollbarWidth: 'thin',
  // do not layout offscreen content while allowing search
  contain: 'paint layout style',
}

// all nodes need app_states.tree_open_nodes
// all nodes will rerender when app_states.tree_open_nodes changes
// so query it here once and pass it down
export const Tree = memo(({ designing }) => {
  const { user: authUser } = useCorbado()
  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const openNodes = appState?.tree_open_nodes || []
  console.log('hello Tree, openNodes:', openNodes)

  return (
    <div style={containerStyle}>
      <ProjectsNode openNodes={openNodes} userEmail={authUser?.email} />
      <UsersNode openNodes={openNodes} userEmail={authUser?.email} />
      <AccountsNode openNodes={openNodes} userEmail={authUser?.email} />
      {designing && (
        <>
          <FieldTypesNode openNodes={openNodes} userEmail={authUser?.email} />
          <WidgetTypesNode openNodes={openNodes} userEmail={authUser?.email} />
          <WidgetsForFieldsNode
            openNodes={openNodes}
            userEmail={authUser?.email}
          />
          <FieldsNode openNodes={openNodes} userEmail={authUser?.email} />
        </>
      )}
      <MessagesNode openNodes={openNodes} userEmail={authUser?.email} />
    </div>
  )
})
