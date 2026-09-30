import * as icons from 'react-icons/md'

import { Label } from '../../../components/shared/Label.tsx'
import type { FieldChangeHandler } from '../../../components/shared/fieldChange.ts'
import { MarkerSymbol } from './Symbol.tsx'
import styles from './index.module.css'

interface Props {
  onChange: FieldChangeHandler
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
          const Component = (
            icons as Record<string, React.ComponentType<{ className?: string }>>
          )[key]

          return (
            <MarkerSymbol
              key={key}
              Component={Component}
              name={key}
              onChange={onChange!}
              active={value === key}
            />
          )
        })}
      </div>
    </>
  )
}
