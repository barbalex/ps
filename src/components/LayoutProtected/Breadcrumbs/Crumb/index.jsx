import { memo, useRef } from 'react'
import { Menu } from './Menu/index.jsx'
import styled from '@emotion/styled'
import { Transition } from 'react-transition-group'
import { useAtom } from 'jotai'

import { Label } from './Label.jsx'
import { showBookmarksMenuAtom } from '../../../JotaiStore/index.js'

import './style.css'

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
}

export const Crumb = memo(({ navData, in: inProp }) => {
  const [showBookmarksMenu] = useAtom(showBookmarksMenuAtom)

  const outerContainerRef = useRef(null)
  const labelRef = useRef(null)

  // don't add tooltip on mobile as longpress opens menu
  return (
    <Transition
      in={inProp}
      timeout={700}
      mountOnEnter
      unmountOnExit
      nodeRef={labelRef}
    >
      {(state) => (
        <div
          className="crumb-outer-container"
          ref={outerContainerRef}
        >
          <div
            className="crumb-container"
            style={{ paddingRight: showBookmarksMenu ? 'unset' : 15 }}
          >
            <Label
              navData={navData}
              outerContainerRef={outerContainerRef}
              ref={labelRef}
              labelStyle={transitionStyles[state]}
            />
            {!!navData.menus && showBookmarksMenu && <Menu navData={navData} />}
          </div>
        </div>
      )}
    </Transition>
  )
})
