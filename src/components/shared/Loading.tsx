import * as fluentUiReactComponents from '@fluentui/react-components'
const { Spinner } = fluentUiReactComponents

import styles from './Loading.module.css'

type SpinnerProps = React.ComponentProps<typeof Spinner>

type Props = {
  label?: SpinnerProps['label']
  alignLeft?: boolean
  size?:
    | 'extra-tiny'
    | 'tiny'
    | 'extra-small'
    | 'small'
    | 'medium'
    | 'large'
    | 'extra-large'
    | 'huge'
}

export const Loading = ({
  label,
  alignLeft = false,
  size = 'medium',
}: Props) => (
  <div className={`${styles.container}${alignLeft ? ` ${styles.containerAlignLeft}` : ''}`}>
    <Spinner labelPosition="below" label={label} size={size} />
  </div>
)
