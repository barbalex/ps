import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Label, Text, tokens } = fluentUiReactComponents

import styles from './SqlEditorField.module.css'

type Props = {
  label?: string
  name: string
  value: string | null | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  hint?: string
  validationMessage?: string
  validationState?: 'none' | 'error' | 'warning' | 'success'
}

export const SqlEditorField = ({
  label,
  name,
  value,
  onChange,
  hint,
  validationMessage,
  validationState = 'none',
}: Props) => {
  const handleChange = useCallback(
    (val: string) => {
      onChange({
        target: { name, value: val },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    },
    [name, onChange],
  )

  return (
    <div className={styles.container}>
      {label && <Label className={styles.label}>{label}</Label>}
      {hint && (
        <Text size={200} className={styles.hint}>
          {hint}
        </Text>
      )}
      <div
        className={styles.editorWrapper}
        style={
          validationState === 'error'
            ? { outline: `2px solid ${tokens.colorPaletteRedBorder2}` }
            : validationState === 'warning'
              ? { outline: `2px solid ${tokens.colorPaletteYellowBorder2}` }
              : {}
        }
      >
        <CodeMirror
          value={value ?? ''}
          extensions={[sql(), EditorView.lineWrapping]}
          theme={oneDark}
          onChange={handleChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: true,
          }}
          style={{ fontSize: '13px' }}
        />
      </div>
      {validationMessage && validationState !== 'none' && (
        <Text
          size={200}
          className={
            validationState === 'error'
              ? styles.validationError
              : styles.validationWarning
          }
        >
          {validationMessage}
        </Text>
      )}
    </div>
  )
}
