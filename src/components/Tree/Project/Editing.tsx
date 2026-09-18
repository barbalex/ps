import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip: TooltipComponent } = fluentUiReactComponents
import { useAtom, useAtomValue } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import type { ComponentProps, FC, MouseEvent } from 'react'

import { designingAtom, userIdAtom } from '../../../store.ts'
import styles from './Editing.module.css'

// Fluent's Tooltip types require a `relationship` prop that is not passed here
const Tooltip = TooltipComponent as FC<
  Partial<ComponentProps<typeof TooltipComponent>>
>

type Props = {
  projectId: string
}

export const Editing = ({ projectId }: Props) => {
  const [designingMap, setDesigningMap] = useAtom(designingAtom)
  const designing = designingMap[projectId] ?? false
  const userId = useAtomValue(userIdAtom)

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setDesigningMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  const resultProject = useLiveQuery(
    `
      SELECT pr.role
      FROM project_roles pr
      JOIN project_users pu ON pu.project_user_id = pr.project_user_id
      WHERE pr.project_id = $1
        AND (pu.auth_user_id = $2 OR pu.email = (SELECT email FROM users WHERE user_id = $2))
    `,
    [projectId, userId],
  )
  const userRole = resultProject?.rows?.[0]?.role

  const userMayDesign = userRole === 'design' || userRole === 'own'

  if (!userMayDesign) return null

  return (
    <Tooltip
      content={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
    >
      <Button
        size="small"
        icon={
          designing ? (
            <MdEditOff className={styles.svg} />
          ) : (
            <MdEdit className={styles.svg} />
          )
        }
        onClick={onClick}
        className={styles.button}
        appearance={designing ? 'primary' : 'secondary'}
      />
    </Tooltip>
  )
}
