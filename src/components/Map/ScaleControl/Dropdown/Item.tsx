import { memo } from 'react'
import { css } from '../../../../css.ts'

const itemStyle = {
  cursor: 'pointer',
  padding: '2px 5px',
  fontSize: '1em',
}

export const Item = memo(({ scale }) => {
  return (
    <div
      style={css({
        ...itemStyle,
        on: ($) => [$('&:hover', { backgroundColor: 'lightgray' })],
      })}
      onClick={() => {
        // TODO: set scale
      }}
    >
      {`1 : ${scale.toLocaleString('de-ch')}`}
    </div>
  )
})
