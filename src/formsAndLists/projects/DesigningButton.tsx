import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton, Tooltip } = fluentUiReactComponents
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'

import { useIntl } from 'react-intl'

import { designingAtom } from '../../store.ts'

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
  const onClickDesigning = () => setDesigning(!designing)

  // Return early after all hooks have been called
  if (!userMayDesign) return null

  return (
    <Tooltip
      content={
        designing
          ? formatMessage({ id: 'G3GlSA', defaultMessage: 'Projekte designen. Klicken zum Beenden' })
          : formatMessage({ id: 'hIsRqy', defaultMessage: 'Designen starten' })
      }
    >
      <ToggleButton
        checked={designing}
        icon={designing ? <MdEditOff /> : <MdEdit />}
        onClick={onClickDesigning}
        appearance={designing ? 'primary' : 'secondary'}
      />
    </Tooltip>
  )
}
