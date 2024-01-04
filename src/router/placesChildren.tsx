import { buildNavs } from '../modules/navs'

export const placesChildren = ({ db, level }) => [
  {
    path: 'checks',
    element: null,
    handle: {
      crumb: () => ({
        text: 'Checks',
        table: 'checks',
        folder: true,
        level
      }),
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/checks'),
      },
      {
        path: ':check_id',
        element: null,
        handle: {
          crumb: (match) => ({
            text: match.params.check_id,
            table: 'checks',
            folder: false,
            level
          }),
          to: async (match) =>
            await buildNavs({
              table: `checks`,
              ...match.params,
              db,
              level
            }),
        },
        children: [
          {
            index: true,
            lazy: () => import('../routes/check'),
          },
          {
            path: 'values',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Values',
                table: 'check_values',
                folder: true,
              }),
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/checkValues'),
              },
              {
                path: ':check_value_id',
                lazy: () => import('../routes/checkValue'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.check_value_id,
                    table: 'check_values',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'taxa',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Taxa',
                table: 'check_taxa',
                folder: true,
              }),
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/checkTaxa'),
              },
              {
                path: ':check_taxon_id',
                lazy: () => import('../routes/checkTaxon'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.check_taxon_id,
                    table: 'check_taxa',
                    folder: false,
                  }),
                },
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
      crumb: () => ({
        text: 'Actions',
        table: 'actions',
        folder: true,
      }),
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/actions'),
      },
      {
        path: ':action_id',
        element: null,
        handle: {
          crumb: (match) => ({
            text: match.params.action_id,
            table: 'actions',
            folder: false,
          }),
          to: async (match) =>
            await buildNavs({
              table: `actions`,
              ...match.params,
              db,
              level
            }),
        },
        children: [
          {
            index: true,
            lazy: () => import('../routes/action'),
          },
          {
            path: 'values',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Values',
                table: 'action_values',
                folder: true,
              }),
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/actionValues'),
              },
              {
                path: ':action_value_id',
                lazy: () => import('../routes/actionValue'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.action_value_id,
                    table: 'action_values',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'reports',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Reports',
                table: 'action_reports',
                folder: true,
              }),
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/actionReports'),
              },
              {
                path: ':action_report_id',
                element: null,
                handle: {
                  crumb: (match) => ({
                    text: match.params.action_report_id,
                    table: 'action_reports',
                    folder: false,
                  }),
                  to: async (match) =>
                    await buildNavs({
                      table: `action_reports`,
                      ...match.params,
                      db,
                      level
                    }),
                },
                children: [
                  {
                    index: true,
                    lazy: () => import('../routes/actionReport'),
                  },
                  {
                    path: 'values',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Values',
                        table: 'action_report_values',
                        folder: true,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('../routes/actionReportValues'),
                      },
                      {
                        path: ':action_report_value_id',
                        lazy: () => import('../routes/actionReportValue'),
                        handle: {
                          crumb: (match) => ({
                            text: match.params.action_report_value_id,
                            table: 'action_report_values',
                            folder: false,
                          }),
                        },
                      },
                    ],
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
      crumb: () => ({
        text: 'Reports',
        table: 'place_reports',
        folder: true,
      }),
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/placeReports'),
      },
      {
        path: ':place_report_id',
        element: null,
        handle: {
          crumb: (match) => ({
            text: match.params.place_report_id,
            table: 'place_reports',
            folder: false,
          }),
          to: async (match) =>
            await buildNavs({
              table: `place_reports`,
              ...match.params,
              db,
              level
            }),
        },
        children: [
          {
            index: true,
            lazy: () => import('../routes/placeReport'),
          },
          {
            path: 'values',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Values',
                table: 'place_report_values',
                folder: true,
              }),
            },
            children: [
              {
                index: true,
                lazy: () => import('../routes/placeReportValues'),
              },
              {
                path: ':place_report_value_id',
                lazy: () => import('../routes/placeReportValue'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.place_report_value_id,
                    table: 'place_report_values',
                    folder: false,
                  }),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'users',
    element: null,
    handle: {
      crumb: () => ({
        text: 'Users',
        table: 'place_users',
        folder: true,
      }),
    },
    children: [
      {
        index: true,
        lazy: () => import('../routes/placeUsers'),
      },
      {
        path: ':place_user_id',
        lazy: () => import('../routes/placeUser'),
        handle: {
          crumb: (match) => ({
            text: match.params.place_user_id,
            table: 'place_users',
            folder: false,
          }),
        },
      },
    ],
  },
]
