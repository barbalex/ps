import React from 'react'
import { createBrowserRouter } from 'react-router'

import { ErrorPage } from '../routes/error.tsx'
import { placesChildren } from './placesChildren.tsx'
import { placesLevel2 } from './placesLevel2.tsx'

import { Filter } from '../components/shared/Filter/index.tsx'

export const router = () => {
  // confirmed: this is called only once
  // console.log('router building')

  return createBrowserRouter([
    {
      path: 'places',
      element: null,
      handle: {
        crumb: {
          text: 'Places',
          table: 'places',
          level: 1,
          folder: true,
        },
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/places.tsx'),
        },
        {
          path: 'filter',
          element: <Filter level={1} />,
          children: [
            {
              index: true,
              lazy: () => import('../routes/place/Form.tsx'),
            },
          ],
        },
        {
          path: ':place_id',
          element: null,
          handle: {
            crumb: {
              table: 'places',
              level: 1,
              folder: false,
            },
            to: {
              table: `places`,
            },
          },
          children: [
            {
              index: true,
              lazy: () => import('../routes/place/index.tsx'),
            },
            placesLevel2(),
            ...placesChildren({ level: 1 }),
          ],
        },
      ],
    },
    {
      path: 'files',
      element: null,
      handle: {
        crumb: {
          text: 'Files',
          table: 'files',
          folder: true,
        },
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/files.tsx'),
        },
        {
          path: ':file_id',
          element: null,
          handle: {
            crumb: {
              table: 'files',
              folder: false,
            },
          },
          children: [
            {
              index: true,
              lazy: () => import('../routes/file/index.tsx'),
            },
            {
              path: 'preview',
              lazy: () => import('../routes/filePreview/index.tsx'),
            },
          ],
        },
      ],
    },
    {
      path: 'taxa',
      element: null,
      handle: {
        crumb: {
          text: 'Taxa',
          table: 'subproject_taxa',
          folder: true,
        },
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/subprojectTaxa.tsx'),
        },
        {
          path: ':subproject_taxon_id',
          lazy: () => import('../routes/subprojectTaxon/index.tsx'),
          handle: {
            crumb: {
              table: 'subproject_taxa',
              folder: false,
            },
          },
        },
      ],
    },
    {
      path: 'charts',
      element: null,
      handle: {
        crumb: {
          text: 'Charts',
          table: 'charts',
          folder: true,
        },
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/charts.tsx'),
        },
        {
          path: ':chart_id',
          element: null,
          handle: {
            crumb: {
              table: 'charts',
              folder: false,
            },
            to: {
              table: `charts`,
            },
          },
          children: [
            {
              index: true,
              lazy: () => import('../routes/chart/index.tsx'),
            },
            {
              path: 'subjects',
              element: null,
              handle: {
                crumb: {
                  text: 'Subjects',
                  table: 'chart_subjects',
                  folder: true,
                },
              },
              children: [
                {
                  index: true,
                  lazy: () => import('../routes/chartSubjects.tsx'),
                },
                {
                  path: ':chart_subject_id',
                  lazy: () => import('../routes/chartSubject/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'chart_subjects',
                      folder: false,
                    },
                    to: {
                      table: `chart_subjects`,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ])
}
