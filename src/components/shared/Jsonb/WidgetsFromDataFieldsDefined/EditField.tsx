import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { MdEdit } from 'react-icons/md'
import { useSearchParams, useLocation } from 'react-router'
import { useAtom } from 'jotai'

import { designingAtom } from '../../../../store.ts'

export const EditField = memo(({ field_id }) => {
  const [designing] = useAtom(designingAtom)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const { pathname } = useLocation()

  const onClick = useCallback(
    async () => setSearchParams({ editingField: field_id }),
    [field_id, setSearchParams],
  )

  if (!designing) return null
  if (pathname.endsWith('filter')) return null

  return (
    <Button
      size="medium"
      icon={<MdEdit />}
      onClick={onClick}
      title="Edit Field"
    />
  )
})
