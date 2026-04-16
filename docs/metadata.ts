export type DocMeta = {
  id: string // slugified title: lowercase, spaces → '-'
  label: string // display title
  order: number
  isTechnical: boolean
}

export const docsMeta: DocMeta[] = [
  {
    id: 'swipe-to-delete-in-lists',
    label: 'Swipe to delete in lists',
    order: 1,
    isTechnical: false,
  },
]
