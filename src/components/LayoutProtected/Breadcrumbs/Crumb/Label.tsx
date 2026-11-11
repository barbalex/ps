import type { RefObject } from 'react'
import { Link, useLocation } from '@tanstack/react-router'

// import { toggleNodeSymbol } from '../../Projekte/TreeContainer/Tree/toggleNodeSymbol.js'

type NavData = {
  id?: string
  // can be an element (e.g. observations' Absenz badge next to the label)
  label?: React.ReactNode
  labelShort?: string
  ownUrl?: string
}

type Props = {
  navData: NavData
  outerContainerRef: RefObject<HTMLDivElement | null>
}

export const Label = ({ navData, outerContainerRef }: Props) => {
  const { pathname } = useLocation()

  // issue: relative paths are not working!!!???
  // also: need to decode pathname (Zähleinheiten...)
  const pathnameDecoded = decodeURIComponent(pathname)
  const pathnameWithoutLastSlash = pathnameDecoded.replace(/\/$/, '')
  const linksToSomewhereElse = !pathnameWithoutLastSlash.endsWith(
    navData.ownUrl!,
  )
  // console.log('Crumb.Label', {
  //   linksToSomewhereElse,
  //   pathnameDecoded,
  //   pathnameWithoutLastSlash,
  //   ownUrl: navData.ownUrl,
  // })

  const onClick = () => {
    // 1. ensure the clicked element is visible
    const element = outerContainerRef.current
    if (!element) return
    // the timeout needs to be rather long to wait for the transition to finish
    setTimeout(() => {
      element.scrollIntoView({
        inline: 'start',
      })
    }, 1000)
    // 2. TODO: sync tree openNodes?
    // toggleNodeSymbol({
    //   node: {
    //     url: navData.url
    //       .split('/')
    //       .filter((e) => !!e)
    //       .slice(1),
    //   },
    //   store,
    //   search,
    //   navigate,
    // })
  }

  const label = linksToSomewhereElse ? (
    <Link
      className="crumb-label-link"
      to={navData.ownUrl!}
      onClick={onClick}
    >
      {navData.labelShort ?? navData.label}
    </Link>
  ) : (
    <div className="crumb-label-text">{navData.labelShort ?? navData.label}</div>
  )

  return label
}
