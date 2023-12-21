import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { MenuComponent } from './Menu'
import { useElectric } from '../../ElectricProvider'
import { idFieldFromTable } from '../../modules/idFieldFromTable'

const tablesWithoutDeleted = ['root', 'docs', 'accounts', 'messages']

export const Breadcrumb = ({ match }) => {
  const navigate = useNavigate()

  const { text, table } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  const idField = idFieldFromTable(table)
  // filter by parents
  const filterParams = {  }
  if (!tablesWithoutDeleted.includes(table)) {{
    filterParams.deleted = false
  }

  const parentFilterParamsArray = Object.entries(match.params).filter(
    ([key, value]) => key !== idField, // eslint-disable-line @typescript-eslint/no-unused-vars
  )
  parentFilterParamsArray.forEach(([key, value]) => {
    filterParams[key] = value
  })

  const { db } = useElectric()
  const queryTable = table === 'root' || table === 'docs' ? 'projects' : table
  const { results } = useLiveQuery(
    () => db[queryTable]?.liveMany({ where: filterParams }),
    [db, table],
  )

  const myNavs = (results ?? []).map((result) => {
    const path = `${match.pathname}/${result[idField]}`
    // console.log('Breadcrumb, path', { path, idField, result, table })

    return {
      path,
      text: result.label ?? result[idField],
    }
  })

  console.log('BreadcrumbForData', {
    myNavs,
    match,
    results,
    idField,
    parentFilterParamsArray,
    table,
    queryTable,
    filterParams,
  })

  return (
    <>
      <div className={className} onClick={() => navigate(match.pathname)}>
        <div className="text">{text}</div>
        {myNavs?.length > 0 && <MenuComponent navs={myNavs} />}
      </div>
    </>
  )
}
