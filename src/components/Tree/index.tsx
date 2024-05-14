import { memo } from 'react'

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
  contain: 'paint layout',
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
