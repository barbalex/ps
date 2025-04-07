import { memo, useCallback, useMemo, useContext } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Tooltip } from '@fluentui/react-components'
import { observer } from 'mobx-react-lite'

import { toggleNodeSymbol } from '../../Projekte/TreeContainer/Tree/toggleNodeSymbol.js'
import { MobxContext } from '../../../mobxContext.js'

export const Label = memo(
  observer(({ navData, outerContainerRef, labelStyle, ref }) => {
    const { pathname, search } = useLocation()
    const navigate = useNavigate()
    const store = useContext(MobxContext)

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
      // 2. sync tree openNodes
      toggleNodeSymbol({
        node: {
          url: navData.url
            .split('/')
            .filter((e) => !!e)
            .slice(1),
        },
        store,
        search,
        navigate,
      })
    }, [])

    const label = useMemo(
      () =>
        linksToSomewhereElse ?
          <Link
            className="crumb-label-link"
            to={{ pathname: navData.url, search }}
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
        search,
        labelStyle,
      ],
    )

    // tooltip can mess with touch, so hide it on touch devices
    if (!matchMedia('(pointer: coarse)').matches) {
      return <Tooltip content={navData.label}>{label}</Tooltip>
    }
    return label
  }),
)
