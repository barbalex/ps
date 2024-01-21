import { ProjectsNode } from './Projects'
import { UsersNode } from './Users'
import { AccountsNode } from './Accounts'
import { FieldTypesNode } from './FieldTypes'

export const Tree = () => {
  return (
    <>
      <ProjectsNode />
      <UsersNode />
      <AccountsNode />
      <FieldTypesNode />
    </>
  )
}
