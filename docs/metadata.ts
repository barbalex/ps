export type DocMeta = {
  id: string // slugified title: lowercase, spaces → '-'
  label_de: string // display title in German (fallback)
  label_en?: string
  label_fr?: string
  label_it?: string
  isTechnical: boolean
}

export const docsMeta: DocMeta[] = [
  {
    id: 'technical-requirements',
    label_de: 'Technische Anforderungen',
    label_en: 'Technical Requirements',
    label_fr: 'Exigences techniques',
    label_it: 'Requisiti tecnici',
    isTechnical: false,
  },
  {
    id: 'offline',
    label_de: 'Offline arbeiten',
    label_en: 'Working offline',
    label_fr: 'Travailler hors ligne',
    label_it: 'Lavorare offline',
    isTechnical: false,
  },
  {
    id: 'quality-controls',
    label_de: 'Qualitätskontrollen',
    label_en: 'Quality Controls',
    label_fr: 'Contrôles de qualité',
    label_it: 'Controlli di qualità',
    isTechnical: false,
  },
  {
    id: 'open-source',
    label_de: 'Open Source',
    label_en: 'Open Source',
    label_fr: 'Open Source',
    label_it: 'Open Source',
    isTechnical: false,
  },
  {
    id: 'issues',
    label_de: 'Rückmeldungen und Fehler',
    label_en: 'Feedback and Issues',
    label_fr: 'Commentaires et problèmes',
    label_it: 'Feedback e problemi',
    isTechnical: false,
  },
  {
    id: 'technologies',
    label_de: 'Verwendete Technologien',
    label_en: 'Used Technologies',
    label_fr: 'Technologies utilisées',
    label_it: 'Tecnologie utilizzate',
    isTechnical: true,
  },
  {
    id: 'swipe-to-delete-in-lists',
    label_de: 'Mit Wischen löschen in Listen',
    label_en: 'Swipe to delete in lists',
    label_fr: 'Glisser pour supprimer dans les listes',
    label_it: 'Scorri per eliminare nelle liste',
    isTechnical: true,
  },
]
