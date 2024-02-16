import { useCallback } from 'react'
import { Button } from '@fluentui/react-components'
import { MdEdit } from 'react-icons/md'
import { useSearchParams } from 'react-router-dom'

export const EditField = ({ field_id }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()

  const onClick = useCallback(
    async () => setSearchParams({ editingField: field_id }),
    [field_id, setSearchParams],
  )

  return (
    <Button
      size="medium"
      icon={<MdEdit />}
      onClick={onClick}
      title="Edit Field"
    />
  )
}
