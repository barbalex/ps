import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ChartSubjectNode } from './ChartSubject.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useChartSubjectsNavData } from '../../modules/useChartSubjectsNavData.ts'

interface Props {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  chartId: string
  level: number
}

export const ChartSubjectsNode = memo(
  ({ projectId, subprojectId, placeId, placeId2, chartId, level }: Props) => {
    const navigate = useNavigate()

    const { navData } = useChartSubjectsNavData({
      projectId,
      subprojectId,
      placeId,
      placeId2,
      chartId,
    })
    const {
      label,
      parentUrl,
      ownArray,
      ownUrl,
      urlPath,
      isOpen,
      isInActiveNodeArray,
      isActive,
      navs,
    } = navData

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({ to: parentUrl })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentUrl,
      urlPath.length,
    ])

    return (
      <>
        <Node
          label={label}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={navs.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          navs.map((chartSubject) => (
            <ChartSubjectNode
              key={chartSubject.chart_subject_id}
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              chartId={chartId}
              chartSubject={chartSubject}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
