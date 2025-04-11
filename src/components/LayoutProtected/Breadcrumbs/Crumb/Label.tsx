import { memo, useCallback, useMemo } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Tooltip } from '@fluentui/react-components'

// import { toggleNodeSymbol } from '../../Projekte/TreeContainer/Tree/toggleNodeSymbol.js'

export const Label = memo(({ navData, outerContainerRef, labelStyle, ref }) => {
  const { pathname } = useLocation()

  // issue: relative paths are not working!!!???
  // also: need to decode pathname (Zähleinheiten...)
  const pathnameDecoded = decodeURIComponent(pathname)
  const pathnameWithoutLastSlash = pathnameDecoded.replace(/\/$/, '')
  const linksToSomewhereElse = !pathnameWithoutLastSlash.endsWith(
    navData.ownUrl,
  )
  // console.log('Crumb.Label', {
  //   linksToSomewhereElse,
  //   pathnameDecoded,
  //   pathnameWithoutLastSlash,
  //   ownUrl: navData.ownUrl,
  // })

  const onClick = useCallback(() => {
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
  }, [outerContainerRef])

  const label = useMemo(
    () =>
      linksToSomewhereElse ?
        <Link
          className="crumb-label-link"
          to={navData.ownUrl}
          onClick={onClick}
          ref={ref}
          style={labelStyle}
        >
          {navData.labelShort ?? navData.label}
        </Link>
      : <div
          className="crumb-label-text"
          ref={ref}
          style={labelStyle}
        >
          {navData.labelShort ?? navData.label}
        </div>,
    [
      linksToSomewhereElse,
      navData.ownUrl,
      navData.labelShort,
      navData.label,
      onClick,
      ref,
      labelStyle,
    ],
  )

  // tooltip can mess with touch, so hide it on touch devices
  if (!matchMedia('(pointer: coarse)').matches) {
    return <Tooltip content={navData.label}>{label}</Tooltip>
  }
  return label
})
