import { memo, useCallback } from 'react'
import { ToggleButton, Button } from '@fluentui/react-components'
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { controls } from '../../../styles.ts'
import * as stores from '../../../store.ts'

type Props = {
  title: string
  isFiltered: boolean
  filterName: string
}

export const FilterHeader = memo(
  ({ title = 'Filter', isFiltered = false, filterName }:Props) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const onClickBack = useCallback(
      () => navigate({ pathname: '..', search: searchParams.toString() }),
      [navigate, searchParams],
    )

    const onClickClearFilter = useCallback(() => {
      const filterAtom = stores[filterName]
      stores?.store?.set?.(filterAtom, [])
    }, [filterName])

    return (
      <div className="form-header filter">
        <h1>{title}</h1>
        <div style={controls}>
          <ToggleButton
            size="medium"
            icon={<MdFilterAlt />}
            onClick={onClickBack}
            title="Leave Filter"
            checked={true}
            style={{
              ...(isFiltered ? { color: 'rgba(255, 141, 2, 1' } : {}),
            }}
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
  },
)
