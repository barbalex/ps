import { ReactElement } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { pipe } from 'remeda'

import { on } from '../../../css.ts'

interface Props {
  Component: ReactElement
  name: string
  onChange: InputProps['onChange']
  active: boolean
}
const style = {
  backgroundColor: 'white',
  outline: '1px solid rgba(74, 20, 140, 1)',
  fontSize: 'large',
  padding: 4,
  cursor: 'pointer',
}
const activeStyle = {
  ...style,
  backgroundColor: 'yellow',
}

export const Symbol = ({ Component, name, onChange, active }: Props) => {
  const onClick = () =>
    onChange({
      target: {
        name: 'marker_symbol',
        value: name,
      },
    })

  if (active) return <Component style={activeStyle} />

  return (
    <Component
      onClick={onClick}
      style={pipe(
        style,
        on('&:hover', {
          backgroundColor: 'rgba(74, 20, 140, 0.1)',
        }),
      )}
    />
  )
}
