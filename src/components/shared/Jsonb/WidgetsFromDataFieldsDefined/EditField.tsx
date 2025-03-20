import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { MdEdit } from 'react-icons/md'
import { useAtom } from 'jotai'
import { useNavigate, useLocation } from '@tanstack/react-router'

import { designingAtom } from '../../../../store.ts'

export const EditField = memo(({ fieldId }) => {
  const [designing] = useAtom(designingAtom)
  const navigate = useNavigate()
  const location = useLocation()

  const onClick = useCallback(
    async () => navigate({ search: { editingField: fieldId } }),
    [fieldId, navigate],
  )

  if (!designing) return null
  if (location.pathname.endsWith('filter')) return null

  return (
    <Button
      size="medium"
      icon={<MdEdit />}
      onClick={onClick}
      title="Edit Field"
    />
  )
})
