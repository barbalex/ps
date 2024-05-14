import { memo } from 'react'
import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
} from 'react-icons/md'
import { HiMiniMinusSmall as NoChildrenIcon } from 'react-icons/hi2'
import { Button } from '@fluentui/react-components'
import { Link, useSearchParams } from 'react-router-dom'

import { css } from '../../css.ts'

const containerStyle = {
  display: 'grid',
  userSelect: 'none',
  gridTemplateAreas: `'spacer toggle content'`,
  // do not layout offscreen content while allowing search
  // https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 22px',
}
const toggleStyle = {
  borderRadius: 20,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'rgb(51, 51, 51) !important',
  gridArea: 'toggle',
  display: 'inline',
  minWidth: 22,
  height: 22,
}
const contentStyle = { gridArea: 'content', paddingLeft: 4 }
const contentLinkStyle = {
  fontSize: '1em',
  lineHeight: '1.5em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textDecoration: 'none',
  color: 'rgb(51, 51, 51)',
}
const contentSiblingStyle = {
  marginLeft: 5,
  display: 'inline',
}
const svgStyle = {
  color: 'rgb(51, 51, 51)',
}

const contentLabelStyle = { cursor: 'default', userSelect: 'none' }

interface Props {
  isInActiveNodeArray: boolean
  isActive: boolean
  isOpen: boolean
  level: number
  node: { label: string }
  id: string
  childrenCount: number
  to: string
  onClickButton: () => void
  sibling?: React.ReactNode
}

export const Node = memo(
  ({
    isInActiveNodeArray,
    isActive,
    isOpen,
    level,
    node,
    // id is used as a backup in case the label trigger did not work
    id,
    childrenCount,
    to,
    onClickButton,
    sibling,
  }: Props) => {
    const [searchParams] = useSearchParams()
    console.log('hello level:', level)

    return (
      <div
        style={{
          ...containerStyle,
          fontWeight: isInActiveNodeArray ? 'bold' : 'normal',
          ...(isActive && { color: 'red' }),
          gridTemplateColumns: `${(level - 1) * 20 + 5}px 20px 1fr`,
        }}
      >
        <div style={{ gridArea: 'spacer' }} />
        <Button
          aria-label="toggle"
          size="small"
          icon={
            !childrenCount ? (
              <NoChildrenIcon style={svgStyle} />
            ) : isOpen ? (
              <OpenWithChildrenIcon style={svgStyle} />
            ) : (
              <ClosedWithChildrenIcon style={svgStyle} />
            )
          }
          onClick={onClickButton}
          disabled={!childrenCount}
          style={{
            ...toggleStyle,
            ...(!childrenCount && { cursor: 'default' }),
          }}
        />
        <div style={contentStyle}>
          {isActive ? (
            <span style={contentLabelStyle}>
              {node.label ?? id ?? '(missing label)'}
            </span>
          ) : (
            <Link
              style={css({
                ...contentLinkStyle,
                on: ($) => [
                  $('&:hover', {
                    fontWeight: 'bold',
                  }),
                ],
              })}
              to={{ pathname: to, search: searchParams.toString() }}
            >
              {node.label ?? id ?? '(missing label)'}
            </Link>
          )}
          {!!sibling && <div style={contentSiblingStyle}>{sibling}</div>}
        </div>
      </div>
    )
  },
)
