import { Filter } from '../components/shared/Filter/index.tsx'

export const placesChildren = ({ level }) => [
  {
    path: 'checks',
    element: null,
    handle: {
      crumb: {
        text: 'Checks',
        table: 'checks',
        folder: true,
        level,
      },
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/checks.tsx'),
      },
      {
        path: 'filter',
        element: <Filter level={level} />,
        children: [
          {
            index: true,
            lazy: () => import('../routes/check/Form.tsx'),
          },
        ],
      },
      {
        path: ':check_id',
        element: null,
        handle: {
          crumb: {
            table: 'checks',
            folder: false,
            level,
          },
          to: {
            table: `checks`,
            level,
          },
        },
        children: [
          {
            index: true,
            lazy: () => import('../routes/check/index.tsx'),
          },
          {
            path: 'values',
            element: null,
            handle: {
              crumb: {
                text: 'Values',
                table: 'check_values',
                folder: true,
              },
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/checkValues.tsx'),
              },
              {
                path: ':check_value_id',
                lazy: () => import('../routes/checkValue/index.tsx'),
                handle: {
                  crumb: {
                    table: 'check_values',
                    folder: false,
                  },
                },
              },
            ],
          },
          {
            path: 'taxa',
            element: null,
            handle: {
              crumb: {
                text: 'Taxa',
                table: 'check_taxa',
                folder: true,
              },
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/checkTaxa.tsx'),
              },
              {
                path: ':check_taxon_id',
                lazy: () => import('../routes/checkTaxon/index.tsx'),
                handle: {
                  crumb: {
                    table: 'check_taxa',
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
        ],
      },
    ],
  },
  {
    path: 'actions',
    element: null,
    handle: {
      crumb: {
        text: 'Actions',
        table: 'actions',
        folder: true,
      },
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/actions.tsx'),
      },
      {
        path: 'filter',
        element: <Filter level={level} />,
        children: [
          {
            index: true,
            lazy: () => import('../routes/action/Form.tsx'),
          },
        ],
      },
      {
        path: ':action_id',
        element: null,
        handle: {
          crumb: {
            table: 'actions',
            folder: false,
          },
          to: {
            table: `actions`,
            level,
          },
        },
        children: [
          {
            index: true,
            lazy: () => import('../routes/action/index.tsx'),
          },
          {
            path: 'values',
            element: null,
            handle: {
              crumb: {
                text: 'Values',
                table: 'action_values',
                folder: true,
              },
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/actionValues.tsx'),
              },
              {
                path: ':action_value_id',
                lazy: () => import('../routes/actionValue/index.tsx'),
                handle: {
                  crumb: {
                    table: 'action_values',
                    folder: false,
                  },
                },
              },
            ],
          },
          {
            path: 'reports',
            element: null,
            handle: {
              crumb: {
                text: 'Reports',
                table: 'action_reports',
                folder: true,
              },
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/actionReports.tsx'),
              },
              {
                path: ':action_report_id',
                element: null,
                handle: {
                  crumb: {
                    table: 'action_reports',
                    folder: false,
                  },
                  to: {
                    table: `action_reports`,
                    level,
                  },
                },
                children: [
                  {
                    index: true,
                    lazy: () => import('../routes/actionReport/index.tsx'),
                  },
                  {
                    path: 'values',
                    element: null,
                    handle: {
                      crumb: {
                        text: 'Values',
                        table: 'action_report_values',
                        folder: true,
                      },
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('../routes/actionReportValues.tsx'),
                      },
                      {
                        path: ':action_report_value_id',
                        lazy: () =>
                          import('../routes/actionReportValue/index.tsx'),
                        handle: {
                          crumb: {
                            table: 'action_report_values',
                            folder: false,
                          },
                        },
                      },
                    ],
                  },
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
        ],
      },
    ],
  },
  {
    path: 'reports',
    element: null,
    handle: {
      crumb: {
        text: 'Reports',
        table: 'place_reports',
        folder: true,
      },
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/placeReports.tsx'),
      },
      {
        path: 'filter',
        element: <Filter level={level} />,
        children: [
          {
            index: true,
            lazy: () => import('../routes/placeReport/Form.tsx'),
          },
        ],
      },
      {
        path: ':place_report_id',
        element: null,
        handle: {
          crumb: {
            table: 'place_reports',
            folder: false,
          },
          to: {
            table: `place_reports`,
            level,
          },
        },
        children: [
          {
            index: true,
            lazy: () => import('../routes/placeReport/index.tsx'),
          },
          {
            path: 'values',
            element: null,
            handle: {
              crumb: {
                text: 'Values',
                table: 'place_report_values',
                folder: true,
              },
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/placeReportValues.tsx'),
              },
              {
                path: ':place_report_value_id',
                lazy: () => import('../routes/placeReportValue/index.tsx'),
                handle: {
                  crumb: {
                    table: 'place_report_values',
                    folder: false,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
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
