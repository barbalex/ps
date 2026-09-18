import styles from './Symbol.module.css'

interface Props {
  Component: React.ComponentType<{
    className?: string
    onClick?: React.MouseEventHandler
  }>
  name: string
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
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
    } as unknown as React.ChangeEvent<any>)

  return (
    <Component
      onClick={onClick}
      className={`${styles.component} ${styles.inactive}`}
    />
  )
}
