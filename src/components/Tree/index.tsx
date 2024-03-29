import { memo } from 'react'

import { ProjectsNode } from './Projects'
import { UsersNode } from './Users'
import { AccountsNode } from './Accounts'
import { FieldTypesNode } from './FieldTypes'
import { WidgetTypesNode } from './WidgetTypes'
import { WidgetsForFieldsNode } from './WidgetsForFields'
import { FieldsNode } from './Fields'
import { MessagesNode } from './Messages'

const containerStyle = {
  height: '100%',
  width: '100%',
  overflow: 'auto',
  scrollbarWidth: 'thin',
}

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
      </>
    )}
    <MessagesNode />
  </div>
))
