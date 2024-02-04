import React, { useMemo } from 'react'
import * as icons from 'react-icons/md'
import type { InputProps } from '@fluentui/react-components'

import Label from '../../Label'
import Symbol from './Symbol'

const symbolContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  height: 500,
  overflow: 'auto',
  outline: '1px solid rgba(74, 20, 140, 0.1)',
  marginBottom: 19,
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
