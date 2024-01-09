import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import './breadcrumb.css'
import { MenuComponent } from './Menu'
import { useElectric } from '../../ElectricProvider'
import { idFieldFromTable } from '../../modules/idFieldFromTable'

export const tablesWithoutDeleted = ['root', 'docs', 'accounts', 'messages']

const isOdd = (num) => num % 2

export const Breadcrumb = ({ match }) => {
  const navigate = useNavigate()

  const { text, table } = match?.handle?.crumb?.(match) ?? {}
  const className =
    location.pathname === match.pathname
      ? 'breadcrumbs__crumb is-active'
      : 'breadcrumbs__crumb link'

  const path = match.pathname.split('/').filter((p) => p !== '')
  const placesCount = path.filter((p) => p.includes('places')).length
  const levelWanted = placesCount < 2 ? 1 : 2

  const idField = idFieldFromTable(table)
  // filter by parents
  const filterParams = {}
  if (!tablesWithoutDeleted.includes(table)) {
    filterParams.deleted = false
  }

  // Add only the last to the filter
  // Wanted to get it from params. But not useable because also contains lower level ids!!!
  // so need to get it from path which does NOT contain lower levels
  // if length is divisable by two, then it is a parent id
  const indexOfParentId =
    path.length > 1
      ? isOdd(path.length)
        ? path.length - 2
        : path.length - 1
      : undefined
  const parentId = indexOfParentId ? path[indexOfParentId] : undefined
  // need to get the name from the parents as in path is altered
  // for instance: place_report_values > values
  const parentIdName = Object.keys(match.params)
    .find((key) => match.params[key] === parentId)
    ?.replace('place_id2', 'place_id')
  const placesCountInPath = path.filter((p) => p.includes('places')).length
  if (parentIdName && parentId) {
    if (table === 'places' && placesCountInPath === 2) {
      filterParams.parent_id = match.params.place_id
    } else if (table === 'places') {
      filterParams[parentIdName] = parentId
      filterParams.parent_id = null
    } else {
      filterParams[parentIdName] = parentId
    }
  }
  const queryParam = { where: filterParams }
  // TODO: test including
  // if (table === 'projects') {
  //   queryParam.include = { subprojects: true }
  // }
  // if (table === 'subprojects') {
  //   queryParam.include = { projects: true }
  // }
  // TODO: include referenced tables needed for the label
  // TODO: this results in zod error: invalid type. expected string, received null
  // https://github.com/electric-sql/electric/issues/782
  // if (table.endsWith('_values')) {
  //   queryParam.include = { units: true }
  // }

  const { db } = useElectric()
  const queryTable = table === 'root' || table === 'docs' ? 'projects' : table

  const { results } = useLiveQuery(db[queryTable]?.liveMany(queryParam))

  const myNavs = (results ?? []).map((result) => ({
    path: `${match.pathname}/${result[idField]}`,
    text: result.label ?? result[idField],
  }))

  const [label, setLabel] = useState(text)
  useEffect(() => {
    const get = async () => {
      if (table !== 'places') return
      const placeLevels =
        (await db.place_levels?.findMany({
          where: {
            project_id: match.params.project_id,
            deleted: false,
            level: levelWanted,
          },
        })) ?? []
      const levelRow = placeLevels[0]
      const label = levelRow?.name_plural ?? levelRow?.name_short ?? 'Places'
      setLabel(label)
    }
    get()
  }, [db, levelWanted, match, match.params, match.params.project_id, table])

  // console.log('BreadcrumbForData', {
  //   table,
  //   params: match.params,
  //   text,
  //   label,
  //   results,
  //   pathname: match.pathname,
  //   myNavs,
  //   filterParams,
  //   idField,
  //   path,
  //   parentId,
  //   parentIdName
  // })

  return (
    <>
      <div className={className} onClick={() => navigate(match.pathname)}>
        <div className="text">{label}</div>
        {myNavs?.length > 0 && <MenuComponent navs={myNavs} />}
      </div>
    </>
  )
}
