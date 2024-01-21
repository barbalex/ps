import { ProjectsNode } from './Projects'
import { UsersNode } from './Users'
import { AccountsNode } from './Accounts'
import { FieldTypesNode } from './FieldTypes'
import { WidgetTypesNode } from './WidgetTypes'

export const Tree = () => {
  return (
    <>
      <ProjectsNode />
      <UsersNode />
      <AccountsNode />
      <FieldTypesNode />
      <WidgetTypesNode />
    </>
  )
}
