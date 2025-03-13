import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'

export const Type = memo(({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(`SELECT type FROM project_types order by sort, type`)
  const isLoading = isFirstRender && res === undefined
  const projectTypes = res?.rows.map((row) => row.type) ?? []

  return (
    <RadioGroupField
      label="Type"
      name="type"
      list={projectTypes}
      isLoading={isLoading}
      value={row.type ?? ''}
      onChange={onChange}
    />
  )
})
