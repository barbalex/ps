import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton, Button } = fluentUiReactComponents
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import globalStyles from '../../../styles.module.css'

type Props = {
  title: string
  filterAtom: unknown
}

export const FilterHeader = ({ title = 'Filter', filterAtom }: Props) => {
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  // ensure atom exists - got errors when it didn't
  const [filter, setFilter] = useAtom(filterAtom)
  const isFiltered = filter.length > 0

  const onClickBack = () => navigate({ to: '..' })

  const onClickClearFilter = () => setFilter([])

  return (
    <div className="form-header filter">
      <h1>{title}</h1>
      <div className={globalStyles.controls}>
        <ToggleButton
          size="medium"
          icon={<MdFilterAlt />}
          onClick={onClickBack}
          title={formatMessage({ id: 'TVoh4o', defaultMessage: 'Filter verlassen' })}
          checked={true}
          style={isFiltered ? { color: 'rgba(255, 141, 2, 1)' } : undefined}
        />
        <Button
          size="medium"
          icon={<MdFilterAltOff />}
          onClick={onClickClearFilter}
          title="Clear Filter"
          disabled={!isFiltered}
        />
      </div>
    </div>
  )
}
