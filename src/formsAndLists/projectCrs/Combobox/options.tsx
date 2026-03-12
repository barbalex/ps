import * as fluentUiReactComponents from '@fluentui/react-components'
import { useIntl } from 'react-intl'

const { Option } = fluentUiReactComponents

export const Options = ({ filter, optionsFiltered }) => {
  const { formatMessage } = useIntl()

  if (filter.length < 2) {
    return (
      <Option
        key={0}
        value={0}
      >{formatMessage({ id: 'Ef8FgG', defaultMessage: '2 oder mehr Zeichen eingeben zum Filtern' })}</Option>
    )
  }
  if (!optionsFiltered.length) {
    return (
      <Option
        key={0}
        value={0}
      >{formatMessage({ id: 'Hi9IjJ', defaultMessage: 'Kein Wert gefunden, der \u201e{filter}\u201c enth\u00e4lt.' }, { filter })}</Option>
    )
  }

  return optionsFiltered.map(({ code, name }) => (
    <Option
      key={code}
      value={code}
    >
      {`${code}: ${name}`}
    </Option>
  ))
}
