import { useRef } from 'react'
import { Transition } from 'react-transition-group'

import { Label } from './Label.tsx'

import './style.css'
import styles from './index.module.css'

export const Crumb = ({ navData, in: inProp }) => {
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
        <div className="crumb-outer-container" ref={outerContainerRef}>
          <div className="crumb-container">
            <Label
              navData={navData}
              outerContainerRef={outerContainerRef}
              ref={labelRef}
              labelClassName={
                ['entering', 'entered'].includes(state)
                  ? styles.labelVisible
                  : styles.labelHidden
              }
            />
          </div>
        </div>
      )}
    </Transition>
  )
}
