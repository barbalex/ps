import { memo } from 'react'

import { ProjectsNode } from './Projects.tsx'
import { UsersNode } from './Users.tsx'
import { AccountsNode } from './Accounts.tsx'
import { FieldTypesNode } from './FieldTypes.tsx'
import { WidgetTypesNode } from './WidgetTypes.tsx'
import { WidgetsForFieldsNode } from './WidgetsForFields.tsx'
import { FieldsNode } from './Fields.tsx'
import { MessagesNode } from './Messages.tsx'
import { CrssNode } from './Crss.tsx'

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
export const Tree = memo(({ designing }) => (
  <div style={containerStyle}>
    <ProjectsNode />
    <UsersNode />
    <AccountsNode />
    {designing && (
      <>
        <FieldTypesNode />
        <WidgetTypesNode />
        <WidgetsForFieldsNode />
        <FieldsNode />
        <CrssNode />
      </>
    )}
    <MessagesNode />
  </div>
))
