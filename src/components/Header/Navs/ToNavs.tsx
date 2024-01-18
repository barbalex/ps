import { memo } from 'react'
import { OverflowItem } from '@fluentui/react-components'

import { Nav } from './Nav'

export const ToNavs = memo(({ tos }) =>
  tos.map((to) => (
    <OverflowItem key={to.path} id={to.path}>
      <Nav to={to.path} label={to.text} />
    </OverflowItem>
  )),
)
