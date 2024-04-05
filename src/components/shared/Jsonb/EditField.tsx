import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { MdEdit } from 'react-icons/md'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

export const EditField = memo(({ field_id }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.app_state.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing

  const onClick = useCallback(
    async () => setSearchParams({ editingField: field_id }),
    [field_id, setSearchParams],
  )

  if (!designing) return null

  return (
    <Button
      size="medium"
      icon={<MdEdit />}
      onClick={onClick}
      title="Edit Field"
    />
  )
})
