import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton } = fluentUiReactComponents
import { MdFilterAlt } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import styles from './FilterButton.module.css'

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
      className={isFiltered ? styles.active : undefined}
    />
  )
}
