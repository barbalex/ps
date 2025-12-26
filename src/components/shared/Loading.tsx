import { Spinner } from '@fluentui/react-components'

import styles from './Loading.module.css'

export const Loading = ({
  label,
  alignLeft = false,
  size = 'medium',
  width,
}) => (
  <div
    style={{
      justifyContent: alignLeft ? 'flex-start' : 'center',
      ...(width ? { width } : {}),
    }}
    className={styles.container}
  >
    <Spinner labelPosition="below" label={label} size={size} />
  </div>
)
