import { useCallback } from 'react'

interface Props {
  Component: any
  name: string
  onBlur: (event: any) => void
  active: boolean
}

const Symbol = ({ Component, name, onBlur, active }: Props) => {
  const onClick = useCallback(() => {
    onBlur({
      target: {
        name: 'marker_symbol',
        value: name,
      },
    })
  }, [name, onBlur])

  if (active) {
    return (
      <Component
        style={{
          backgroundColor: 'rgba(74, 20, 140, 0.1)',
          outline: '2px solid rgba(74, 20, 140, 1)',
        }}
      />
    )
  }

  return <Component onClick={onClick} />
}

export default Symbol
