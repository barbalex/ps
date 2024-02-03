import React, { useMemo } from 'react'
import * as icons from 'react-icons/md'
import styled from '@emotion/styled'

import Label from '../../Label'
import Symbol from './Symbol'

const SymbolContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 500px;
  overflow: auto;
  outline: 1px solid rgba(74, 20, 140, 0.1);
  margin-bottom: 19px;
  > svg {
    font-size: x-large;
    padding: 4px;
    cursor: pointer;
    &:hover {
      background-color: rgba(74, 20, 140, 0.1);
    }
  }
`

interface Props {
  onBlur: () => void
  value: string | undefined
}

const MarkerSymbolPicker = ({ onBlur, value }: Props) => {
  // console.log('MarkerSymbolPicker, images:', icons)
  const wantedIconKeys = useMemo(
    () =>
      Object.keys(icons)
        .filter((key) => !key.endsWith('Mp'))
        .filter((key) => !key.endsWith('K'))
        .filter((key) => !key.endsWith('KPlus')),
    [],
  )
  // console.log('MarkerSymbolPicker, wantedIconKeys:', wantedIconKeys)

  return (
    <>
      <Label label="Symbol" />
      <SymbolContainer>
        {wantedIconKeys.map((key) => {
          const Component = icons[key]

          return (
            <Symbol
              key={key}
              Component={Component}
              name={key}
              onBlur={onBlur}
              active={value === key}
            />
          )
        })}
      </SymbolContainer>
    </>
  )
}

export default MarkerSymbolPicker
