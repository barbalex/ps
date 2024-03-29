import React, { useState, useCallback } from 'react'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import { motion, useAnimation } from 'framer-motion'

import { Legends } from './Legends'

const cardContainerStyle = {
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  borderRadius: 5,
  outline: '2px solid rgba(0, 0, 0, 0.2)',
}
const cardStyle = {
  paddingTop: 3,
  color: 'rgb(48, 48, 48)',
}
const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  paddingLeft: 7,
  paddingRight: 2,
  cursor: 'pointer',
  fontWeight: 'bold',
  userSelect: 'none',
  height: 21,
}

const cardTitleStyle = {
  paddingRight: 5,
}

const cardTitleOpenStyle = {
  paddingRight: 5,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: 70,
}
const expandLessIconStyle = {
  height: '18px !important',
  fontSize: '1.5rem',
}
const expandMoreIconStyle = {
  height: '18px !important',
  fontSize: '1.5rem',
}

export const LegendsControl = () => {
  const anim = useAnimation()
  const [legendsExpanded, setLegendsExpanded] = useState<boolean>(false)

  const onToggleApfloraLayersExpanded = useCallback(async () => {
    if (legendsExpanded) {
      await anim.start({ opacity: 0 })
      await anim.start({ height: 0 })
      await anim.start({ width: 108 })
      setLegendsExpanded(false)
    } else {
      setLegendsExpanded(true)
      setTimeout(async () => {
        await anim.start({ height: 'auto' })
        await anim.start({ width: 'auto' })
        await anim.start({ opacity: 1 })
      })
    }
  }, [anim, legendsExpanded])

  return (
    <div style={cardContainerStyle}>
      <div style={cardStyle}>
        <div
          onClick={onToggleApfloraLayersExpanded}
          open={legendsExpanded}
          style={{
            ...cardHeaderStyle,
            ...(legendsExpanded
              ? { borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }
              : {}),
          }}
        >
          <div style={legendsExpanded ? cardTitleStyle : cardTitleOpenStyle}>
            Legenden
          </div>
          <div>
            {legendsExpanded ? (
              <MdExpandLess style={expandLessIconStyle} />
            ) : (
              <MdExpandMore style={expandMoreIconStyle} />
            )}
          </div>
        </div>
        <motion.div animate={anim} transition={{ type: 'just', duration: 0.2 }}>
          {legendsExpanded && <Legends />}
        </motion.div>
      </div>
    </div>
  )
}
