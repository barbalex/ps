import { useCallback, memo } from 'react'
import { ToggleButton } from '@fluentui/react-button'
import { MdFilterAlt } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const FilterButton = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onClick = useCallback(
    async () =>
      navigate({
        pathname: 'filter',
        search: searchParams.toString(),
      }),
    [navigate, searchParams],
  )

  return (
    <ToggleButton
      size="medium"
      icon={<MdFilterAlt />}
      onClick={onClick}
      title="Edit Filter"
      checked={false}
    />
  )
})
