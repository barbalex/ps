import * as icons from 'react-icons/md'
import type { InputProps } from '@fluentui/react-components'

import { Label } from '../../../components/shared/Label.tsx'
import { Symbol } from './Symbol.tsx'
import styles from './index.module.css'

interface Props {
  onChange: InputProps['onChange']
  value: string | undefined
}

export const MarkerSymbolPicker = ({ onChange, value }: Props) => {
  const wantedIconKeys = Object.keys(icons)
    .filter((key) => !key.endsWith('Mp'))
    .filter((key) => !key.endsWith('K'))
    .filter((key) => !key.endsWith('KPlus'))

  // TODO: use fluent ui Label?
  return (
    <>
      <Label label="Symbol" />
      <div className={styles.symbolContainer}>
        {wantedIconKeys.map((key) => {
          const Component = icons[key]

          return (
            <Symbol
              key={key}
              Component={Component}
              name={key}
              onChange={onChange}
              active={value === key}
            />
          )
        })}
      </div>
    </>
  )
}
