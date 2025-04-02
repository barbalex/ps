import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useProjectNavData } from '../modules/useProjectNavData.ts'
import { ListHeader } from '../../components/ListHeader.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/projects/$projectId/'

export const ProjectList = memo(() => {
  const { projectId } = useParams({ from })
  const { loading, navData } = useProjectNavData({ projectId })
  const { navs, label, nameSingular } = navData

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
      />
    </div>
  )
})
