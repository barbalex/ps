import { useCallback } from 'react'
import { Button } from '@fluentui/react-button'
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'

export const LayerMenu = ({ table }) => {
  const fieldName =
    table === 'places'
      ? 'show_place_layer'
      : table === 'checks'
      ? 'show_check_layer'
      : table === 'actions'
      ? 'show_action_layer'
      : null

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const showLayer = uiOption?.[fieldName] ?? false

  const onClick = useCallback(() => {
    db.ui_options.update({
      where: { user_id },
      data: { [fieldName]: !showLayer },
    })
  }, [db.ui_options, fieldName, showLayer])

  return (
    <Button
      size="medium"
      icon={showLayer ? <MdLayersClear /> : <MdLayers />}
      onClick={onClick}
      title={
        showLayer ? `Show checks layer in map` : `Remove checks layer from map`
      }
    />
  )
}
