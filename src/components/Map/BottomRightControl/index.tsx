import { useAtomValue } from 'jotai'

import { UiButton } from './UiButton.tsx'
import { VerticalButtons } from './VerticalButtons/index.tsx'
import { HorizontalButtons } from './HorizontalButtons/index.tsx'
import { mapHideUiAtom } from '../../../store.ts'
import styles from './index.module.css'

export const BottomRightControl = () => {
  const hideMapUi = useAtomValue(mapHideUiAtom)

  return (
    <div className={styles.container}>
      {!hideMapUi && (
        <>
          <VerticalButtons />
          <HorizontalButtons />
        </>
      )}
      <UiButton />
    </div>
  )
}
