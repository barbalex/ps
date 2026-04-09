import {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
  Children,
  cloneElement,
} from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Menu, MenuPopover, MenuTrigger, MenuList, Tooltip } =
  fluentUiReactComponents
import { FaBars } from 'react-icons/fa6'
import { useDebouncedCallback } from 'use-debounce'
import { useBeforeunload } from 'react-beforeunload'

import globalStyles from '../../styles.module.css'
import styles from './index.module.css'

// TODO: check if still used
export const buttonWidth = 32
const buttonGap = 5
const moreButtonReservedWidth = buttonWidth + buttonGap

// possible improvement:
// add refs in here to measure their widths
export const MenuBar = ({
  children,
  // enable the parent to force rerenders
  rerenderer,
  // files pass in titleComponent and its width
  titleComponent,
  titleComponentWidth,
  // top menu bar has no margin between menus, others do
  // and that needs to be compensated for
  addMargin = true,
  // top header should not draw separator borders around menu bar
  showBorder = true,
  // top header should not force menu bar to grow and push sibling controls away
  grow = true,
}) => {
  const getChildBaseWidth = useCallback(
    (child) =>
      child.props.width
        ? addMargin
          ? child.props.width + 12
          : child.props.width
        : buttonWidth,
    [addMargin],
  )

  const { visibleChildren, widths } = useMemo(() => {
    const visibleChildren = []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [index, child] of Children.toArray(children).entries()) {
      visibleChildren.push(child)
    }
    const widths = visibleChildren.map((c) => getChildBaseWidth(c))
    return { visibleChildren, widths }
  }, [children, getChildBaseWidth])

  const requiredButtonsWidth = useMemo(() => {
    const buttonsGapWidth = Math.max(visibleChildren.length - 1, 0) * buttonGap
    return (
      (widths ? widths.reduce((acc, w) => acc + w, 0) : 0) + buttonsGapWidth
    )
  }, [visibleChildren.length, widths])

  const outerContainerRef = useRef(null)
  const outerContainerWidth = outerContainerRef.current?.clientWidth
  const previousMeasurementTimeRef = useRef(0)

  const [buttons, setButtons] = useState([])
  const [menus, setMenus] = useState([])

  // this was quite some work to get right
  // overflowing should only be changed as rarely as possible to prevent unnecessary rerenders
  const checkOverflow = () => {
    if (!outerContainerRef.current) return

    const containerWidth = outerContainerRef.current?.clientWidth

    const titleWidth = titleComponentWidth ?? 0
    const spaceForButtonsAndMenus = containerWidth - titleWidth
    const buttonsGapWidth = Math.max(visibleChildren.length - 1, 0) * buttonGap
    const widthOfAllPassedInButtons =
      (widths ? widths.reduce((acc, w) => acc + w, 0) : 0) + buttonsGapWidth
    const needMenu = widthOfAllPassedInButtons > spaceForButtonsAndMenus
    const spaceForButtons = needMenu
      ? spaceForButtonsAndMenus - moreButtonReservedWidth
      : spaceForButtonsAndMenus
    // sum widths fitting into spaceForButtons
    const newButtons = []
    const newMenus = []
    let widthSum = 0
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [index, child] of Children.toArray(visibleChildren).entries()) {
      const width = getChildBaseWidth(child)
      const widthWithGap = width + (newButtons.length > 0 ? buttonGap : 0)
      if (widthSum + widthWithGap > spaceForButtons) {
        newMenus.push(cloneElement(child, { inmenu: 'true' }))
      } else {
        newButtons.push(cloneElement(child))
        widthSum += widthWithGap
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
  }

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
  }, [rerenderer, children])

  // set up a resize observer for the container
  const observer = useMemo(
    () =>
      new ResizeObserver((entries) => {
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
      }),
    [checkOverflowDebounced],
  )

  useBeforeunload(() => {
    // console.log('MenuBar disconnecting resize observer')
    observer.disconnect()
  })

  const previousWidthRef = useRef(null)
  useEffect(() => {
    if (!outerContainerRef.current) {
      // console.log('MenuBar.useEffect, no containerRef')
      return
    }

    observer.observe(outerContainerRef.current)
  }, [rerenderer, observer, outerContainerRef])

  return (
    <div
      ref={outerContainerRef}
      style={
        !grow
          ? ({
              flexBasis: `${requiredButtonsWidth}px`,
              width: `${requiredButtonsWidth}px`,
              maxWidth: '100%',
            } as React.CSSProperties)
          : undefined
      }
      className={`${styles.measuredOuterContainer} ${!showBorder ? styles.noBorder : ''} ${!grow ? styles.noGrow : ''}`}
    >
      {titleComponent}
      <div
        style={
          {
            '--menu-max-width': `${Math.abs(outerContainerWidth ?? 0) - (titleComponentWidth ?? 0)}px`,
            '--menu-required-width': `${requiredButtonsWidth}px`,
          } as React.CSSProperties
        }
        className={`${styles.stylingContainer} ${styles.stylingContainerSized}`}
      >
        <div className={globalStyles.controls}>{buttons}</div>
        {!!menus.length && (
          <Menu className="menubar-menu">
            <MenuTrigger>
              <Tooltip content="More Actions">
                <Button
                  size="medium"
                  icon={<FaBars />}
                  className={styles.button}
                />
              </Tooltip>
            </MenuTrigger>
            <MenuPopover className={styles.menuPopover}>
              <MenuList
                // GOAL: close menu on click on menu item
                // TODO: prevents more menu opening on very narrow screens
                className={`${styles.menuContent} menubar-more-menus`}
              >
                {menus}
              </MenuList>
            </MenuPopover>
          </Menu>
        )}
      </div>
    </div>
  )
}
