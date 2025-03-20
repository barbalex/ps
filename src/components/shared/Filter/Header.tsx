import { memo, useCallback } from 'react'
import { ToggleButton, Button } from '@fluentui/react-components'
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { controls } from '../../../styles.ts'

type Props = {
  title: string
  filterAtom: unknown
}

export const FilterHeader = memo(({ title = 'Filter', filterAtom }: Props) => {
  const navigate = useNavigate()
  // ensure atom exists - got errors when it didn't
  const [filter, setFilter] = useAtom(filterAtom)
  const isFiltered = filter.length > 0

  const onClickBack = useCallback(() => navigate({ to: '..' }), [navigate])

  const onClickClearFilter = useCallback(() => setFilter([]), [setFilter])

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
})
