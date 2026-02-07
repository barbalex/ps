import { MdEdit, MdEditOff } from 'react-icons/md'
import { Button, Tooltip } from '@fluentui/react-components'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'

import { designingAtom } from '../../../store.ts'
import styles from './DesigningButton.module.css'

export const DesigningButton = () => {
  const [designing, setDesigning] = useAtom(designingAtom)
  const { user } = useCorbado()

  // Check if there are any projects (auth not yet implemented, assume user is account owner)
  const resultProjects = useLiveQuery(
    `SELECT COUNT(*) as project_count FROM projects`,
  )
  const projectCount = resultProjects?.rows?.[0]?.project_count ?? 0
  const userMayDesign = projectCount > 0

  const onClick = (e) => {
    e.stopPropagation()
    setDesigning(!designing)
  }

  // Return early after all hooks have been called
  if (!userMayDesign) return null

  return (
    <Tooltip
      content={
        designing ? 'Designing projects. Click to stop' : 'Start designing'
      }
    >
      <Button
        size="small"
        icon={
          designing ?
            <MdEdit className={styles.svg} />
          : <MdEditOff className={styles.svg} />
        }
        onClick={onClick}
        className={styles.button}
      />
    </Tooltip>
  )
}
