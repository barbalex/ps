import { useCallback } from 'react'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import { Button } from '@fluentui/react-components'

import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

const buttonStyle = {
  borderRadius: 20,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'rgb(51, 51, 51) !important',
}

export const Editing = () => {
  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing ?? false

  const onClick = useCallback(() => {
    db.ui_options.update({
      where: { user_id },
      data: { designing: !designing },
    })
  }, [db.ui_options, designing])

  // if (!designing) return null

  return (
    <Button
      size="small"
      icon={designing ? <MdEdit /> : <MdEditOff />}
      onClick={onClick}
      style={buttonStyle}
      className="tree-node"
    />
  )

  // return <MdEdit title="designing" />
}
