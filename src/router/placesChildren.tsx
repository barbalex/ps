export const placesChildren = ({ level }) => [
  {
    path: 'occurrences-assigned',
    element: null,
    handle: {
      crumb: {
        text: 'Occurrences assigned',
        table: 'occurrences',
        folder: true,
      },
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/occurrences.tsx'),
      },
      {
        path: ':occurrence_id',
        lazy: () => import('../routes/occurrence/index.tsx'),
        handle: {
          crumb: {
            table: 'occurrences',
            folder: false,
          },
        },
      },
    ],
  },
  {
    path: 'users',
    element: null,
    handle: {
      crumb: {
        text: 'Users',
        table: 'place_users',
        folder: true,
      },
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/placeUsers.tsx'),
      },
      {
        path: ':place_user_id',
        lazy: () => import('../routes/placeUser/index.tsx'),
        handle: {
          crumb: {
            table: 'place_users',
            folder: false,
          },
        },
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
      { index: true, lazy: () => import('../routes/files.tsx') },
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
]
