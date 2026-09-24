/**
 * Puck identifies each design item by `props.id`: it is the React key of the
 * editor's drop-zone children and the index key of its node store. Designs
 * whose items lack the id (seeded before ids existed, or written by hand)
 * collapse in the editor — every position renders the last item and React
 * logs duplicate-key warnings. Printing is unaffected (it maps the content
 * array directly), so the bug only shows in the design editor's preview.
 *
 * This helper adds ids where missing. Puck's own convention is
 * `${type}-${uuid}`; we derive `${type}-${counter}` instead so repeated
 * calls on the same unchanged design produce identical ids and components
 * keep their state across re-renders. The first save from the editor
 * persists the ids, healing the stored design.
 */
const isPuckItem = (
  value: unknown,
): value is { type: unknown; props: Record<string, unknown> } =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  'props' in value

export const normalizePuckDesign = <T>(design: T): T => {
  if (!design || typeof design !== 'object') return design

  const usedIds = new Set<string>()
  let counter = 0
  const idFor = (type: unknown) => {
    let id = `${type}-${counter++}`
    while (usedIds.has(id)) id = `${type}-${counter++}`
    usedIds.add(id)
    return id
  }

  const normalizeItem = (item: unknown): unknown => {
    if (!isPuckItem(item)) return item
    const props = { ...item.props }
    if (typeof props.id === 'string' && props.id !== '') {
      usedIds.add(props.id)
    } else {
      props.id = idFor(item.type)
    }
    // slot fields hold nested item arrays that need ids just the same
    for (const [key, value] of Object.entries(props)) {
      if (Array.isArray(value)) props[key] = value.map(normalizeItem)
    }
    return { ...item, props }
  }

  const designRecord = design as Record<string, unknown>
  const normalized: Record<string, unknown> = { ...designRecord }
  if (Array.isArray(designRecord.content)) {
    normalized.content = designRecord.content.map(normalizeItem)
  }
  if (designRecord.zones && typeof designRecord.zones === 'object') {
    normalized.zones = Object.fromEntries(
      Object.entries(designRecord.zones as Record<string, unknown>).map(
        ([zone, content]) => [
          zone,
          Array.isArray(content) ? content.map(normalizeItem) : content,
        ],
      ),
    )
  }
  return normalized as T
}
