import { memo, useCallback } from 'react'
import { ToggleButton, Button } from '@fluentui/react-components'
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCorbado } from '@corbado/react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider.tsx'
import { controls } from '../../../styles.ts'

type Props = {
  title: string
  isFiltered: boolean
  filterName: string
}

export const FilterHeader = memo(
  ({ title = 'Filter', isFiltered = false, filterName }: Props) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    console.log('hello FilterHeader, appState:', appState)

    const onClickBack = useCallback(() => {
      navigate({ pathname: '..', search: searchParams.toString() })
    }, [navigate, searchParams])

    const onClickClearFilter = useCallback(() => {
      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { [filterName]: null },
      })
    }, [appState?.app_state_id, db.app_states, filterName])

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
