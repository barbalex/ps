import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { docsMeta } from '../../docs/metadata.ts'

import '../form.css'

const from = '/_layout/docs'

export const DocsList = () => {
  const { formatMessage } = useIntl()
  useNavigate({ from })

  const label = formatMessage({ id: 'docsList', defaultMessage: 'Docs' })
  const nameSingular = formatMessage({ id: 'docSingular', defaultMessage: 'Doc' })

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
      />
      <div className="list-container">
        {docsMeta.map(({ id, label }) => (
          <Row
            key={id}
            label={label}
            to={id}
          />
        ))}
      </div>
    </div>
  )
}
