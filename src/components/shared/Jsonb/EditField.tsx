import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { MdEdit } from 'react-icons/md'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider.tsx'

export const EditField = memo(({ field_id }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()

  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing

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
