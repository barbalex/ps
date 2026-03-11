import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton } = fluentUiReactComponents
import { MdFilterAlt } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

export const FilterButton = ({ isFiltered = false }) => {
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const onClick = () => navigate({ to: './filter' })

  return (
    <ToggleButton
      size="medium"
      icon={<MdFilterAlt />}
      onClick={onClick}
      title={formatMessage({
        id: 'XrRHLB',
        defaultMessage: 'Filter bearbeiten',
      })}
      checked={false}
      style={isFiltered ? { color: 'rgba(255, 141, 2, 1)' } : undefined}
    />
  )
}
