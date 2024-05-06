import { memo } from 'react'
import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
} from 'react-icons/md'
import { HiMiniMinusSmall as NoChildrenIcon } from 'react-icons/hi2'
import { Button } from '@fluentui/react-components'
import { Link, useSearchParams } from 'react-router-dom'

import { css } from '../../css.ts'

const buttonStyle = {
  borderRadius: 20,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'rgb(51, 51, 51) !important',
}
const siblingStyle = {
  marginLeft: 5,
}
const svgStyle = {
  color: 'rgb(51, 51, 51)',
}

const labelSpanStyle = { cursor: 'default', userSelect: 'none' }

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

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: isInActiveNodeArray ? 'bold' : 'normal',
          ...(isActive && { color: 'red' }),
          marginLeft: level * 20 - 15,
          justifyContent: 'flex-start',
          userSelect: 'none',
        }}
      >
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
            ...buttonStyle,
            ...(!childrenCount && { cursor: 'default' }),
          }}
        />
        {isActive ? (
          <span style={labelSpanStyle}>
            {node.label ?? id ?? '(missing label)'}
          </span>
        ) : (
          <Link
            style={css({
              fontSize: '1em',
              lineHeight: '1.5em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textDecoration: 'none',
              color: 'rgb(51, 51, 51)',
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
        {!!sibling && <div style={siblingStyle}>{sibling}</div>}
      </div>
    )
  },
)
