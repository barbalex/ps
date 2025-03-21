import { useCallback } from 'react'
import { MenuItem as MenuItemComponent } from '@fluentui/react-components'
import { useNavigate, useSearchParams } from 'react-router'

export const MenuItem = ({ path, text }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onClick = useCallback(() => {
    // why do I need this timeout?
    setTimeout(() => {
      navigate({ to: path, search: searchParams.toString() }), 100
    })
  }, [navigate, path, searchParams])

  return <MenuItemComponent onClick={onClick}>{text}</MenuItemComponent>
}
