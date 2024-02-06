import { useCallback } from 'react'
import { Button } from '@fluentui/react-button'
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'

export const LayerMenu = () => {
  // query if ui_options.show_check_layer is set
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const showCheckLayer = uiOption?.show_check_layer ?? false

  return (
    <Button
      size="medium"
      // icon={<FaPlus />}
      // onClick={addRow}
      // title={`Add new ${tableName}`}
    />
  )
}
