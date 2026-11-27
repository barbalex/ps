import { useContext } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { FaPlus } from 'react-icons/fa'
import {
  MdDownloadDone,
  MdDownloading,
  MdFileDownload,
  MdErrorOutline,
  MdInfoOutline,
  MdPictureAsPdf,
} from 'react-icons/md'
import { useIntl } from 'react-intl'
import { useAtomValue } from 'jotai'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { useMapInfoForm } from '../modules/mapInfoFormContext.ts'
import { useFilesNavData } from '../modules/useFilesNavData.ts'
import { Uploader } from './file/Uploader.tsx'
import { UploaderContext } from '../UploaderContext.ts'
import { offlineFilesStatusAtom } from '../store.ts'
import { fileThumbnailUrl } from '../modules/offlineFiles.ts'

import '../form.css'

// per-row offline state (OfflineFilesManager): only effectively offline
// files appear in the record
const offlineStatusIcons = {
  cached: <MdDownloadDone />,
  downloading: <MdDownloading />,
  queued: <MdFileDownload />,
  error: <MdErrorOutline />,
  'too-large': <MdInfoOutline />,
  'no-url': null,
} as const

export const Files = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
  tableViewId,
  hideTitle = false,
}: {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  actionId?: string
  checkId?: string
  tableViewId?: string
  hideTitle?: boolean
}) => {
  const mapChildren = useMapInfoForm()
  const { loading, navData, isFiltered } = useFilesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    checkId,
    tableViewId,
  })
  const { navs, label, nameSingular } = navData

  const uploaderCtx = useContext(UploaderContext) as unknown as {
    current?:
      | (HTMLElement & {
          getAPI?: () => {
            initFlow?: () => void
          }
        })
      | null
  }
  const { formatMessage } = useIntl()
  const api = uploaderCtx?.current?.getAPI?.()
  const onClickAdd = () => api?.initFlow?.()
  const offlineStatuses = useAtomValue(offlineFilesStatusAtom)

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to SQLite
  return (
    <div className="list-view">
      {!hideTitle && !mapChildren && (
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
            .map(({ id, label, url, mimetype, preview_uuid }) => {
              const imgSrc = fileThumbnailUrl(url, mimetype, preview_uuid)

              const offlineStatus = offlineStatuses[id]
              const offlineIcon = offlineStatusIcons[offlineStatus]
              const labelContent =
                offlineIcon ?
                  <>
                    {label ?? id}
                    <span
                      style={{ marginLeft: 6, display: 'inline-flex' }}
                      title={offlineStatus}
                    >
                      {offlineIcon}
                    </span>
                  </>
                : label ?? id

              return (
                <Row
                  key={id}
                  label={labelContent}
                  to={id}
                  imgSrc={imgSrc}
                  imgPlaceholder={mimetype === 'application/pdf' ? <MdPictureAsPdf aria-label="PDF" size={24} /> : undefined}
                  lastHasImages={true}
                />
              )
            })
        )}
      </div>
    </div>
  )
}
