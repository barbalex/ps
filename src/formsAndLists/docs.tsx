import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { useIntl } from 'react-intl'
import { useAtom } from 'jotai'
import { useParams } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { docsMeta, type DocMeta } from '../../docs/metadata.ts'
import { languageAtom, type Language } from '../store.ts'

import '../form.css'

const { Input, ToggleButton } = fluentUiReactComponents

type TypeFilter = 'all' | 'contentual' | 'technical'

const getLabel = (doc: DocMeta, lang: Language): string =>
  (lang !== 'de'
    ? (doc[`label_${lang}` as keyof DocMeta] as string | undefined)
    : undefined) ?? doc.label_de

export const DocsList = () => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const { docId } = useParams({ strict: false })
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [textFilter, setTextFilter] = useState('')

  const label = formatMessage({
    id: 'docsList',
    defaultMessage: 'Dokumentation',
  })
  const nameSingular = formatMessage({
    id: 'docSingular',
    defaultMessage: 'Doc',
  })

  const filtered = docsMeta.filter((doc) => {
    if (typeFilter === 'technical' && !doc.isTechnical) return false
    if (typeFilter === 'contentual' && doc.isTechnical) return false
    if (
      textFilter &&
      !getLabel(doc, language).toLowerCase().includes(textFilter.toLowerCase())
    )
      return false
    return true
  })

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} />
      <div
        style={{
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', gap: 2 }}>
          {(['all', 'contentual', 'technical'] as const).map((value) => {
            const checked = typeFilter === value
            return (
              <ToggleButton
                key={value}
                size="small"
                checked={checked}
                onClick={() => setTypeFilter(value)}
                style={{
                  flex: 1,
                  ...(checked && {
                    backgroundColor: 'rgba(38, 82, 37, 0.85)',
                    color: 'white',
                    borderColor: 'rgba(38, 82, 37, 0.85)',
                  }),
                }}
              >
                {formatMessage({
                  id:
                    value === 'all'
                      ? 'docsFilterAll'
                      : value === 'contentual'
                        ? 'docsFilterContentual'
                        : 'docsFilterTechnical',
                  defaultMessage:
                    value === 'all'
                      ? 'Alle'
                      : value === 'contentual'
                        ? 'Inhaltlich'
                        : 'Technisch',
                })}
              </ToggleButton>
            )
          })}
        </div>
        <Input
          appearance="underline"
          placeholder={formatMessage({
            id: 'docsFilterText',
            defaultMessage: 'Filtern...',
          })}
          value={textFilter}
          onChange={(_, data) => setTextFilter(data.value)}
        />
      </div>
      <div className="list-container">
        {filtered.map((doc) => (
          <Row
            key={doc.id}
            label={getLabel(doc, language)}
            to={`/docs/${doc.id}`}
            isActive={doc.id === docId}
          />
        ))}
      </div>
    </div>
  )
}
