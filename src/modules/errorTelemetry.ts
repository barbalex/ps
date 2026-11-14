// opt-in client error telemetry posting into the public.error_report table
// through PostgREST. Privacy by default: unless VITE_ERROR_TELEMETRY is set
// to 'true' at build time (Netlify env var), every function here is a no-op
// and nothing leaves the browser.
//
// The endpoint is derived from constants.getPostgrestUri() at runtime
// instead of a baked-in URL: the app is served from several hosts and each
// resolves its PostgREST base differently (localhost:3002 in dev,
// same-origin /api on arten-fördern.ch, api.<domain> otherwise).
//
// Payload discipline — send only what is needed to reproduce an error:
// message, stack, url (path + search), user agent, release. No user id, no
// user name, no localStorage, no extra DOM state. Stacks reference the
// deployed chunk urls, which are content-hashed per release.

import { constants } from './constants.ts'

declare const __APP_VERSION__: string

const enabled = import.meta.env.VITE_ERROR_TELEMETRY === 'true'

// browser noise that reaches window as an error event but has no app
// impact: Chrome emits these from its ResizeObserver loop detector and
// defers the work to the next frame on its own. Unfiltered they were
// the most frequent rows in apflora's error_report (and would keep
// pinging the phone notifier).
const benignMessages = [
  'ResizeObserver loop completed with undelivered notifications',
  'ResizeObserver loop limit exceeded',
]

// hard caps so a broken release cannot flood the collector or loop
const maxEventsPerSession = 25
const maxRepeatsPerMessage = 3
const maxMessageLength = 2_000
const maxStackLength = 5_000

let sentEvents = 0
const sentPerMessage = new Map<string, number>()

export type ErrorKind =
  'window.error' | 'unhandledrejection' | 'boundary' | 'manual'

export interface ErrorTelemetryEvent {
  release: string
  timestamp: string
  kind: ErrorKind
  message: string
  stack?: string | undefined
  url: string
  userAgent: string
}

const clip = (value: string | undefined, max: number) =>
  value ? value.slice(0, max) : undefined

const buildEvent = (
  kind: ErrorKind,
  error: unknown,
): ErrorTelemetryEvent | undefined => {
  const message =
    error instanceof Error ? error.message
    : typeof error === 'string' ? error
    : (JSON.stringify(error) ?? 'unknown error')
  if (!message) return undefined
  if (benignMessages.some((m) => message.startsWith(m))) return undefined
  return {
    release: __APP_VERSION__,
    timestamp: new Date().toISOString(),
    kind,
    message: message.slice(0, maxMessageLength),
    stack: clip(
      error instanceof Error ? error.stack : undefined,
      maxStackLength,
    ),
    url: `${window.location.pathname}${window.location.search}`,
    userAgent: navigator.userAgent,
  }
}

export const reportError = (kind: ErrorKind, error: unknown): Promise<void> => {
  if (!enabled) return Promise.resolve()

  const event = buildEvent(kind, error)
  if (!event) return Promise.resolve()

  if (sentEvents >= maxEventsPerSession) return Promise.resolve()
  const repeats = sentPerMessage.get(event.message) ?? 0
  if (repeats >= maxRepeatsPerMessage) return Promise.resolve()
  sentPerMessage.set(event.message, repeats + 1)
  sentEvents++

  // the collector is a PostgREST table (public.error_report): the body
  // must contain exactly its columns — created_at is stamped server-side,
  // user_agent is snake_case on the wire
  return fetch(`${constants.getPostgrestUri()}/error_report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      release: event.release,
      kind: event.kind,
      message: event.message,
      stack: event.stack,
      url: event.url,
      user_agent: event.userAgent,
    }),
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined)
}

// install global handlers. Called once from main.tsx
export const installErrorTelemetry = () => {
  if (!enabled) return

  window.addEventListener('error', (event) => {
    void reportError('window.error', event.error ?? event.message)
  })
  window.addEventListener('unhandledrejection', (event) => {
    void reportError('unhandledrejection', event.reason)
  })
}
