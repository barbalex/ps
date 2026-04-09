import enMessages from '../i18n/en.json'
import frMessages from '../i18n/fr.json'
import itMessages from '../i18n/it.json'

const deMessages = {
  '1noM6i': '{place}: Massnahmen',
  '3aMKkP': '{place}: Beobachtungs-Zuordnungslinien',
  '3oZh5s': 'Beobachtungen nicht zuzuordnen',
  '5xrddR': '{place}: Beobachtungen zugeordnet',
  'OaXR/X': 'Beobachtungen zugeordnet',
  'WJk01v': '{place}: Kontrollen',
  aeUjud: 'Beobachtungen zu beurteilen',
  'eJfllL': 'Massnahmen',
  h5g7Kk: 'Orte',
  'oPMDm+': 'Kontrollen',
} as const

const messagesByLanguage = {
  de: deMessages,
  en: enMessages,
  fr: frMessages,
  it: itMessages,
} as const

const interpolate = (
  template: string,
  values: Record<string, string | number> = {},
) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`))

const getMessage = (language: string, id: string, fallback: string) => {
  const messages =
    messagesByLanguage[language as keyof typeof messagesByLanguage] ??
    messagesByLanguage.de

  return (messages as Record<string, string>)[id] ?? fallback
}

export const getOwnLayerLabels = (language: string) => {
  const placesLabel = getMessage(language, 'h5g7Kk', deMessages.h5g7Kk)
  const actionsLabel = getMessage(language, 'eJfllL', deMessages.eJfllL)
  const checksLabel = getMessage(language, 'oPMDm+', deMessages['oPMDm+'])
  const observationsAssignedLabel = getMessage(
    language,
    'OaXR/X',
    deMessages['OaXR/X'],
  )
  const observationsToAssessLabel = getMessage(
    language,
    'aeUjud',
    deMessages.aeUjud,
  )
  const observationsNotToAssignLabel = getMessage(
    language,
    '3oZh5s',
    deMessages['3oZh5s'],
  )

  return {
    placesLabel,
    actionsLabel,
    checksLabel,
    observationsAssignedLabel,
    observationsToAssessLabel,
    observationsNotToAssignLabel,
    actionsByPlaceLabel: (place: string) =>
      interpolate(getMessage(language, '1noM6i', deMessages['1noM6i']), {
        place,
      }),
    checksByPlaceLabel: (place: string) =>
      interpolate(getMessage(language, 'WJk01v', deMessages['WJk01v']), {
        place,
      }),
    observationsAssignedByPlaceLabel: (place: string) =>
      interpolate(getMessage(language, '5xrddR', deMessages['5xrddR']), {
        place,
      }),
    observationsAssignedLinesLabel: (place: string) =>
      interpolate(getMessage(language, '3aMKkP', deMessages['3aMKkP']), {
        place,
      }),
  }
}