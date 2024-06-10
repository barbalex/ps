import { useCallback, memo } from 'react'
import { ToggleButton } from '@fluentui/react-button'
import { MdFilterAlt } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const FilterButton = memo(({ isFiltered = false }) => {
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
      style={{
        ...(isFiltered ? { color: 'rgba(255, 141, 2, 1)' } : {}),
      }}
    />
  )
})
