import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'

// TODO: maybe generalize this component for all geometry editing
// and move it to the shared folder
export const EditingGeometry = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results

  return null
}
