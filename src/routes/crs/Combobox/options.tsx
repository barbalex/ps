import { memo } from 'react'
import { Option } from '@fluentui/react-components'

export const Options = memo(({ filter, optionsFiltered }) => {
  if (filter.length < 2) {
    return (
      <Option key={0} value={0}>{`Type 2 or more characters to filter`}</Option>
    )
  }
  if (!optionsFiltered.length) {
    return (
      <Option
        key={0}
        value={0}
      >{`No value found containing "${filter}".`}</Option>
    )
  }

  return optionsFiltered.map(({ code, name }) => (
    <Option key={code} value={code}>
      {`${code}: ${name}`}
    </Option>
  ))
})
