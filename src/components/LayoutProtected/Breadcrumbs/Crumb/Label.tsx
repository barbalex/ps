import { Link, useLocation } from '@tanstack/react-router'

// import { toggleNodeSymbol } from '../../Projekte/TreeContainer/Tree/toggleNodeSymbol.js'

export const Label = ({ navData, outerContainerRef, labelClassName, ref }) => {
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
      to={navData.ownUrl}
      onClick={onClick}
      ref={ref}
      className={`crumb-label-link ${labelClassName ?? ''}`}
    >
      {navData.labelShort ?? navData.label}
    </Link>
  ) : (
    <div className={`crumb-label-text ${labelClassName ?? ''}`} ref={ref}>
      {navData.labelShort ?? navData.label}
    </div>
  )

  return label
}
