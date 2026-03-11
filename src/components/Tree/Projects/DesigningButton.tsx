import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'

import { useIntl } from 'react-intl'

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

  const { formatMessage } = useIntl()

  const onClick = (e) => {
    e.stopPropagation()
    setDesigning(!designing)
  }

  // Return early after all hooks have been called
  if (!userMayDesign) return null

  return (
    <Tooltip
      content={
        designing
          ? formatMessage({
              id: 'G3GlSA',
              defaultMessage: 'Projekte designen. Klicken zum Beenden',
            })
          : formatMessage({ id: 'hIsRqy', defaultMessage: 'Designen starten' })
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
