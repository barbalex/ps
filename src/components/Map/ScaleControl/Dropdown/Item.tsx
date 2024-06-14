import { memo } from 'react'
import { css } from '../../../../css.ts'

const itemStyle = {
  cursor: 'pointer',
  padding: '2px 0',
  fontSize: '0.9em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
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
