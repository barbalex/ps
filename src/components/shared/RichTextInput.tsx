import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'

import styles from './MarkdownField.module.css'

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      openOnClick: false,
      isAllowedUri: (url) => /^(https?:\/\/|mailto:)/i.test(url),
    },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    trailingNode: false,
  }),
  Markdown,
]

type Props = {
  id: string
  label: string
  value: string
  print?: boolean
  autoFocus?: boolean
  editorRef: React.RefObject<Editor | null>
  onSave: (value: string) => void
  onLink: () => void
}

export default function RichTextInput({
  id,
  label,
  value,
  print,
  autoFocus,
  editorRef,
  onSave,
  onLink,
}: Props) {
  const dirty = useRef(false)
  const editor = useEditor({
    extensions,
    content: value,
    contentType: 'markdown',
    editable: !print,
    autofocus: !!autoFocus && !print,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-label': label,
        'aria-multiline': 'true',
        'aria-readonly': String(!!print),
      },
    },
    onUpdate: () => {
      dirty.current = true
    },
    onBlur: ({ editor }) => {
      if (!dirty.current || print) return
      dirty.current = false
      const source = editor.isEmpty ? '' : editor.getMarkdown()
      if (source !== value) onSave(source)
    },
  })
  useEffect(() => {
    editorRef.current = editor
    return () => {
      editorRef.current = null
    }
  }, [editor, editorRef])
  useEffect(() => {
    if (editor && !dirty.current && editor.getMarkdown() !== value) {
      editor.commands.setContent(value, {
        contentType: 'markdown',
        emitUpdate: false,
      })
    }
  }, [editor, value])

  return (
    <EditorContent
      editor={editor}
      className={styles.richText}
      onKeyDownCapture={(e) => {
        if (!print && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault()
          onLink()
        }
      }}
    />
  )
}
