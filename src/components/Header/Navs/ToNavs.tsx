// import { memo } from 'react'
import { OverflowItem } from '@fluentui/react-components'

import { Nav } from './Nav'

export const ToNavs = ({ tos }) =>
  tos.map((to) => {
    return (
      <OverflowItem key={to.path} id={`${to.path}/nav`}>
        <Nav to={to.path} label={to.text} />
      </OverflowItem>
    )
  })
