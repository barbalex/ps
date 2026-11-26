import { useContext, type MouseEvent, type RefObject } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { MapInfoNavigation } from '../../../../modules/mapInfoFormContext.ts'

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
  const browseInInfo = useContext(MapInfoNavigation)
  const dataLink = navData.ownUrl === '/data' || navData.ownUrl?.startsWith('/data/')

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

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    if (dataLink) browseInInfo?.()
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
      {...(browseInInfo && dataLink && { search: true })}
      onClick={onClick}
    >
      {navData.labelShort ?? navData.label}
    </Link>
  ) : (
    <div className="crumb-label-text">{navData.labelShort ?? navData.label}</div>
  )

  return label
}
