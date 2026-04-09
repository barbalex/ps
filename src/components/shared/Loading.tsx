import * as fluentUiReactComponents from '@fluentui/react-components'
const { Spinner } = fluentUiReactComponents

import styles from './Loading.module.css'

export const Loading = ({
  label,
  alignLeft = false,
  size = 'medium',
}) => (
  <div className={`${styles.container}${alignLeft ? ` ${styles.containerAlignLeft}` : ''}`}>
    <Spinner labelPosition="below" label={label} size={size} />
  </div>
)
