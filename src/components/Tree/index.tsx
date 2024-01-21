import { ProjectsNode } from './Projects'
import { UsersNode } from './Users'
import { AccountsNode } from './Accounts'
import { FieldTypesNode } from './FieldTypes'
import { WidgetTypesNode } from './WidgetTypes'
import { WidgetsForFieldsNode } from './WidgetsForFields'
import { FieldsNode } from './Fields'
import { FilesNode } from './Files'
import { MessagesNode } from './messages'

export const Tree = () => {
  return (
    <>
      <ProjectsNode />
      <UsersNode />
      <AccountsNode />
      <FieldTypesNode />
      <WidgetTypesNode />
      <WidgetsForFieldsNode />
      <FieldsNode />
      <FilesNode />
      <MessagesNode />
    </>
  )
}
