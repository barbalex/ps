import { useRef } from 'react'

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
  // false while Breadcrumbs keeps a removed crumb mounted to fade it out;
  // the label's css opacity transition (700ms) does the animating
  in?: boolean
}

export const Crumb = ({ navData, in: inProp = true }: Props) => {
  const outerContainerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  // don't add tooltip on mobile as longpress opens menu
  return (
    <div className="crumb-outer-container" ref={outerContainerRef}>
      <div className="crumb-container">
        <Label
          navData={navData}
          outerContainerRef={outerContainerRef}
          ref={labelRef}
          labelClassName={
            inProp ? styles.labelVisible : styles.labelHidden
          }
        />
      </div>
    </div>
  )
}
