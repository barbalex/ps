import styles from './Symbol.module.css'
import type { FieldChangeHandler } from '../../../components/shared/fieldChange.ts'

interface Props {
  Component: React.ComponentType<{
    className?: string
    onClick?: React.MouseEventHandler
  }>
  name: string
  onChange: FieldChangeHandler
  active: boolean
}

export const MarkerSymbol = ({ Component, name, onChange, active }: Props) => {
  if (active) {
    return <Component className={`${styles.component} ${styles.active}`} />
  }

  const onClick = () =>
    onChange({
      target: {
        name: 'marker_symbol',
        value: name,
      },
    } as unknown as React.ChangeEvent<HTMLElement>)

  return (
    <Component
      onClick={onClick}
      className={`${styles.component} ${styles.inactive}`}
    />
  )
}
