import * as fluentUiReactComponents from '@fluentui/react-components'
const { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, MenuButton } =
  fluentUiReactComponents
import { useAtom } from 'jotai'

import { languageAtom, type Language } from '../../store.ts'
import styles from './LanguageChooser.module.css'

const LANGUAGES: Language[] = ['en', 'de', 'fr', 'it']

interface Props {
  width?: number
}

export const LanguageChooser = (_props: Props) => {
  const [language, setLanguage] = useAtom(languageAtom)

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton
          size="medium"
          appearance="transparent"
          className={styles.button}
          title="Choose language"
        >
          {language.toUpperCase()}
        </MenuButton>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang}
              onClick={() => setLanguage(lang)}
            >
              <span
                className={language === lang ? styles.menuItemActive : undefined}
              >
                {lang.toUpperCase()}
              </span>
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
