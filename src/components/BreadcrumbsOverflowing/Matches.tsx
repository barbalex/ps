import { OverflowItem } from '@fluentui/react-components'

import { BreadcrumbForData } from './BreadcrumbForData'
import { BreadcrumbForFolder } from './BreadcrumbForFolder'
import './breadcrumbs.css'

// problem: menu is not rendered after width changes
// solution: rerender after width changes
export const Matches = ({ rerenderInteger, matches, width }) => {
  console.log('Matches, width:', width)

  return ( matches.map((match) => {
        const { table, folder } = match?.handle?.crumb?.(match) ?? {}

        return (
          <OverflowItem key={`${match.id}/${rerenderInteger}`} id={match.id}>
            {table === 'root' || folder === false ? (
              <BreadcrumbForFolder match={match} />
            ) : (
              <BreadcrumbForData match={match} />
            )}
          </OverflowItem>
        )
      }
  ))
}
