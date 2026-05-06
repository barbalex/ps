import { useRef, useEffect, useState } from 'react'
import { useAtom } from 'jotai'

import { languageAtom, type Language } from '../../store.ts'
import styles from './LanguageChooser.module.css'

const LANGUAGES: Language[] = ['en', 'de', 'fr', 'it']

interface Props {
  width?: number
}

export const LanguageChooser = (_props: Props) => {
  const [language, setLanguage] = useAtom(languageAtom)
  const [open, setOpen] = useState(false)
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        popupRef.current && !popupRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPopupPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen((v) => !v)
  }

  const handleSelect = (lang: Language) => {
    setLanguage(lang)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.summary}
        title="Choose language"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {language.toUpperCase()}
      </button>
      {open && (
        <ul
          ref={popupRef}
          className={styles.popup}
          style={{ top: popupPos.top, right: popupPos.right }}
          role="listbox"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang}>
              <button
                className={`${styles.option} ${language === lang ? styles.menuItemActive : ''}`}
                onClick={() => handleSelect(lang)}
              >
                {lang.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
