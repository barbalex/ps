export type DocMeta = {
  id: string // slugified title: lowercase, spaces → '-'
  label_de: string // display title in German (fallback)
  label_en?: string
  label_fr?: string
  label_it?: string
  order: number
  isTechnical: boolean
}

export const docsMeta: DocMeta[] = [
  {
    id: 'swipe-to-delete-in-lists',
    label_de: 'Mit Wischen löschen in Listen',
    label_en: 'Swipe to delete in lists',
    label_fr: 'Glisser pour supprimer dans les listes',
    label_it: 'Scorri per eliminare nelle liste',
    order: 1,
    isTechnical: false,
  },
]
