import { useMemo } from 'react'
import * as icons from 'react-icons/md'
import type { InputProps } from '@fluentui/react-components'

import { Label } from '../../../components/shared/Label.tsx'
import { Symbol } from './Symbol.tsx'

const symbolContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  minHeight: 600,
  overflow: 'auto',
  scrollbarWidth: 'thin',
  outline: '1px solid rgba(74, 20, 140, 0.1)',
  marginBottom: 13,
  marginTop: -10,
}

interface Props {
  onChange: InputProps['onChange']
  value: string | undefined
}

export const MarkerSymbolPicker = ({ onChange, value }: Props) => {
  const wantedIconKeys = useMemo(
    () =>
      Object.keys(icons)
        .filter((key) => !key.endsWith('Mp'))
        .filter((key) => !key.endsWith('K'))
        .filter((key) => !key.endsWith('KPlus')),
    [],
  )

  // TODO: use fluent ui Label?
  return (
    <>
      <Label label="Symbol" />
      <div style={symbolContainerStyle}>
        {wantedIconKeys.map((key) => {
          const Component = icons[key]

          return (
            <Symbol
              key={key}
              Component={Component}
              name={key}
              onChange={onChange}
              active={value === key}
            />
          )
        })}
      </div>
    </>
  )
}
