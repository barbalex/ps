import { useCallback, useRef, useEffect, useState, FC, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

import { css } from '../../../css.ts'
import { useElectric } from '../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'

const resizerStyle = {
  borderLeftWidth: '1px',
  borderLeft: 'solid',
  borderLeftColor: 'grey',
  width: '8px',
  position: 'relative',
  // top: 0,
  left: 0,
  // bottom: 0,
  cursor: 'col-resize',
  resize: 'horizontal',
  zIndex: 1,
}

export const Resize = memo(({ isResizing, startResizing }) => (
  <div
    style={css({
      ...resizerStyle,
      ...(isResizing
        ? {
            borderLeftWidth: 4,
            borderLeftColor: 'black',
          }
        : {}),
      on: ($) => [$('&:hover', { borderLeftWidth: 4 })],
    })}
    onMouseDown={startResizing} // TODO: works but slow. Better to resize on dragend?
    onMouseUp={() => console.log('mouse up, resize now?')}
    onDragEnd={() => console.log('drag end, resize now?')}
  />
))
