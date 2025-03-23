export const placesChildren = ({ level }) => [
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
