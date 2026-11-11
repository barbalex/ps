import { useLayoutEffect, useRef } from 'react'

import { Label } from './Label.tsx'

import './style.css'

// shared by the enter and exit animations; must stay in sync with the
// delayed unmount in ../index.tsx
export const ANIM_DURATION = 700

// reduced-motion users get no movement at all
const animDuration = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ANIM_DURATION

type NavData = {
  id?: string
  // can be an element (e.g. observations' Absenz badge next to the label)
  label?: React.ReactNode
  labelShort?: string
  ownUrl?: string
}

type Props = {
  navData: NavData
  // false while Breadcrumbs keeps a removed crumb mounted; the crumb's box
  // fades and collapses so the remaining crumbs slide instead of jumping
  in?: boolean
  // true when this crumb is new: it fades in and grows from zero width so
  // the trail extends smoothly
  enter?: boolean
}

export const Crumb = ({
  navData,
  in: inProp = true,
  enter = false,
}: Props) => {
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
      { duration: animDuration(), easing: 'ease-in-out', fill: 'forwards' },
    )
    return () => animation.cancel()
  }, [inProp])

  useLayoutEffect(() => {
    if (!enter || !inProp) return
    const outer = outerContainerRef.current
    if (!outer) return

    // box-sizing/min-width so the box can start at zero despite the
    // content and the automatic minimum size; fill stays 'none' - the
    // label can resolve asynchronously and change the natural width
    outer.style.boxSizing = 'border-box'
    outer.style.minWidth = '0px'
    const width = outer.offsetWidth
    const animation = outer.animate(
      [
        { width: '0px', opacity: 0 },
        { width: `${width}px`, opacity: 1 },
      ],
      { duration: animDuration(), easing: 'ease-in-out' },
    )
    return () => animation.cancel()
  }, [enter, inProp])

  return (
    <div className="crumb-outer-container" ref={outerContainerRef}>
      <div className="crumb-container">
        <Label navData={navData} outerContainerRef={outerContainerRef} />
      </div>
    </div>
  )
}
