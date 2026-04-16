import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { useIntl } from 'react-intl'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { docsMeta } from '../../docs/metadata.ts'

import '../form.css'

const { Field, Input, RadioGroup, Radio } = fluentUiReactComponents

type TypeFilter = 'all' | 'contentual' | 'technical'

export const DocsList = () => {
  const { formatMessage } = useIntl()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [textFilter, setTextFilter] = useState('')

  const label = formatMessage({ id: 'docsList', defaultMessage: 'Docs' })
  const nameSingular = formatMessage({
    id: 'docSingular',
    defaultMessage: 'Doc',
  })

  const filtered = docsMeta.filter((doc) => {
    if (typeFilter === 'technical' && !doc.isTechnical) return false
    if (typeFilter === 'contentual' && doc.isTechnical) return false
    if (
      textFilter &&
      !doc.label.toLowerCase().includes(textFilter.toLowerCase())
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
        <Field>
          <RadioGroup
            value={typeFilter}
            onChange={(_, data) => setTypeFilter(data.value as TypeFilter)}
          >
            <Radio
              value="all"
              label={formatMessage({
                id: 'docsFilterAll',
                defaultMessage: 'Alle',
              })}
            />
            <Radio
              value="contentual"
              label={formatMessage({
                id: 'docsFilterContentual',
                defaultMessage: 'Inhaltlich',
              })}
            />
            <Radio
              value="technical"
              label={formatMessage({
                id: 'docsFilterTechnical',
                defaultMessage: 'Technisch',
              })}
            />
          </RadioGroup>
        </Field>
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
        {filtered.map(({ id, label }) => (
          <Row key={id} label={label} to={`/docs/${id}`} />
        ))}
      </div>
    </div>
  )
}
