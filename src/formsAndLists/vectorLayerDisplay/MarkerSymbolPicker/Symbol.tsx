import { ReactElement } from 'react'
import type { InputProps } from '@fluentui/react-components'

import styles from './Symbol.module.css'

interface Props {
  Component: ReactElement
  name: string
  onChange: InputProps['onChange']
  active: boolean
}

export const Symbol = ({ Component, name, onChange, active }: Props) => {
  if (active) {
    return <Component className={`${styles.component} ${styles.active}`} />
  }

  const onClick = () =>
    onChange({
      target: {
        name: 'marker_symbol',
        value: name,
      },
    })

  return (
    <Component
      onClick={onClick}
      className={`${styles.component} ${styles.inactive}`}
    />
  )
}
