import type { ChangeEvent } from 'react'

// Change payload shared by the form field components: Fluent's inputs pass
// { value }, checkboxes and switches pass { checked }, and the option
// widgets signal deselection with an explicit null value or checked.
export type FieldChangeData = {
  value?: string | null
  checked?: 'mixed' | boolean | null
}

// Handler signature shared by all form field components.
// The event is kept wide (HTMLElement) because handlers are passed unchanged
// between fields of different element types (input, textarea, select) and are
// also invoked with synthetic events ({ target: { name, value } }).
export type FieldChangeHandler = (
  ev: ChangeEvent<HTMLElement>,
  data?: FieldChangeData,
) => void
