import { Button } from '@fluentui/react-components'
import { MdEdit } from 'react-icons/md'
import { useAtom } from 'jotai'
import { useNavigate, useLocation } from '@tanstack/react-router'

import { designingAtom } from '../../../../store.ts'

export const EditField = ({ fieldId }) => {
  const [designing] = useAtom(designingAtom)
  const navigate = useNavigate()
  const location = useLocation()

  const onClick = () => navigate({ search: { editingField: fieldId } })

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
}
