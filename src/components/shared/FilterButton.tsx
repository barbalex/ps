import { useCallback, memo } from 'react'
import { ToggleButton } from '@fluentui/react-components'
import { MdFilterAlt } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'

export const FilterButton = memo(({ isFiltered = false }) => {
  const navigate = useNavigate()

  const onClick = useCallback(
    async () => navigate({ to: './filter' }),
    [navigate],
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
