import { ReactElement } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
type InputProps = React.ComponentProps<typeof fluentUiReactComponents.Input>

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
