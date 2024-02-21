import { MdEdit } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

export const Editing = () => {
  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing ?? false

  if (!designing) return null

  return <MdEdit title="designing" />
}
