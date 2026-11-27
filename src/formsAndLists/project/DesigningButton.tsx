import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton, Tooltip } = fluentUiReactComponents
import { useParams } from '@tanstack/react-router'

import { useUrlDesigning } from '../../modules/useUrlDesigning.ts'

export const DesigningButton = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string }
  // url param wins, the designingAtom map is the fallback (see the hook)
  const [designing, setDesigning] = useUrlDesigning(projectId)

  const onClickDesigning = () => setDesigning(!designing)

  return (
    <Tooltip
      content={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
      relationship="label"
    >
      <ToggleButton
        checked={designing}
        icon={designing ? <MdEditOff /> : <MdEdit />}
        onClick={onClickDesigning}
      />
    </Tooltip>
  )
}
