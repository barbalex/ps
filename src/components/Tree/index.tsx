import { useAtom } from 'jotai'

import { ProjectsNode } from './Projects.tsx'
import { UsersNode } from './Users.tsx'
import { AccountsNode } from './Accounts.tsx'
import { FieldTypesNode } from './FieldTypes.tsx'
import { WidgetTypesNode } from './WidgetTypes.tsx'
import { WidgetsForFieldsNode } from './WidgetsForFields.tsx'
import { QcsNode } from './Qcs.tsx'
import { RootQcsNode } from './RootQcs.tsx'
import { RootQcsRunNode } from './RootQcsRun.tsx'
import { FieldsNode } from './Fields.tsx'
import { MessagesNode } from './Messages.tsx'
import { CrssNode } from './Crss.tsx'
import { designingAtom } from '../../store.ts'
import styles from './index.module.css'

// so query it here once and pass it down
export const Tree = () => {
  const [designing] = useAtom(designingAtom)

  return (
    <div className={`${styles.container} no-print`}>
      <ProjectsNode />
      <AccountsNode />
      {designing && (
        <>
          <UsersNode />
          <FieldTypesNode />
          <WidgetTypesNode />
          <FieldsNode />
          <WidgetsForFieldsNode />
          {/* TODO: restrict editing to app administrator once auth supports it */}
          <QcsNode />
          <RootQcsNode />
          <RootQcsRunNode />
          <CrssNode />
        </>
      )}
      <MessagesNode />
    </div>
  )
}
