import {
  memo,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  Children,
  cloneElement,
} from 'react'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  Tooltip,
} from '@fluentui/react-components'
import { FaBars } from 'react-icons/fa6'
import { useDebouncedCallback } from 'use-debounce'
import { controls } from '../../styles.ts'

const buttonHeight = 40
export const buttonWidth = 40

const measuredOuterContainerStyle = {
  overflow: 'hidden',
  minHeight: buttonHeight,
  maxHeight: buttonHeight,
  minWidth: buttonWidth,
  flexBasis: buttonWidth,
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-end',
  flexGrow: 1,
  flexShrink: 0,
  columnGap: 0,
  // backgroundColor needed (not transparent) as in fullscreen backed by black
  borderTop: '1px solid rgba(225, 247, 224, 0.15)',
  borderBottom: '1px solid rgba(225, 247, 224, 0.15)',
}
// StylingContainer overflows parent????!!!!
// Possible solution: pass in max-width
const stylingContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexGrow: 1,
  flexShrink: 0,
  flexWrap: 'nowrap',
  columnGap: 0,
  minHeight: buttonHeight,
  maxHeight: buttonHeight,
  overflow: 'hidden',
}
// remove the margin mui adds to top and bottom of menu
const menuStyle = {
  overflow: 'hidden',
}
const menuContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  rowGap: '3px',
  overflow: 'hidden',
  padding: '3px !important',
}

// possible improvement:
// add refs in here to measure their widths
export const MenuBar = memo(
  ({
    children,
    // enable the parent to force rerenders
    rerenderer,
    // files pass in titleComponent and its width
    titleComponent,
    titleComponentWidth,
    bgColor = 'rgb(225, 247, 224)',
    color = 'rgb(36, 36, 36)',
    // top menu bar has no margin between menus, others do
    // and that needs to be compensated for
    addMargin = true,
  }) => {
    const { visibleChildren, widths } = useMemo(() => {
      const visibleChildren = []
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [index, child] of Children.toArray(children).entries()) {
        visibleChildren.push(child)
      }
      // add 12px for margin and border width to props.width
      const widths = visibleChildren.map((c) =>
        c.props.width ?
          addMargin ? c.props.width + 12
          : c.props.width
        : buttonWidth,
      )
      return { visibleChildren, widths }
    }, [addMargin, children])

    const outerContainerRef = useRef(null)
    const outerContainerWidth = outerContainerRef.current?.clientWidth
    const previousMeasurementTimeRef = useRef(0)

    const [buttons, setButtons] = useState([])
    const [menus, setMenus] = useState([])

    // this was quite some work to get right
    // overflowing should only be changed as rarely as possible to prevent unnecessary rerenders
    const checkOverflow = useCallback(() => {
      if (!outerContainerRef.current) return

      const containerWidth = outerContainerRef.current?.clientWidth

      const titleWidth = titleComponentWidth ?? 0
      const spaceForButtonsAndMenus = containerWidth - titleWidth
      const widthOfAllPassedInButtons =
        widths ?
          widths.reduce((acc, w) => acc + w, 0)
        : visibleChildren.length * buttonWidth
      const needMenu = widthOfAllPassedInButtons > spaceForButtonsAndMenus
      const spaceForButtons =
        needMenu ?
          spaceForButtonsAndMenus - buttonWidth
        : spaceForButtonsAndMenus
      // sum widths fitting into spaceForButtons
      const newButtons = []
      const newMenus = []
      let widthSum = 0
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [index, child] of Children.toArray(
        visibleChildren,
      ).entries()) {
        const width =
          child.props.width ?
            addMargin ? child.props.width + 12
            : child.props.width
          : buttonWidth
        if (widthSum + width > spaceForButtons) {
          newMenus.push(cloneElement(child, { inmenu: 'true' }))
        } else {
          newButtons.push(cloneElement(child))
          widthSum += width
        }
      }
      setButtons(newButtons)
      setMenus(newMenus)
      // console.log('MenuBar.checkOverflow', {
      //   widths,
      //   visibleChildren,
      //   needMenu,
      //   spaceForButtonsAndMenus,
      //   containerWidth,
      //   titleWidth,
      //   spaceForButtons,
      //   newButtons,
      //   newMenus,
      // })
    }, [titleComponentWidth, widths, visibleChildren, addMargin])

    const checkOverflowDebounced = useDebouncedCallback(checkOverflow, 300, {
      leading: false,
      trailing: true,
      maxWait: 500,
    })

    useEffect(() => {
      // check overflow when rerenderer changes
      // Example: file preview (any action that changes the menus passed in)
      checkOverflow()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rerenderer])

    const previousWidthRef = useRef(null)
    useEffect(() => {
      if (!outerContainerRef.current) {
        // console.log('MenuBar.useEffect, no containerRef')
        return
      }
      // set up a resize observer for the container
      const observer = new ResizeObserver((entries) => {
        // there is only a single entry...
        for (const entry of entries) {
          const width = entry.contentRect.width

          // only go on if enough time has past since the last measurement (prevent unnecessary rerenders)
          const currentTime = Date.now()
          const timeSinceLastMeasurement =
            currentTime - previousMeasurementTimeRef.current
          if (timeSinceLastMeasurement < 300) {
            // console.log('MenuBar.resizeObserver, not enough time has passed')
            return
          }

          // only go on if the width has changed enough (prevent unnecessary rerenders)
          // this is the reason for not using react-resize-detector
          previousMeasurementTimeRef.current = currentTime
          const percentageChanged = Math.abs(
            ((width - previousWidthRef.current) / width) * 100,
          )
          const shouldCheckOverflow = Math.abs(percentageChanged) > 1
          if (!shouldCheckOverflow) {
            // console.log('MenuBar.resizeObserver, not enough change')
            return
          }

          previousWidthRef.current = width
          // console.log('MenuBar.resizeObserver, calling checkOverflowDebounced')
          checkOverflowDebounced()
        }
      })

      observer.observe(outerContainerRef.current)

      return () => {
        // console.log('MenuBar.useEffect, observer.disconnect')
        observer.disconnect()
      }
    }, [rerenderer, checkOverflowDebounced])

    return (
      <div
        ref={outerContainerRef}
        style={{ ...measuredOuterContainerStyle, backgroundColor: bgColor }}
      >
        {titleComponent}
        <div
          style={{
            ...stylingContainerStyle,
            maxWidth:
              Math.abs(outerContainerWidth ?? 0) - (titleComponentWidth ?? 0),
          }}
        >
          <div style={controls}>{buttons}</div>
          {!!menus.length && (
            <Menu
              style={{ ...menuStyle, backgroundColor: bgColor }}
              className="menubar-menu"
            >
              <MenuTrigger>
                <Tooltip
                  content="Mehr Befehle"
                  relationship="label"
                >
                  <Button
                    size="medium"
                    icon={<FaBars style={{ color }} />}
                    // onClick={onClickMenuButton}
                  />
                </Tooltip>
              </MenuTrigger>
              <MenuList
                bgColor={bgColor}
                className="menubar-more-menus"
                // GOAL: close menu on click on menu item
                // TODO: prevents more menu opening on very narrow screens
                // onClick={onCloseMenu}
                style={{ ...menuContentStyle, backgroundColor: bgColor }}
              >
                {menus}
              </MenuList>
            </Menu>
          )}
        </div>
      </div>
    )
  },
)
