import { OverflowItem } from '@fluentui/react-components'

import { BreadcrumbForData } from './BreadcrumbForData.tsx'
import { BreadcrumbForFolder } from './BreadcrumbForFolder.tsx'

// problem: menu is not rendered after width changes
// solution: rerender after width changes
export const Matches = ({ rerenderInteger, matches }) =>
  matches.map((match) => {
    const { table, folder } = match?.handle?.crumb ?? {}

    return (
      <OverflowItem key={`${match.id}/${rerenderInteger}`} id={match.id}>
        {table === 'root' || folder === false ? (
          <BreadcrumbForFolder match={match} />
        ) : (
          <BreadcrumbForData match={match} />
        )}
      </OverflowItem>
    )
  })
