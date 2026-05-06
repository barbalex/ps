import { useAtom, useAtomValue } from 'jotai'

import { ProjectsNode } from './Projects.tsx'
import { UsersNode } from './Users.tsx'
import { FieldTypesNode } from './FieldTypes.tsx'
import { WidgetTypesNode } from './WidgetTypes.tsx'
import { WidgetsForFieldsNode } from './WidgetsForFields.tsx'
import { QcsNode } from './Qcs.tsx'
import { RootQcsNode } from './RootQcs.tsx'
import { RootQcsRunNode } from './RootQcsRun.tsx'
import { RootExportsNode } from './RootExports.tsx'
import { RootExportsRunNode } from './RootExportsRun.tsx'
import { MessagesNode } from './Messages.tsx'
import { CrssNode } from './Crss.tsx'
import { QueuedOperationsNode } from './QueuedOperations.tsx'
import { designingAtom, isAppAmin, operationsQueueAtom } from '../../store.ts'
import styles from './index.module.css'

// so query it here once and pass it down
export const Tree = () => {
  const [designing] = useAtom(designingAtom)
  const [isAppAdmin] = useAtom(isAppAmin)
  const operationsQueue = useAtomValue(operationsQueueAtom)

  return (
    <div className={`${styles.container} no-print`}>
      <ProjectsNode />
      <UsersNode />
      {designing && (
        <>
          {isAppAdmin && (
            <>
              <FieldTypesNode />
              <WidgetTypesNode />
              <WidgetsForFieldsNode />
            </>
          )}
          {/* TODO: restrict editing to app administrator once auth supports it */}
          <QcsNode />
          <RootQcsNode />
          <RootQcsRunNode />
          <RootExportsNode />
          <RootExportsRunNode />
          <CrssNode />
        </>
      )}
      <MessagesNode />
      {operationsQueue.length > 0 && <QueuedOperationsNode />}
    </div>
  )
}
