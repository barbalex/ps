import { memo, useCallback, useMemo, useContext } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Tooltip } from '@fluentui/react-components'

// import { toggleNodeSymbol } from '../../Projekte/TreeContainer/Tree/toggleNodeSymbol.js'

export const Label = memo(({ navData, outerContainerRef, labelStyle, ref }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // issue: relative paths are not working!!!???
  // also: need to decode pathname (Zähleinheiten...)
  const pathnameDecoded = decodeURIComponent(pathname)
  const pathnameWithoutLastSlash = pathnameDecoded.replace(/\/$/, '')
  const linksToSomewhereElse = !pathnameWithoutLastSlash.endsWith(navData.url)

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
    // 2. TODO: sync tree openNodes
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
  }, [])

  const label = useMemo(
    () =>
      linksToSomewhereElse ?
        <Link
          className="crumb-label-link"
          to={{ pathname: navData.url }}
          onClick={onClick}
          ref={ref}
          style={{ ...labelStyle }}
        >
          {navData.labelShort ?? navData.label}
        </Link>
      : <div
          className="crumb-label-text"
          ref={ref}
          style={{ ...labelStyle }}
        >
          {navData.labelShort ?? navData.label}
        </div>,
    [
      linksToSomewhereElse,
      navData.label,
      navData.labelShort,
      navData.url,
      labelStyle,
    ],
  )

  // tooltip can mess with touch, so hide it on touch devices
  if (!matchMedia('(pointer: coarse)').matches) {
    return <Tooltip content={navData.label}>{label}</Tooltip>
  }
  return label
})
