import { ToggleButton } from '@fluentui/react-components'
import { MdFilterAlt } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'

export const FilterButton = ({ isFiltered = false }) => {
  const navigate = useNavigate()

  const onClick = () => navigate({ to: './filter' })

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
}
