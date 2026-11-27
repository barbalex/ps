import { lazy, Suspense, useEffect, useId, useState } from 'react'
import { Button, Field, Textarea } from '@fluentui/react-components'
import { useIntl } from 'react-intl'

import type { FieldChangeHandler } from './fieldChange.ts'
import styles from './MarkdownField.module.css'

const Markdown = lazy(() => import('./Markdown.tsx'))

type Props = {
  label?: string | null
  name: string
  value: string
  onChange: FieldChangeHandler
  print?: boolean
  autoFocus?: boolean
  ref?: React.Ref<HTMLTextAreaElement>
  button?: React.ReactNode
  validationState?: 'error'
  validationMessage?: string
}

export const MarkdownField = ({
  label,
  name,
  value,
  onChange,
  print,
  button,
  ref,
  autoFocus,
  validationState,
  validationMessage,
}: Props) => {
  const { formatMessage } = useIntl()
  const id = useId()
  const [draft, setDraft] = useState(value)
  const [preview, setPreview] = useState(false)
  useEffect(() => setDraft(value), [value])

  return (
    <Field
      label={{ children: label ?? name, htmlFor: id }}
      validationState={validationState}
      validationMessage={validationMessage}
    >
      {!print && (
        <div className={styles.controls}>
          <Button
            size="small"
            type="button"
            onClick={() => setPreview(!preview)}
          >
            {preview ?
              formatMessage({ id: 'bCYCZD', defaultMessage: 'Bearbeiten' })
            : formatMessage({ id: 'prVw0A', defaultMessage: 'Vorschau' })}
          </Button>
          {button}
        </div>
      )}
      {!preview && !print && (
        <Textarea
          id={id}
          name={name}
          ref={ref}
          autoFocus={autoFocus}
          resize="vertical"
          rows={4}
          className={styles.editor}
          value={draft}
          onChange={(_, data) => setDraft(data.value)}
          onBlur={(e) => {
            if (draft !== value) onChange(e)
          }}
        />
      )}
      <div className={preview || print ? styles.rendered : styles.printOnly}>
        <Suspense fallback={<pre>{draft}</pre>}>
          <Markdown
            source={draft}
            skipHtml
          />
        </Suspense>
      </div>
    </Field>
  )
}
