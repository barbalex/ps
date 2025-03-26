import { memo, useMemo } from 'react'
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@fluentui/react-components'

export const FilterCollapse = memo(
  ({ ref, navListFilterIsVisible, toggleNavListFilterIsVisible }) => {
    const openItems = useMemo(() => (navListFilterIsVisible ? ['1'] : []), [
      navListFilterIsVisible,
    ])
    
    return (
      <Accordion
        openItems={openItems}
        onToggle={handleToggle}
        collapsible
      >
        <AccordionItem value="1">
          <AccordionPanel>
            <div>Accordion Panel 1</div>
          </AccordionPanel>{' '}
        </AccordionItem>
      </Accordion>
    )
  },
)
