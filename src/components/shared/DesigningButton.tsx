import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, ToggleButton, Tooltip } = fluentUiReactComponents
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { designingAtom } from '../../store.ts'
import styles from './DesigningButton.module.css'

interface Props {
  inTree?: boolean
}

export const DesigningButton = ({ inTree = false }: Props) => {
  const [designing, setDesigning] = useAtom(designingAtom)
  const { formatMessage } = useIntl()

  // Check if there are any projects (auth not yet implemented, assume user is account owner)
  const resultProjects = useLiveQuery(
    `SELECT COUNT(*) as project_count FROM projects`,
  )
  const projectCount = resultProjects?.rows?.[0]?.project_count ?? 0
  const userMayDesign = projectCount > 0

  const onClick = (e) => {
    if (inTree) e.stopPropagation()
    setDesigning(!designing)
  }

  // Return early after all hooks have been called
  if (!userMayDesign) return null

  const tooltip = designing
    ? formatMessage({
        id: 'G3GlSA',
        defaultMessage: 'Projekte designen. Klicken zum Beenden',
      })
    : formatMessage({ id: 'hIsRqy', defaultMessage: 'Designen starten' })

  const icon = designing ? (
    <MdEditOff className={inTree ? styles.svg : undefined} />
  ) : (
    <MdEdit className={inTree ? styles.svg : undefined} />
  )

  return (
    <Tooltip content={tooltip}>
      {inTree ? (
        <Button
          size="small"
          icon={icon}
          onClick={onClick}
          className={styles.button}
          appearance={designing ? 'primary' : 'secondary'}
        />
      ) : (
        <ToggleButton
          checked={designing}
          icon={icon}
          onClick={onClick}
          appearance={designing ? 'primary' : 'secondary'}
        />
      )}
    </Tooltip>
  )
}
