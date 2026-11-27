import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import {
  Button,
  Field,
  Textarea,
  useMergedRefs,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogBody,
  Input,
} from '@fluentui/react-components'
import {
  TextBoldRegular,
  TextItalicRegular,
  TextBulletListLtrRegular,
  TextNumberListLtrRegular,
  LinkRegular,
  MoreHorizontalRegular,
  ArrowUndoRegular,
  ArrowRedoRegular,
} from '@fluentui/react-icons'
import { useIntl } from 'react-intl'

import type { Editor } from '@tiptap/core'
import {
  applyMarkdownEdit,
  formatMarkdownSelection,
} from '../../modules/formatMarkdownSelection.ts'
import styles from './MarkdownField.module.css'

const Markdown = lazy(() => import('./Markdown.tsx'))
const RichTextInput = lazy(() => import('./RichTextInput.tsx'))

type Props = {
  label?: string | null
  name: string
  value: string
  onSave: (value: string) => void
  rich?: boolean
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
  onSave,
  rich,
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
  const submitted = useRef<string | null>(null)
  const [preview, setPreview] = useState(false)
  const editor = useRef<HTMLTextAreaElement>(null)
  const richEditor = useRef<Editor | null>(null)
  const mergedRef = useMergedRefs(editor, ref)
  const [link, setLink] = useState<{
    start: number
    end: number
    text: string
    url: string
  } | null>(null)
  const linkLabel = formatMessage({
    id: 'mdLink',
    defaultMessage: 'Link einfügen',
  })
  const format = (kind: Parameters<typeof formatMarkdownSelection>[3]) => {
    if (rich) {
      const chain = richEditor.current?.chain().focus()
      if (!chain) return
      switch (kind) {
        case 'bold':
          return chain.toggleBold().run()
        case 'italic':
          return chain.toggleItalic().run()
        case 'paragraph':
          return chain.clearNodes().setParagraph().run()
        case 'heading':
          return chain.setHeading({ level: 2 }).run()
        case 'subheading':
          return chain.setHeading({ level: 3 }).run()
        case 'bullets':
          return chain.toggleBulletList().run()
        case 'numbers':
          return chain.toggleOrderedList().run()
      }
    }
    const el = editor.current
    if (el)
      applyMarkdownEdit(
        el,
        formatMarkdownSelection(
          el.value,
          el.selectionStart,
          el.selectionEnd,
          kind,
        ),
      )
  }
  const openLink = () => {
    if (rich && richEditor.current) {
      if (richEditor.current.state.selection.empty)
        richEditor.current.commands.extendMarkRange('link')
      const { state } = richEditor.current
      const { from, to } = state.selection
      setLink({
        start: from,
        end: to,
        text: state.doc.textBetween(from, to, ' '),
        url: richEditor.current.getAttributes('link').href ?? '',
      })
      return
    }
    const el = editor.current
    if (el)
      setLink({
        start: el.selectionStart,
        end: el.selectionEnd,
        text: el.value.substring(el.selectionStart, el.selectionEnd),
        url: '',
      })
  }
  const validLink =
    link && URL.canParse(link.url) && /^(https?:\/\/|mailto:)/i.test(link.url)
  const insertLink = () => {
    if (!validLink) return
    if (rich && richEditor.current) {
      const instance = richEditor.current
      const range = { from: link.start, to: link.end }
      const chain = instance.chain().focus()
      if (
        link.text &&
        instance.state.doc.textBetween(range.from, range.to, ' ') === link.text
      ) {
        chain
          .setTextSelection(range)
          .setLink({ href: link.url })
          .setTextSelection(range.to)
      } else {
        chain.insertContentAt(range, {
          type: 'text',
          text: link.text || link.url,
          marks: [{ type: 'link', attrs: { href: link.url } }],
        })
      }
      chain.unsetMark('link').run()
      setLink(null)
      return
    }
    if (!editor.current) return
    const url = new URL(link.url).href.replace(/[()]/g, (c) =>
      c === '(' ? '%28' : '%29',
    )
    const text = (link.text || link.url).replace(/[\\[\]*_`]/g, '\\$&')
    const markdown = `[${text}](${url})`
    setLink(null)
    applyMarkdownEdit(editor.current, {
      from: link.start,
      to: link.end,
      text: markdown,
      start: link.start + markdown.length,
      end: link.start + markdown.length,
    })
  }
  const headings = [
    {
      label: formatMessage({ id: 'mdParagraph', defaultMessage: 'Absatz' }),
      run: () => format('paragraph'),
    },
    {
      label: formatMessage({ id: 'mdHeading', defaultMessage: 'Überschrift' }),
      run: () => format('heading'),
    },
    {
      label: formatMessage({
        id: 'mdSubheading',
        defaultMessage: 'Unterüberschrift',
      }),
      run: () => format('subheading'),
    },
  ]
  const emphasis = [
    {
      label: formatMessage({ id: 'mdBold', defaultMessage: 'Fett' }),
      icon: <TextBoldRegular />,
      run: () => format('bold'),
    },
    {
      label: formatMessage({ id: 'mdItalic', defaultMessage: 'Kursiv' }),
      icon: <TextItalicRegular />,
      run: () => format('italic'),
    },
  ]
  const extra = [
    {
      label: formatMessage({ id: 'mdBullets', defaultMessage: 'Aufzählung' }),
      icon: <TextBulletListLtrRegular />,
      run: () => format('bullets'),
    },
    {
      label: formatMessage({
        id: 'mdNumbers',
        defaultMessage: 'Nummerierte Liste',
      }),
      icon: <TextNumberListLtrRegular />,
      run: () => format('numbers'),
    },
    { label: linkLabel, icon: <LinkRegular />, run: openLink },
    ...(rich ?
      [
        {
          label: formatMessage({
            id: 'undoDeleteUndo',
            defaultMessage: 'Rückgängig',
          }),
          icon: <ArrowUndoRegular />,
          run: () => richEditor.current?.chain().focus().undo().run(),
        },
        {
          label: formatMessage({
            id: 'geometryRedo',
            defaultMessage: 'Wiederholen',
          }),
          icon: <ArrowRedoRegular />,
          run: () => richEditor.current?.chain().focus().redo().run(),
        },
      ]
    : []),
  ]
  const actionButton = ({ label, icon, run }: (typeof extra)[number]) => (
    <Button
      key={label}
      type="button"
      size="small"
      title={label}
      aria-label={label}
      icon={icon}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    />
  )
  const actionMenu = (
    label: string,
    items: { label: string; run: () => void }[],
    more = false,
  ) => (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          type="button"
          size="small"
          aria-label={label}
          title={label}
          icon={more ? <MoreHorizontalRegular /> : undefined}
        >
          {more ? undefined : label}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {items.map((item) => (
            <MenuItem
              key={item.label}
              onClick={item.run}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
  useEffect(() => {
    // Focusing a toolbar menu blurs and saves the textarea. Its live-query
    // acknowledgement can arrive after the menu has applied the next edit.
    if (submitted.current !== value) setDraft(value)
    submitted.current = null
  }, [value])

  return (
    <Field
      className={styles.field}
      label={{ children: label ?? name, htmlFor: id }}
      validationState={validationState}
      validationMessage={validationMessage}
    >
      {!print && (
        <div className={styles.controls}>
          {!preview && (
            <>
              <span className={styles.wide}>
                {actionMenu(
                  formatMessage({ id: 'mdStyle', defaultMessage: 'Textstil' }),
                  headings,
                )}
              </span>
              {emphasis.map(actionButton)}
              <span className={styles.wide}>{extra.map(actionButton)}</span>
              <span className={styles.narrow}>
                {actionMenu(
                  formatMessage({
                    id: 'mdMore',
                    defaultMessage: 'Weitere Formate',
                  }),
                  [...headings, ...extra],
                  true,
                )}
              </span>
            </>
          )}
          {!rich && (
            <Button
              className={styles.preview}
              size="small"
              type="button"
              onClick={() => setPreview(!preview)}
            >
              {preview ?
                formatMessage({ id: 'bCYCZD', defaultMessage: 'Bearbeiten' })
              : formatMessage({ id: 'prVw0A', defaultMessage: 'Vorschau' })}
            </Button>
          )}
          {button}
        </div>
      )}
      {rich && (
        <Suspense fallback={<pre>{value}</pre>}>
          <RichTextInput
            id={id}
            label={label ?? name}
            value={value}
            print={print}
            autoFocus={autoFocus}
            editorRef={richEditor}
            onLink={openLink}
            onSave={onSave}
          />
        </Suspense>
      )}
      {!rich && !preview && !print && (
        <Textarea
          id={id}
          name={name}
          ref={mergedRef}
          autoFocus={autoFocus}
          resize="vertical"
          rows={4}
          className={styles.editor}
          value={draft}
          onChange={(_, data) => setDraft(data.value)}
          onKeyDown={(e) => {
            if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return
            const key = e.key.toLowerCase()
            if (!['b', 'i', 'k'].includes(key)) return
            e.preventDefault()
            if (key === 'k') openLink()
            else format(key === 'b' ? 'bold' : 'italic')
          }}
          onBlur={() => {
            if (draft !== value) {
              submitted.current = draft
              onSave(draft)
            }
          }}
        />
      )}
      {link && (
        <Dialog
          open
          onOpenChange={(_, data) => {
            if (!data.open) setLink(null)
          }}
        >
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{linkLabel}</DialogTitle>
              <DialogContent>
                <Field
                  label={formatMessage({
                    id: 'lVTypeText',
                    defaultMessage: 'Text',
                  })}
                >
                  <Input
                    value={link.text}
                    onChange={(_, data) =>
                      setLink({ ...link, text: data.value })
                    }
                  />
                </Field>
                <Field
                  label={formatMessage({ id: 'Yb8ZcE', defaultMessage: 'URL' })}
                >
                  <Input
                    type="url"
                    placeholder="https://…"
                    value={link.url}
                    onChange={(_, data) =>
                      setLink({ ...link, url: data.value })
                    }
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button
                  type="button"
                  onClick={() => setLink(null)}
                >
                  {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
                </Button>
                <Button
                  type="button"
                  appearance="primary"
                  disabled={!validLink}
                  onClick={insertLink}
                >
                  {linkLabel}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
      {!rich && (
        <div className={preview || print ? styles.rendered : styles.printOnly}>
          <Suspense fallback={<pre>{draft}</pre>}>
            <Markdown
              source={draft}
              skipHtml
            />
          </Suspense>
        </div>
      )}
    </Field>
  )
}
