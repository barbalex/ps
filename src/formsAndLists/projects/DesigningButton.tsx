import { MdEdit, MdEditOff } from 'react-icons/md'
import { ToggleButton, Tooltip } from '@fluentui/react-components'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'

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

  const onClickDesigning = () => setDesigning(!designing)

  // Return early after all hooks have been called
  if (!userMayDesign) return null

  return (
    <Tooltip
      content={
        designing ? 'Designing projects. Click to stop' : 'Start designing'
      }
    >
      <ToggleButton
        checked={designing}
        icon={designing ? <MdEdit /> : <MdEditOff />}
        onClick={onClickDesigning}
      />
    </Tooltip>
  )
}
