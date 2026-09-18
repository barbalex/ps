import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton } = fluentUiReactComponents
import { MdFilterAlt } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import styles from './FilterButton.module.css'

type Props = {
  isFiltered?: boolean
}

export const FilterButton = ({ isFiltered = false }: Props) => {
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  // './filter' is a runtime-relative route not part of the typed route union
  const onClick = () =>
    navigate({ to: './filter' } as unknown as Parameters<typeof navigate>[0])

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
