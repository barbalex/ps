import React, { useCallback } from 'react'
import type { InputProps } from '@fluentui/react-components'

import { css } from '../../../../css'

interface Props {
  Component: any
  name: string
  onChange: InputProps['onChange']
  active: boolean
}

export const Symbol = ({ Component, name, onChange, active }: Props) => {
  const onClick = useCallback(() => {
    onChange({
      target: {
        name: 'marker_symbol',
        value: name,
      },
    })
  }, [name, onChange])

  if (active) {
    return (
      <Component
        style={css({
          backgroundColor: 'rgba(74, 20, 140, 0.1)',
          outline: '2px solid rgba(74, 20, 140, 1)',
          // was '> svg' from the container
          fontSize: 'x-large',
          padding: 4,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(74, 20, 140, 0.1)',
          },
        })}
      />
    )
  }

  return <Component onClick={onClick} />
}
