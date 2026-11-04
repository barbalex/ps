import { useLayoutEffect, useRef } from 'react'

import { Label } from './Label.tsx'

import './style.css'

// must stay in sync with the delayed unmount in ../index.tsx
export const EXIT_DURATION = 700

type NavData = {
  id?: string
  label?: string
  labelShort?: string
  ownUrl?: string
}

type Props = {
  navData: NavData
  // false while Breadcrumbs keeps a removed crumb mounted; the crumb's box
  // fades and collapses so the remaining crumbs slide instead of jumping
  in?: boolean
}

export const Crumb = ({ navData, in: inProp = true }: Props) => {
  const outerContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (inProp) return
    const outer = outerContainerRef.current
    if (!outer) return

    // freeze the measured footprint so flex shrink, the automatic minimum
    // size and content-box width cannot fight the animation
    outer.style.boxSizing = 'border-box'
    outer.style.flexShrink = '0'
    outer.style.minWidth = '0px'
    const { paddingLeft, paddingRight } = getComputedStyle(outer)

    // margins are left alone on purpose: the first-of-type margin-right
    // transfers to the next crumb when this one unmounts
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : EXIT_DURATION
    const animation = outer.animate(
      [
        {
          width: `${outer.offsetWidth}px`,
          paddingLeft,
          paddingRight,
          opacity: 1,
        },
        {
          width: '0px',
          paddingLeft: '0px',
          paddingRight: '0px',
          opacity: 0,
        },
      ],
      { duration, easing: 'ease-in-out', fill: 'forwards' },
    )
    return () => animation.cancel()
  }, [inProp])

  return (
    <div className="crumb-outer-container" ref={outerContainerRef}>
      <div className="crumb-container">
        <Label navData={navData} outerContainerRef={outerContainerRef} />
      </div>
    </div>
  )
}
