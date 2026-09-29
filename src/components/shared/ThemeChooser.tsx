import { useAtom } from 'jotai'
import { defineMessages, useIntl } from 'react-intl'
import { MdBrightnessAuto, MdDarkMode, MdLightMode } from 'react-icons/md'
import type { ComponentType } from 'react'

import { themeModeAtom, type ThemeMode } from '../../store.ts'
import styles from './ThemeChooser.module.css'

// cycling order: system > light > dark > system
const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const MODE_ICONS: Record<ThemeMode, ComponentType> = {
  system: MdBrightnessAuto,
  light: MdLightMode,
  dark: MdDarkMode,
}

// defineMessages lets formatjs extract the ids statically
const MODE_LABELS = defineMessages({
  system: {
    id: 'themeModeSystem',
    defaultMessage: 'Darstellung: wie System',
  },
  light: { id: 'themeModeLight', defaultMessage: 'Darstellung: hell' },
  dark: { id: 'themeModeDark', defaultMessage: 'Darstellung: dunkel' },
})

export const ThemeChooser = () => {
  const [themeMode, setThemeMode] = useAtom(themeModeAtom)
  const intl = useIntl()

  const label = intl.formatMessage(MODE_LABELS[themeMode])
  const Icon = MODE_ICONS[themeMode]

  return (
    <button
      type="button"
      className={styles.button}
      title={label}
      aria-label={label}
      onClick={() => setThemeMode(NEXT_MODE[themeMode])}
    >
      <Icon />
    </button>
  )
}
