import { useContext } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { FaPlus } from 'react-icons/fa'
import { useIntl } from 'react-intl'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { useFilesNavData } from '../modules/useFilesNavData.ts'
import { Uploader } from './file/Uploader.tsx'
import { UploaderContext } from '../UploaderContext.ts'

import '../form.css'

export const Files = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
  hideTitle = false,
}) => {
  const { loading, navData, isFiltered } = useFilesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    checkId,
  })
  const { navs, label, nameSingular } = navData

  const uploaderCtx = useContext(UploaderContext)
  const { formatMessage } = useIntl()
  const api = uploaderCtx?.current?.getAPI?.()
  const onClickAdd = () => api?.initFlow?.()

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to SQLite
  return (
    <div className="list-view">
      {!hideTitle && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          menus={[
            <FilterButton key="filter" isFiltered={isFiltered} />,
            <Button
              key="add"
              size="medium"
              title={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
              icon={<FaPlus />}
              onClick={onClickAdd}
            />,
          ]}
        />
      )}
      <div className="list-container">
        <Uploader
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId2 ?? placeId}
          actionId={actionId}
          checkId={checkId}
        />
        {loading ? (
          <Loading />
        ) : (
          navs
            .filter((nav) => nav.id)
            .map(({ id, label, url, mimetype }) => {
              let imgSrc = undefined
              if (
                (mimetype?.includes?.('image') ||
                  mimetype?.includes?.('pdf')) &&
                url
              ) {
                imgSrc = `${url}-/resize/x50/-/format/auto/-/quality/smart/`
              }

              return (
                <Row
                  key={id}
                  label={label ?? id}
                  to={id}
                  imgSrc={imgSrc}
                  lastHasImages={true}
                />
              )
            })
        )}
      </div>
    </div>
  )
}
