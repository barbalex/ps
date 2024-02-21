import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import { MdOutlineDesignServices } from 'react-icons/md'
import { ToggleButton } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'

// TODO: add button to enter design mode
// add this only if user's account equals the account of the project
export const DesigningButton = memo(() => {
  const { project_id } = useParams()

  const { db } = useElectric()!

  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  // TODO: modularize to reduce renders
  const designing = uiOption?.designing ?? false
  const onClickDesigning = useCallback(() => {
    db.ui_options.update({
      where: { user_id },
      data: { designing: !designing },
    })
  }, [db.ui_options, designing])

  return (
    <ToggleButton
      checked={designing}
      title={`${designing ? 'not ' : ''}designing`}
      icon={<MdOutlineDesignServices />}
      onClick={onClickDesigning}
    />
  )
})
