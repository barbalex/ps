import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton, Button } = fluentUiReactComponents
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import globalStyles from '../../../styles.module.css'
import styles from './index.module.css'

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
          title={formatMessage({
            id: 'TVoh4o',
            defaultMessage: 'Filter verlassen',
          })}
          checked={true}
          className={isFiltered ? styles.filterActive : undefined}
        />
        <Button
          size="medium"
          icon={<MdFilterAltOff />}
          onClick={onClickClearFilter}
          title={formatMessage({
            id: 'fAA1bB',
            defaultMessage: 'Filter löschen',
          })}
          disabled={!isFiltered}
        />
      </div>
    </div>
  )
}
