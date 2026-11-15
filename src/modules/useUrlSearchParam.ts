import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'

// Generic single-value search params for page-local view state (e.g. the
// label filter and onlyWithResults toggle on qcs/exports run pages). Keys
// must be registered in modules/urlSearchKeys.ts to survive navigation.
// Empty/false values remove the param. Not persisted anywhere else: the url
// is the only source.

const navigateReplace =
  (navigate: ReturnType<typeof useNavigate>, key: string) =>
  (value: string | boolean | undefined) =>
    navigate(
      {
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          [key]: value === undefined || value === '' || value === false ?
              undefined
            : value,
        }),
        replace: true,
      } as unknown as Parameters<typeof navigate>[0],
    )

export const useStringSearchParam = (key: string) => {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const raw = search[key]
  const value = useMemo(
    () => (typeof raw === 'string' ? raw : ''),
    [raw],
  )
  return [value, navigateReplace(navigate, key)] as const
}

export const useBooleanSearchParam = (key: string) => {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const raw = search[key]
  // parseSearch JSON-parses 1/0/true/false, links may also carry strings
  const value = useMemo(
    () => raw === true || raw === 1 || raw === '1' || raw === 'true',
    [raw],
  )
  return [value, navigateReplace(navigate, key)] as const
}
