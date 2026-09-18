import { useRef } from 'react'
import { Transition } from 'react-transition-group'

import { Label } from './Label.tsx'

import './style.css'
import styles from './index.module.css'

type NavData = {
  id?: string
  label?: string
  labelShort?: string
  ownUrl?: string
}

type Props = {
  navData: NavData
  in?: boolean
}

export const Crumb = ({ navData, in: inProp }: Props) => {
  const outerContainerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

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
